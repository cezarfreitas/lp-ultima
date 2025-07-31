import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const ShowroomSectionUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  background_type: z.enum(["white", "gray", "gradient", "dark"]).optional(),
  layout_type: z.enum(["grid", "masonry", "carousel"]).optional(),
  max_items: z.number().int().min(3).max(24).optional(),
});

const ShowroomCreateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  media_url: z.string().refine(
    (url) => {
      if (!url) return false;
      return url.startsWith("/") || z.string().url().safeParse(url).success;
    },
    { message: "URL da mídia inválida" },
  ),
  media_type: z.enum(["image", "video"]),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

const ShowroomUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  media_url: z
    .string()
    .refine(
      (url) => {
        if (!url) return true;
        return url.startsWith("/") || z.string().url().safeParse(url).success;
      },
      { message: "URL da mídia inválida" },
    )
    .optional(),
  media_type: z.enum(["image", "video"]).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

// Get showroom section with all active items
export const getShowroomSection: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute(
      "SELECT * FROM showroom_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res
        .status(404)
        .json({ error: "Seção de showroom não encontrada" });
    }

    // Get all active showroom items for this section
    const [itemRows] = await pool.execute(
      "SELECT * FROM showroom_items WHERE section_id = ? AND is_active = 1 ORDER BY is_featured DESC, position ASC",
      [section.id],
    );

    const sectionWithItems = {
      ...section,
      items: itemRows,
    };

    res.json(sectionWithItems);
  } catch (error) {
    console.error("Error fetching showroom section:", error);

    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes("doesn't exist")) {
      return res.status(404).json({
        error: "Tabelas de showroom não foram criadas ainda",
        needsMigration: true,
      });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get all showroom items for admin (including inactive)
export const getAllShowroomItems: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute(
      "SELECT * FROM showroom_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res
        .status(404)
        .json({ error: "Seção de showroom não encontrada" });
    }

    // Get all showroom items for this section
    const [itemRows] = await pool.execute(
      "SELECT * FROM showroom_items WHERE section_id = ? ORDER BY position ASC",
      [section.id],
    );

    const sectionWithItems = {
      ...section,
      items: itemRows,
    };

    res.json(sectionWithItems);
  } catch (error) {
    console.error("Error fetching all showroom items:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update showroom section settings
export const updateShowroomSection: RequestHandler = async (req, res) => {
  try {
    const validation = ShowroomSectionUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;
    const updateFields = Object.keys(data).filter(
      (key) => data[key as keyof typeof data] !== undefined,
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    // Build dynamic update query
    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map(
      (field) => data[field as keyof typeof data],
    );

    await pool.execute(
      `UPDATE showroom_section SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM showroom_section LIMIT 1) as temp)`,
      values,
    );

    // Return updated data
    const [rows] = await pool.execute("SELECT * FROM showroom_section LIMIT 1");
    const updatedSection = (rows as any[])[0];

    res.json(updatedSection);
  } catch (error) {
    console.error("Error updating showroom section:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Create new showroom item
export const createShowroomItem: RequestHandler = async (req, res) => {
  try {
    const validation = ShowroomCreateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const {
      title,
      description,
      media_url,
      media_type,
      is_featured,
      is_active,
      position,
    } = validation.data;

    // Get section ID
    const [sectionRows] = await pool.execute(
      "SELECT id FROM showroom_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res
        .status(404)
        .json({ error: "Seção de showroom não encontrada" });
    }

    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const [positionRows] = await pool.execute(
        "SELECT MAX(position) as max_position FROM showroom_items WHERE section_id = ?",
        [section.id],
      );
      const maxPosition = (positionRows as any[])[0].max_position || 0;
      finalPosition = maxPosition + 1;
    }

    const [result] = await pool.execute(
      `
      INSERT INTO showroom_items (section_id, title, description, media_url, media_type, is_featured, is_active, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        section.id,
        title,
        description || "",
        media_url,
        media_type,
        is_featured ?? false,
        is_active ?? true,
        finalPosition,
      ],
    );

    const insertId = (result as any).insertId;

    // Get the created item
    const [rows] = await pool.execute(
      "SELECT * FROM showroom_items WHERE id = ?",
      [insertId],
    );
    const newItem = (rows as any[])[0];

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating showroom item:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update showroom item
export const updateShowroomItem: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const validation = ShowroomUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;
    const updateFields = Object.keys(data).filter(
      (key) => data[key as keyof typeof data] !== undefined,
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    // Build dynamic update query
    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map(
      (field) => data[field as keyof typeof data],
    );

    await pool.execute(
      `UPDATE showroom_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    // Return updated data
    const [rows] = await pool.execute(
      "SELECT * FROM showroom_items WHERE id = ?",
      [id],
    );
    const updatedItem = (rows as any[])[0];

    if (!updatedItem) {
      return res.status(404).json({ error: "Item de showroom não encontrado" });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating showroom item:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Delete showroom item
export const deleteShowroomItem: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [result] = await pool.execute(
      "DELETE FROM showroom_items WHERE id = ?",
      [id],
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Item de showroom não encontrado" });
    }

    res.json({ message: "Item de showroom deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting showroom item:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Reorder showroom items
export const reorderShowroomItems: RequestHandler = async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: "itemIds deve ser um array" });
    }

    // Update positions
    for (let i = 0; i < itemIds.length; i++) {
      await pool.execute(
        "UPDATE showroom_items SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [i + 1, itemIds[i]],
      );
    }

    res.json({ message: "Ordem dos itens de showroom atualizada" });
  } catch (error) {
    console.error("Error reordering showroom items:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

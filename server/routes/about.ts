import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const AboutSectionUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  background_type: z.enum(["white", "gray", "gradient", "dark"]).optional(),
  image_url: z.string().optional(),
  button_text: z.string().optional(),
  button_url: z.string().optional(),
  show_stats: z.boolean().optional(),
});

const AboutStatCreateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório"),
  description: z.string().optional(),
  icon: z.string().min(1, "Ícone é obrigatório"),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

const AboutStatUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

// Get about section with all active stats
export const getAboutSection: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute(
      "SELECT * FROM about_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res.status(404).json({ error: "Seção About não encontrada" });
    }

    // Get all active stats for this section
    const [statRows] = await pool.execute(
      "SELECT * FROM about_stats WHERE section_id = ? AND is_active = 1 ORDER BY position ASC",
      [section.id],
    );

    const sectionWithStats = {
      ...section,
      stats: statRows,
    };

    res.json(sectionWithStats);
  } catch (error) {
    console.error("Error fetching about section:", error);

    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes("doesn't exist")) {
      return res.status(404).json({
        error: "Tabelas de About não foram criadas ainda",
        needsMigration: true,
      });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get all about stats for admin (including inactive)
export const getAllAboutStats: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute(
      "SELECT * FROM about_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res.status(404).json({ error: "Seção About não encontrada" });
    }

    // Get all stats for this section
    const [statRows] = await pool.execute(
      "SELECT * FROM about_stats WHERE section_id = ? ORDER BY position ASC",
      [section.id],
    );

    const sectionWithStats = {
      ...section,
      stats: statRows,
    };

    res.json(sectionWithStats);
  } catch (error) {
    console.error("Error fetching all about stats:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update about section settings
export const updateAboutSection: RequestHandler = async (req, res) => {
  try {
    const validation = AboutSectionUpdateSchema.safeParse(req.body);

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
      `UPDATE about_section SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM about_section LIMIT 1) as temp)`,
      values,
    );

    // Return updated data
    const [rows] = await pool.execute("SELECT * FROM about_section LIMIT 1");
    const updatedSection = (rows as any[])[0];

    res.json(updatedSection);
  } catch (error) {
    console.error("Error updating about section:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Create new about stat
export const createAboutStat: RequestHandler = async (req, res) => {
  try {
    const validation = AboutStatCreateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const { title, value, description, icon, is_active, position } =
      validation.data;

    // Get section ID
    const [sectionRows] = await pool.execute(
      "SELECT id FROM about_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res.status(404).json({ error: "Seção About não encontrada" });
    }

    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const [positionRows] = await pool.execute(
        "SELECT MAX(position) as max_position FROM about_stats WHERE section_id = ?",
        [section.id],
      );
      const maxPosition = (positionRows as any[])[0].max_position || 0;
      finalPosition = maxPosition + 1;
    }

    const [result] = await pool.execute(
      `
      INSERT INTO about_stats (section_id, title, value, description, icon, is_active, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        section.id,
        title,
        value,
        description || "",
        icon,
        is_active ?? true,
        finalPosition,
      ],
    );

    const insertId = (result as any).insertId;

    // Get the created stat
    const [rows] = await pool.execute(
      "SELECT * FROM about_stats WHERE id = ?",
      [insertId],
    );
    const newStat = (rows as any[])[0];

    res.status(201).json(newStat);
  } catch (error) {
    console.error("Error creating about stat:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update about stat
export const updateAboutStat: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const validation = AboutStatUpdateSchema.safeParse(req.body);

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
      `UPDATE about_stats SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    // Return updated data
    const [rows] = await pool.execute(
      "SELECT * FROM about_stats WHERE id = ?",
      [id],
    );
    const updatedStat = (rows as any[])[0];

    if (!updatedStat) {
      return res.status(404).json({ error: "Estatística não encontrada" });
    }

    res.json(updatedStat);
  } catch (error) {
    console.error("Error updating about stat:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Delete about stat
export const deleteAboutStat: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [result] = await pool.execute(
      "DELETE FROM about_stats WHERE id = ?",
      [id],
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Estatística não encontrada" });
    }

    res.json({ message: "Estatística deletada com sucesso" });
  } catch (error) {
    console.error("Error deleting about stat:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Reorder about stats
export const reorderAboutStats: RequestHandler = async (req, res) => {
  try {
    const { statIds } = req.body;

    if (!Array.isArray(statIds)) {
      return res.status(400).json({ error: "statIds deve ser um array" });
    }

    // Update positions
    for (let i = 0; i < statIds.length; i++) {
      await pool.execute(
        "UPDATE about_stats SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [i + 1, statIds[i]],
      );
    }

    res.json({ message: "Ordem das estatísticas atualizada" });
  } catch (error) {
    console.error("Error reordering about stats:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

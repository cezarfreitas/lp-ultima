import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const FAQSectionUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  background_type: z.enum(["white", "gray", "gradient"]).optional(),
  max_faqs: z.number().int().min(1).max(20).optional(),
});

const FAQCreateSchema = z.object({
  question: z.string().min(5, "Pergunta deve ter pelo menos 5 caracteres"),
  answer: z.string().min(10, "Resposta deve ter pelo menos 10 caracteres"),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

const FAQUpdateSchema = z.object({
  question: z.string().min(5).optional(),
  answer: z.string().min(10).optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

// Get FAQ section with all active FAQs
export const getFAQSection: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute(
      "SELECT * FROM faq_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res.status(404).json({ error: "Seção de FAQ não encontrada" });
    }

    // Get all active FAQs for this section
    const [faqRows] = await pool.execute(
      "SELECT * FROM faq_items WHERE section_id = ? AND is_active = 1 ORDER BY position ASC",
      [section.id],
    );

    const sectionWithFAQs = {
      ...section,
      faqs: faqRows,
    };

    res.json(sectionWithFAQs);
  } catch (error) {
    console.error("Error fetching FAQ section:", error);

    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes("doesn't exist")) {
      return res.status(404).json({
        error: "Tabelas de FAQ não foram criadas ainda",
        needsMigration: true,
      });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get all FAQs for admin (including inactive)
export const getAllFAQs: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute(
      "SELECT * FROM faq_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res.status(404).json({ error: "Seção de FAQ não encontrada" });
    }

    // Get all FAQs for this section
    const [faqRows] = await pool.execute(
      "SELECT * FROM faq_items WHERE section_id = ? ORDER BY position ASC",
      [section.id],
    );

    const sectionWithFAQs = {
      ...section,
      faqs: faqRows,
    };

    res.json(sectionWithFAQs);
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update FAQ section settings
export const updateFAQSection: RequestHandler = async (req, res) => {
  try {
    const validation = FAQSectionUpdateSchema.safeParse(req.body);

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
      `UPDATE faq_section SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM faq_section LIMIT 1) as temp)`,
      values,
    );

    // Return updated data
    const [rows] = await pool.execute("SELECT * FROM faq_section LIMIT 1");
    const updatedSection = (rows as any[])[0];

    res.json(updatedSection);
  } catch (error) {
    console.error("Error updating FAQ section:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Create new FAQ
export const createFAQ: RequestHandler = async (req, res) => {
  try {
    const validation = FAQCreateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const { question, answer, is_active, position } = validation.data;

    // Get section ID
    const [sectionRows] = await pool.execute(
      "SELECT id FROM faq_section LIMIT 1",
    );
    const section = (sectionRows as any[])[0];

    if (!section) {
      return res.status(404).json({ error: "Seção de FAQ não encontrada" });
    }

    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const [positionRows] = await pool.execute(
        "SELECT MAX(position) as max_position FROM faq_items WHERE section_id = ?",
        [section.id],
      );
      const maxPosition = (positionRows as any[])[0].max_position || 0;
      finalPosition = maxPosition + 1;
    }

    const [result] = await pool.execute(
      `
      INSERT INTO faq_items (section_id, question, answer, is_active, position)
      VALUES (?, ?, ?, ?, ?)
    `,
      [section.id, question, answer, is_active ?? true, finalPosition],
    );

    const insertId = (result as any).insertId;

    // Get the created FAQ
    const [rows] = await pool.execute("SELECT * FROM faq_items WHERE id = ?", [
      insertId,
    ]);
    const newFAQ = (rows as any[])[0];

    res.status(201).json(newFAQ);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update FAQ
export const updateFAQ: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const validation = FAQUpdateSchema.safeParse(req.body);

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
      `UPDATE faq_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    // Return updated data
    const [rows] = await pool.execute("SELECT * FROM faq_items WHERE id = ?", [
      id,
    ]);
    const updatedFAQ = (rows as any[])[0];

    if (!updatedFAQ) {
      return res.status(404).json({ error: "FAQ não encontrada" });
    }

    res.json(updatedFAQ);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Delete FAQ
export const deleteFAQ: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [result] = await pool.execute("DELETE FROM faq_items WHERE id = ?", [
      id,
    ]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "FAQ não encontrada" });
    }

    res.json({ message: "FAQ deletada com sucesso" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Reorder FAQs
export const reorderFAQs: RequestHandler = async (req, res) => {
  try {
    const { faqIds } = req.body;

    if (!Array.isArray(faqIds)) {
      return res.status(400).json({ error: "faqIds deve ser um array" });
    }

    // Update positions
    for (let i = 0; i < faqIds.length; i++) {
      await pool.execute(
        "UPDATE faq_items SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [i + 1, faqIds[i]],
      );
    }

    res.json({ message: "Ordem das FAQs atualizada" });
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

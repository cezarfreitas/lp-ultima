import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const FooterSectionUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  whatsapp_url: z.string().optional(),
});

const FooterLinkCreateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  href: z.string().min(1, "URL é obrigatória"),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

const FooterLinkUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

// Get footer section with all active links
export const getFooterSection: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute('SELECT * FROM footer_section LIMIT 1');
    const section = (sectionRows as any[])[0];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção de footer não encontrada' });
    }

    // Get all active footer links for this section
    const [linkRows] = await pool.execute(
      'SELECT * FROM footer_links WHERE section_id = ? AND is_active = 1 ORDER BY position ASC',
      [section.id]
    );

    const sectionWithLinks = {
      ...section,
      links: linkRows
    };
    
    res.json(sectionWithLinks);
  } catch (error) {
    console.error('Error fetching footer section:', error);
    
    // Check if it's a table doesn't exist error
    if (error instanceof Error && error.message.includes("doesn't exist")) {
      return res.status(404).json({ 
        error: 'Tabelas de footer não foram criadas ainda',
        needsMigration: true
      });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get all footer links for admin (including inactive)
export const getAllFooterLinks: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute('SELECT * FROM footer_section LIMIT 1');
    const section = (sectionRows as any[])[0];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção de footer não encontrada' });
    }

    // Get all footer links for this section
    const [linkRows] = await pool.execute(
      'SELECT * FROM footer_links WHERE section_id = ? ORDER BY position ASC',
      [section.id]
    );

    const sectionWithLinks = {
      ...section,
      links: linkRows
    };
    
    res.json(sectionWithLinks);
  } catch (error) {
    console.error('Error fetching all footer links:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update footer section settings
export const updateFooterSection: RequestHandler = async (req, res) => {
  try {
    const validation = FooterSectionUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const data = validation.data;
    const updateFields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => data[field as keyof typeof data]);
    
    await pool.execute(
      `UPDATE footer_section SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM footer_section LIMIT 1) as temp)`,
      values
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM footer_section LIMIT 1');
    const updatedSection = (rows as any[])[0];
    
    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating footer section:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Create new footer link
export const createFooterLink: RequestHandler = async (req, res) => {
  try {
    const validation = FooterLinkCreateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const { title, href, is_active, position } = validation.data;
    
    // Get section ID
    const [sectionRows] = await pool.execute('SELECT id FROM footer_section LIMIT 1');
    const section = (sectionRows as any[])[0];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção de footer não encontrada' });
    }
    
    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const [positionRows] = await pool.execute(
        'SELECT MAX(position) as max_position FROM footer_links WHERE section_id = ?',
        [section.id]
      );
      const maxPosition = (positionRows as any[])[0].max_position || 0;
      finalPosition = maxPosition + 1;
    }
    
    const [result] = await pool.execute(`
      INSERT INTO footer_links (section_id, title, href, is_active, position)
      VALUES (?, ?, ?, ?, ?)
    `, [section.id, title, href, is_active ?? true, finalPosition]);
    
    const insertId = (result as any).insertId;
    
    // Get the created link
    const [rows] = await pool.execute('SELECT * FROM footer_links WHERE id = ?', [insertId]);
    const newLink = (rows as any[])[0];
    
    res.status(201).json(newLink);
  } catch (error) {
    console.error('Error creating footer link:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update footer link
export const updateFooterLink: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const validation = FooterLinkUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const data = validation.data;
    const updateFields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => data[field as keyof typeof data]);
    
    await pool.execute(
      `UPDATE footer_links SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM footer_links WHERE id = ?', [id]);
    const updatedLink = (rows as any[])[0];
    
    if (!updatedLink) {
      return res.status(404).json({ error: 'Link de footer não encontrado' });
    }
    
    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating footer link:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Delete footer link
export const deleteFooterLink: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const [result] = await pool.execute('DELETE FROM footer_links WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Link de footer não encontrado' });
    }
    
    res.json({ message: 'Link de footer deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting footer link:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Reorder footer links
export const reorderFooterLinks: RequestHandler = async (req, res) => {
  try {
    const { linkIds } = req.body;
    
    if (!Array.isArray(linkIds)) {
      return res.status(400).json({ error: 'linkIds deve ser um array' });
    }
    
    // Update positions
    for (let i = 0; i < linkIds.length; i++) {
      await pool.execute(
        'UPDATE footer_links SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [i + 1, linkIds[i]]
      );
    }
    
    res.json({ message: 'Ordem dos links de footer atualizada' });
  } catch (error) {
    console.error('Error reordering footer links:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

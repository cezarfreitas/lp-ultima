import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const TestimonialsSectionUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  background_type: z.enum(['white', 'gray', 'gradient']).optional(),
  show_ratings: z.boolean().optional(),
  max_testimonials: z.number().int().min(1).max(12).optional(),
});

const TestimonialCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  company: z.string().min(1, "Empresa é obrigatória"),
  content: z.string().min(10, "Depoimento deve ter pelo menos 10 caracteres"),
  avatar_url: z.string().refine(
    (url) => {
      if (!url) return true; // Empty string is valid
      return url.startsWith('/') || z.string().url().safeParse(url).success;
    },
    { message: "URL do avatar inválida" }
  ).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

const TestimonialUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  content: z.string().min(10).optional(),
  avatar_url: z.string().refine(
    (url) => {
      if (!url) return true; // Empty string is valid
      return url.startsWith('/') || z.string().url().safeParse(url).success;
    },
    { message: "URL do avatar inválida" }
  ).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().min(1).optional(),
});

// Get testimonials section with all testimonials
export const getTestimonialsSection: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute('SELECT * FROM testimonials_section LIMIT 1');
    const section = (sectionRows as any[])[0];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção de depoimentos não encontrada' });
    }

    // Get all active testimonials for this section
    const [testimonialRows] = await pool.execute(
      'SELECT * FROM testimonials WHERE section_id = ? AND is_active = 1 ORDER BY position ASC',
      [section.id]
    );

    const sectionWithTestimonials = {
      ...section,
      testimonials: testimonialRows
    };
    
    res.json(sectionWithTestimonials);
  } catch (error) {
    console.error('Error fetching testimonials section:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Get all testimonials for admin (including inactive)
export const getAllTestimonials: RequestHandler = async (req, res) => {
  try {
    // Get section settings
    const [sectionRows] = await pool.execute('SELECT * FROM testimonials_section LIMIT 1');
    const section = (sectionRows as any[])[0];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção de depoimentos não encontrada' });
    }

    // Get all testimonials for this section
    const [testimonialRows] = await pool.execute(
      'SELECT * FROM testimonials WHERE section_id = ? ORDER BY position ASC',
      [section.id]
    );

    const sectionWithTestimonials = {
      ...section,
      testimonials: testimonialRows
    };
    
    res.json(sectionWithTestimonials);
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update testimonials section settings
export const updateTestimonialsSection: RequestHandler = async (req, res) => {
  try {
    const validation = TestimonialsSectionUpdateSchema.safeParse(req.body);
    
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
      `UPDATE testimonials_section SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM testimonials_section LIMIT 1) as temp)`,
      values
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM testimonials_section LIMIT 1');
    const updatedSection = (rows as any[])[0];
    
    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating testimonials section:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Create new testimonial
export const createTestimonial: RequestHandler = async (req, res) => {
  try {
    const validation = TestimonialCreateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const { name, role, company, content, avatar_url, rating, is_active, position } = validation.data;
    
    // Get section ID
    const [sectionRows] = await pool.execute('SELECT id FROM testimonials_section LIMIT 1');
    const section = (sectionRows as any[])[0];
    
    if (!section) {
      return res.status(404).json({ error: 'Seção de depoimentos não encontrada' });
    }
    
    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const [positionRows] = await pool.execute(
        'SELECT MAX(position) as max_position FROM testimonials WHERE section_id = ?',
        [section.id]
      );
      const maxPosition = (positionRows as any[])[0].max_position || 0;
      finalPosition = maxPosition + 1;
    }
    
    const [result] = await pool.execute(`
      INSERT INTO testimonials (section_id, name, role, company, content, avatar_url, rating, is_active, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [section.id, name, role, company, content, avatar_url || null, rating, is_active ?? true, finalPosition]);
    
    const insertId = (result as any).insertId;
    
    // Get the created testimonial
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [insertId]);
    const newTestimonial = (rows as any[])[0];
    
    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update testimonial
export const updateTestimonial: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const validation = TestimonialUpdateSchema.safeParse(req.body);
    
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
      `UPDATE testimonials SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [id]);
    const updatedTestimonial = (rows as any[])[0];
    
    if (!updatedTestimonial) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }
    
    res.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Delete testimonial
export const deleteTestimonial: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const [result] = await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }
    
    res.json({ message: 'Depoimento deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Reorder testimonials
export const reorderTestimonials: RequestHandler = async (req, res) => {
  try {
    const { testimonialIds } = req.body;
    
    if (!Array.isArray(testimonialIds)) {
      return res.status(400).json({ error: 'testimonialIds deve ser um array' });
    }
    
    // Update positions
    for (let i = 0; i < testimonialIds.length; i++) {
      await pool.execute(
        'UPDATE testimonials SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [i + 1, testimonialIds[i]]
      );
    }
    
    res.json({ message: 'Ordem dos depoimentos atualizada' });
  } catch (error) {
    console.error('Error reordering testimonials:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

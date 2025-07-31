import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const FormContentUpdateSchema = z.object({
  main_title: z.string().optional(),
  main_subtitle: z.string().optional(),
  form_title: z.string().optional(),
  form_subtitle: z.string().optional(),
  benefit1_title: z.string().optional(),
  benefit1_description: z.string().optional(),
  benefit2_title: z.string().optional(),
  benefit2_description: z.string().optional(),
  benefit3_title: z.string().optional(),
  benefit3_description: z.string().optional(),
  benefit4_title: z.string().optional(),
  benefit4_description: z.string().optional(),
});

// Get form content
export const getFormContent: RequestHandler = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM form_content LIMIT 1');
    const content = (rows as any[])[0];
    
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching form content:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update form content
export const updateFormContent: RequestHandler = async (req, res) => {
  try {
    const validation = FormContentUpdateSchema.safeParse(req.body);
    
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
      `UPDATE form_content SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM form_content LIMIT 1) as temp)`,
      values
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM form_content LIMIT 1');
    const updatedContent = (rows as any[])[0];
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating form content:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const WebhookUpdateSchema = z.object({
  webhook_url: z.string().url("URL inválida").optional(),
  webhook_secret: z.string().optional(),
  webhook_enabled: z.boolean().optional(),
});

// Get webhook settings
export const getWebhookSettings: RequestHandler = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM webhook_settings LIMIT 1');
    const settings = (rows as any[])[0];
    
    if (!settings) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching webhook settings:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update webhook settings
export const updateWebhookSettings: RequestHandler = async (req, res) => {
  try {
    const validation = WebhookUpdateSchema.safeParse(req.body);
    
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
      `UPDATE webhook_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM webhook_settings LIMIT 1) as temp)`,
      values
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM webhook_settings LIMIT 1');
    const updatedSettings = (rows as any[])[0];
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating webhook settings:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

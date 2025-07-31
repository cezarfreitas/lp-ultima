import { Request, Response } from 'express';
import { z } from 'zod';
import mysql from 'mysql2/promise';
import { dbConfig } from '../database/config';

// Types inline to avoid import issues
interface PixelData {
  id?: number;
  name: string;
  type: 'google_analytics' | 'meta_pixel' | 'google_tag_manager' | 'custom_header' | 'custom_body' | 'ga4_simple' | 'meta_simple' | 'meta_conversions';
  code: string;
  enabled: boolean;
  position: 'head' | 'body_start' | 'body_end';
  description?: string;
  pixel_id?: string;
  access_token?: string;
  created_at?: string;
  updated_at?: string;
}

const PixelSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['google_analytics', 'meta_pixel', 'google_tag_manager', 'custom_header', 'custom_body', 'ga4_simple', 'meta_simple', 'meta_conversions']),
  code: z.string(),
  enabled: z.boolean(),
  position: z.enum(['head', 'body_start', 'body_end']),
  description: z.string().optional(),
  pixel_id: z.string().optional(),
  access_token: z.string().optional()
});

export async function getAllPixels(req: Request, res: Response) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute('SELECT * FROM pixels ORDER BY created_at DESC');
      const pixels = rows as PixelData[];
      
      res.json(pixels);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching pixels:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function getEnabledPixels(req: Request, res: Response) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute('SELECT * FROM pixels WHERE enabled = TRUE ORDER BY position, created_at');
      const pixels = rows as PixelData[];
      
      res.json(pixels);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching enabled pixels:', error);
    res.json([]); // Return empty array on error for frontend
  }
}

export async function createPixel(req: Request, res: Response) {
  try {
    const validatedData = PixelSchema.parse(req.body);
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [result] = await connection.execute(
        `INSERT INTO pixels (name, type, code, enabled, position, description, pixel_id, access_token, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          validatedData.name,
          validatedData.type,
          validatedData.code || '',
          validatedData.enabled,
          validatedData.position,
          validatedData.description || null,
          validatedData.pixel_id || null,
          validatedData.access_token || null
        ]
      );
      
      const insertResult = result as mysql.ResultSetHeader;
      const newPixel: PixelData = {
        id: insertResult.insertId,
        ...validatedData
      };
      
      res.json(newPixel);
    } finally {
      await connection.end();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      });
    }
    
    console.error('Error creating pixel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function updatePixel(req: Request, res: Response) {
  try {
    const pixelId = parseInt(req.params.id);
    const validatedData = PixelSchema.parse(req.body);
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute(
        `UPDATE pixels SET name = ?, type = ?, code = ?, enabled = ?, position = ?, 
         description = ?, updated_at = NOW() WHERE id = ?`,
        [
          validatedData.name,
          validatedData.type,
          validatedData.code,
          validatedData.enabled,
          validatedData.position,
          validatedData.description || null,
          pixelId
        ]
      );
      
      const updatedPixel: PixelData = {
        id: pixelId,
        ...validatedData
      };
      
      res.json(updatedPixel);
    } finally {
      await connection.end();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      });
    }
    
    console.error('Error updating pixel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function deletePixel(req: Request, res: Response) {
  try {
    const pixelId = parseInt(req.params.id);
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute('DELETE FROM pixels WHERE id = ?', [pixelId]);
      res.json({ success: true });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error deleting pixel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function togglePixel(req: Request, res: Response) {
  try {
    const pixelId = parseInt(req.params.id);
    const { enabled } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute(
        'UPDATE pixels SET enabled = ?, updated_at = NOW() WHERE id = ?',
        [enabled, pixelId]
      );
      
      res.json({ success: true, enabled });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error toggling pixel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

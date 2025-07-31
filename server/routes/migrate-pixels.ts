import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { dbConfig } from '../database/config';

export async function migratePixels(req: Request, res: Response) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      console.log('Creating pixels table...');
      
      // Create pixels table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS pixels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type ENUM('google_analytics', 'meta_pixel', 'google_tag_manager', 'custom_header', 'custom_body', 'ga4_simple', 'meta_simple', 'meta_conversions') NOT NULL,
          code TEXT NOT NULL,
          enabled BOOLEAN DEFAULT FALSE,
          position ENUM('head', 'body_start', 'body_end') DEFAULT 'head',
          description TEXT,
          pixel_id VARCHAR(255),
          access_token TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_enabled (enabled),
          INDEX idx_position (position),
          INDEX idx_type (type),
          INDEX idx_pixel_id (pixel_id)
        )
      `);

      // Check if data already exists
      const [existing] = await connection.execute('SELECT COUNT(*) as count FROM pixels');
      const existingArray = existing as { count: number }[];
      
      if (existingArray[0].count === 0) {
        console.log('Inserting default pixel data...');
        
        // Insert default pixel templates (disabled by default)
        await connection.execute(
          `INSERT INTO pixels (name, type, code, enabled, position, description, pixel_id, access_token) VALUES
           (?, ?, ?, ?, ?, ?, ?, ?),
           (?, ?, ?, ?, ?, ?, ?, ?),
           (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'Google Analytics GA4 - Simples',
            'ga4_simple',
            '',
            false,
            'head',
            'Versão simplificada do GA4 - apenas insira seu ID',
            null,
            null,

            'Meta Pixel - Simples',
            'meta_simple',
            '',
            false,
            'head',
            'Versão simplificada do Meta Pixel - apenas insira seu ID',
            null,
            null,

            'Meta Conversions API',
            'meta_conversions',
            '',
            false,
            'head',
            'API de conversões da Meta para rastreamento server-side',
            null,
            null
          ]
        );
        
        console.log('Default pixel data inserted successfully');
      } else {
        console.log('Pixel data already exists, skipping default data insertion');
      }

      res.json({ 
        success: true, 
        message: 'Pixel migration completed successfully' 
      });
      
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Pixel migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

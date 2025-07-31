import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { dbConfig } from '../database/config';
import { DEFAULT_SEO_DATA } from '@shared/seo';

export async function migrateSEO(req: Request, res: Response) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      console.log('Creating SEO table...');
      
      // Create SEO table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS seo_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          keywords TEXT NOT NULL,
          canonical_url VARCHAR(500),
          og_title VARCHAR(100) NOT NULL,
          og_description TEXT NOT NULL,
          og_image VARCHAR(500),
          og_type VARCHAR(50) NOT NULL,
          twitter_card VARCHAR(50) NOT NULL,
          twitter_title VARCHAR(100) NOT NULL,
          twitter_description TEXT NOT NULL,
          twitter_image VARCHAR(500),
          robots VARCHAR(100) NOT NULL,
          author VARCHAR(100) NOT NULL,
          language VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Check if data already exists
      const [existing] = await connection.execute('SELECT COUNT(*) as count FROM seo_data');
      const existingArray = existing as { count: number }[];
      
      if (existingArray[0].count === 0) {
        console.log('Inserting default SEO data...');
        
        // Insert default SEO data
        await connection.execute(
          `INSERT INTO seo_data (
            title, description, keywords, canonical_url, og_title, og_description, 
            og_image, og_type, twitter_card, twitter_title, twitter_description, 
            twitter_image, robots, author, language
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            DEFAULT_SEO_DATA.title,
            DEFAULT_SEO_DATA.description,
            DEFAULT_SEO_DATA.keywords,
            DEFAULT_SEO_DATA.canonical_url || null,
            DEFAULT_SEO_DATA.og_title,
            DEFAULT_SEO_DATA.og_description,
            DEFAULT_SEO_DATA.og_image || null,
            DEFAULT_SEO_DATA.og_type,
            DEFAULT_SEO_DATA.twitter_card,
            DEFAULT_SEO_DATA.twitter_title,
            DEFAULT_SEO_DATA.twitter_description,
            DEFAULT_SEO_DATA.twitter_image || null,
            DEFAULT_SEO_DATA.robots,
            DEFAULT_SEO_DATA.author,
            DEFAULT_SEO_DATA.language
          ]
        );
        
        console.log('Default SEO data inserted successfully');
      } else {
        console.log('SEO data already exists, skipping default data insertion');
      }

      res.json({ 
        success: true, 
        message: 'SEO migration completed successfully' 
      });
      
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('SEO migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

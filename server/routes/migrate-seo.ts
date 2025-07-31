import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { dbConfig } from '../database/config';

// Import SEO data inline to avoid module resolution issues
const DEFAULT_SEO_DATA = {
  title: "Seja um Lojista Oficial Ecko - Parceria Exclusiva | Ecko Brasil",
  description: "🏪 Torne-se um lojista oficial Ecko! Acesso a produtos exclusivos, preços especiais e suporte completo. Junte-se à maior rede de streetwear do Brasil. Cadastre-se agora!",
  keywords: "lojista ecko, franquia ecko, parceria ecko, revenda ecko, streetwear brasil, roupas urbanas, moda jovem, distribuidor ecko, negócio próprio, empreendedorismo, marca famosa",
  canonical_url: "https://sejaum.lojista.ecko.com.br",
  og_title: "Seja um Lojista Oficial Ecko - Oportunidade Única de Negócio",
  og_description: "💰 Descubra como se tornar um lojista oficial Ecko. Produtos exclusivos, margem atrativa e suporte completo para seu negócio crescer no mercado de streetwear. Cadastre-se gratuitamente!",
  og_image: "https://sejaum.lojista.ecko.com.br/images/og-lojista-ecko.jpg",
  og_type: "website",
  twitter_card: "summary_large_image",
  twitter_title: "Seja um Lojista Oficial Ecko - Parceria Exclusiva",
  twitter_description: "🚀 Torne-se parceiro oficial Ecko. Acesso a produtos exclusivos, preços especiais e suporte completo para seu negócio decolar!",
  twitter_image: "https://sejaum.lojista.ecko.com.br/images/twitter-lojista-ecko.jpg",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  author: "Ecko Brasil",
  language: "pt-BR"
};

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

import { RequestHandler } from "express";
import { pool } from "../database/config";

export const migrateMultiFormat: RequestHandler = async (req, res) => {
  try {
    // Add new columns for multiple image formats to product_items table
    await pool.execute(`
      ALTER TABLE product_items 
      ADD COLUMN IF NOT EXISTS image_thumbnail VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS image_small VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS image_medium VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS image_large VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS original_width INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS original_height INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS original_size INT DEFAULT 0
    `);

    // Create uploads_metadata table for tracking image processing info
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS uploads_metadata (
        id INT PRIMARY KEY AUTO_INCREMENT,
        original_filename VARCHAR(255) NOT NULL,
        image_thumbnail VARCHAR(1000) NOT NULL,
        image_small VARCHAR(1000) NOT NULL,
        image_medium VARCHAR(1000) NOT NULL,
        image_large VARCHAR(1000) NOT NULL,
        original_width INT NOT NULL DEFAULT 0,
        original_height INT NOT NULL DEFAULT 0,
        original_size INT NOT NULL DEFAULT 0,
        thumbnail_size INT NOT NULL DEFAULT 0,
        small_size INT NOT NULL DEFAULT 0,
        medium_size INT NOT NULL DEFAULT 0,
        large_size INT NOT NULL DEFAULT 0,
        total_savings_percent DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_original_filename (original_filename),
        INDEX idx_created_at (created_at)
      )
    `);

    // Update hero_section table to support multiple formats
    await pool.execute(`
      ALTER TABLE hero_section 
      ADD COLUMN IF NOT EXISTS logo_image_thumbnail VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS logo_image_small VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS logo_image_medium VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS logo_image_large VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS background_image_thumbnail VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS background_image_small VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS background_image_medium VARCHAR(1000) DEFAULT '',
      ADD COLUMN IF NOT EXISTS background_image_large VARCHAR(1000) DEFAULT ''
    `);

    // Update seo_data table to support multiple formats
    const [seoTableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'seo_data'
    `);

    if ((seoTableExists as any)[0].count > 0) {
      await pool.execute(`
        ALTER TABLE seo_data 
        ADD COLUMN IF NOT EXISTS og_image_thumbnail VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS og_image_small VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS og_image_medium VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS og_image_large VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS twitter_image_thumbnail VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS twitter_image_small VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS twitter_image_medium VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS twitter_image_large VARCHAR(1000) DEFAULT ''
      `);
    }

    // Check for existing showroom_items table and add multi-format support
    const [showroomTableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'showroom_items'
    `);

    if ((showroomTableExists as any)[0].count > 0) {
      await pool.execute(`
        ALTER TABLE showroom_items 
        ADD COLUMN IF NOT EXISTS image_thumbnail VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS image_small VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS image_medium VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS image_large VARCHAR(1000) DEFAULT ''
      `);
    }

    // Check for existing testimonials table and add multi-format support
    const [testimonialsTableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'testimonials'
    `);

    if ((testimonialsTableExists as any)[0].count > 0) {
      await pool.execute(`
        ALTER TABLE testimonials 
        ADD COLUMN IF NOT EXISTS avatar_thumbnail VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS avatar_small VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS avatar_medium VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS avatar_large VARCHAR(1000) DEFAULT ''
      `);
    }

    // Check for existing about_stats table and add multi-format support
    const [aboutTableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'about_stats'
    `);

    if ((aboutTableExists as any)[0].count > 0) {
      await pool.execute(`
        ALTER TABLE about_stats 
        ADD COLUMN IF NOT EXISTS icon_thumbnail VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS icon_small VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS icon_medium VARCHAR(1000) DEFAULT '',
        ADD COLUMN IF NOT EXISTS icon_large VARCHAR(1000) DEFAULT ''
      `);
    }

    res.json({
      message: "Migração para múltiplos formatos de imagem concluída com sucesso",
      changes: [
        "Adicionados campos de múltiplos formatos à tabela product_items",
        "Criada tabela uploads_metadata para metadados de upload",
        "Adicionados campos de múltiplos formatos à tabela hero_section",
        "Adicionados campos de múltiplos formatos à tabela seo_data (se existir)",
        "Adicionados campos de múltiplos formatos à tabela showroom_items (se existir)",
        "Adicionados campos de múltiplos formatos à tabela testimonials (se existir)",
        "Adicionados campos de múltiplos formatos à tabela about_stats (se existir)",
      ],
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao executar migração para múltiplos formatos",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

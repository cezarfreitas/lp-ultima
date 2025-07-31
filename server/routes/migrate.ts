import { RequestHandler } from "express";
import { pool } from "../database/config";

export const migrateLogo: RequestHandler = async (req, res) => {
  try {
    // Check if logo_image column exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'lp-ecko-db'
      AND TABLE_NAME = 'hero_section'
      AND COLUMN_NAME = 'logo_image'
    `);

    if ((columns as any[]).length === 0) {
      // Column doesn't exist, add it
      await pool.execute(`
        ALTER TABLE hero_section
        ADD COLUMN logo_image VARCHAR(500) DEFAULT '' AFTER logo_text
      `);
      res.json({ message: "Coluna logo_image adicionada com sucesso!" });
    } else {
      res.json({ message: "Coluna logo_image já existe na tabela." });
    }
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro na migração",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const migrateDesign: RequestHandler = async (req, res) => {
  try {
    // Check if design_settings table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'lp-ecko-db'
      AND TABLE_NAME = 'design_settings'
    `);

    if ((tables as any[]).length === 0) {
      // Table doesn't exist, create it
      await pool.execute(`
        CREATE TABLE design_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          primary_color VARCHAR(7) DEFAULT '#dc2626',
          secondary_color VARCHAR(7) DEFAULT '#6b7280',
          accent_color VARCHAR(7) DEFAULT '#000000',
          background_color VARCHAR(7) DEFAULT '#ffffff',
          text_color VARCHAR(7) DEFAULT '#000000',
          font_family VARCHAR(100) DEFAULT 'Inter',
          font_size_base VARCHAR(10) DEFAULT '16px',
          font_weight_normal VARCHAR(10) DEFAULT '400',
          font_weight_bold VARCHAR(10) DEFAULT '700',
          border_radius VARCHAR(10) DEFAULT '8px',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Insert default values
      await pool.execute(`
        INSERT INTO design_settings (primary_color, secondary_color, accent_color, background_color, text_color, font_family, font_size_base, font_weight_normal, font_weight_bold, border_radius)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        '#dc2626', // Red
        '#6b7280', // Gray
        '#000000', // Black
        '#ffffff', // White
        '#000000', // Black text
        'Inter',
        '16px',
        '400',
        '700',
        '8px'
      ]);

      res.json({ message: "Tabela design_settings criada com sucesso!" });
    } else {
      res.json({ message: "Tabela design_settings já existe." });
    }
  } catch (error) {
    console.error("Design migration error:", error);
    res.status(500).json({
      error: "Erro na migração de design",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

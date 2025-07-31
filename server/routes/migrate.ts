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

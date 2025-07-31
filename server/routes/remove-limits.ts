import { RequestHandler } from "express";
import { pool } from "../database/config";

export const removeLimits: RequestHandler = async (req, res) => {
  try {
    // Check if hero_section table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'lp-ecko-db' 
      AND TABLE_NAME = 'hero_section'
    `);

    if ((tables as any[]).length > 0) {
      // Modify columns to allow more characters
      await pool.execute(`
        ALTER TABLE hero_section 
        MODIFY COLUMN logo_text TEXT,
        MODIFY COLUMN impact_title TEXT,
        MODIFY COLUMN impact_subtitle TEXT,
        MODIFY COLUMN description TEXT,
        MODIFY COLUMN button_text TEXT,
        MODIFY COLUMN background_image TEXT,
        MODIFY COLUMN logo_image TEXT
      `);

      res.json({ message: "Limites de caracteres removidos com sucesso!" });
    } else {
      res.status(404).json({ error: "Tabela hero_section não encontrada" });
    }
  } catch (error) {
    console.error("Remove limits error:", error);
    res.status(500).json({ 
      error: "Erro ao remover limites", 
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

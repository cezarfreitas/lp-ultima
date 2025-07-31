import { RequestHandler } from "express";
import { pool } from "../database/config";
import { DEFAULT_FAQ_DATA } from "../../shared/faq.js";

export const migrateFAQ: RequestHandler = async (req, res) => {
  try {
    // Create faq_section table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS faq_section (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) DEFAULT 'Perguntas [destaque]Frequentes[/destaque]',
        subtitle TEXT,
        background_type ENUM('white', 'gray', 'gradient') DEFAULT 'white',
        max_faqs INT DEFAULT 8,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create faq_items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS faq_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        position INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES faq_section(id) ON DELETE CASCADE,
        INDEX idx_section_id (section_id),
        INDEX idx_is_active (is_active),
        INDEX idx_position (position)
      )
    `);

    // Insert default section if doesn't exist
    const [sectionRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM faq_section",
    );
    const sectionCount = (sectionRows as any[])[0].count;

    let sectionId;
    if (sectionCount === 0) {
      const [sectionResult] = await pool.execute(
        `
        INSERT INTO faq_section (title, subtitle, background_type, max_faqs)
        VALUES (?, ?, ?, ?)
      `,
        [
          "Perguntas [destaque]Frequentes[/destaque]",
          "Tire suas dúvidas sobre como se tornar um lojista Ecko e começar a lucrar com nossa marca.",
          "white",
          8,
        ],
      );
      sectionId = (sectionResult as any).insertId;
    } else {
      const [sections] = await pool.execute(
        "SELECT id FROM faq_section LIMIT 1",
      );
      sectionId = (sections as any[])[0].id;
    }

    // Insert default FAQ items if table is empty
    const [faqRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM faq_items",
    );
    const faqCount = (faqRows as any[])[0].count;

    if (faqCount === 0) {
      for (const faq of DEFAULT_FAQ_DATA) {
        await pool.execute(
          `
          INSERT INTO faq_items (section_id, question, answer, is_active, position)
          VALUES (?, ?, ?, ?, ?)
        `,
          [sectionId, faq.question, faq.answer, faq.is_active, faq.position],
        );
      }
    }

    res.json({
      message: "Tabelas de FAQ criadas com sucesso!",
      tables: ["faq_section", "faq_items"],
      defaultData: `${DEFAULT_FAQ_DATA.length} perguntas padrão inseridas`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar tabelas de FAQ",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

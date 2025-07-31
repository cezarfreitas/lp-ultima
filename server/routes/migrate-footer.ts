import { RequestHandler } from "express";
import { pool } from "../database/config";
import { DEFAULT_FOOTER_DATA } from "../../shared/footer.js";

export const migrateFooter: RequestHandler = async (req, res) => {
  try {
    // Create footer_section table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS footer_section (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) DEFAULT 'Ecko',
        description TEXT,
        instagram_url VARCHAR(500) DEFAULT '#',
        facebook_url VARCHAR(500) DEFAULT '#',
        whatsapp_url VARCHAR(500) DEFAULT '#',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create footer_links table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS footer_links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        href VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        position INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES footer_section(id) ON DELETE CASCADE,
        INDEX idx_section_id (section_id),
        INDEX idx_is_active (is_active),
        INDEX idx_position (position)
      )
    `);

    // Insert default section if doesn't exist
    const [sectionRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM footer_section",
    );
    const sectionCount = (sectionRows as any[])[0].count;

    let sectionId;
    if (sectionCount === 0) {
      const [sectionResult] = await pool.execute(
        `
        INSERT INTO footer_section (title, description, instagram_url, facebook_url, whatsapp_url)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          DEFAULT_FOOTER_DATA.title,
          DEFAULT_FOOTER_DATA.description,
          DEFAULT_FOOTER_DATA.instagram_url,
          DEFAULT_FOOTER_DATA.facebook_url,
          DEFAULT_FOOTER_DATA.whatsapp_url,
        ],
      );
      sectionId = (sectionResult as any).insertId;
    } else {
      const [sections] = await pool.execute(
        "SELECT id FROM footer_section LIMIT 1",
      );
      sectionId = (sections as any[])[0].id;
    }

    // Insert default footer links if table is empty
    const [linksRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM footer_links",
    );
    const linksCount = (linksRows as any[])[0].count;

    if (linksCount === 0) {
      for (const link of DEFAULT_FOOTER_DATA.links) {
        await pool.execute(
          `
          INSERT INTO footer_links (section_id, title, href, is_active, position)
          VALUES (?, ?, ?, ?, ?)
        `,
          [sectionId, link.title, link.href, link.is_active, link.position],
        );
      }
    }

    res.json({
      message: "Tabelas de footer criadas com sucesso!",
      tables: ["footer_section", "footer_links"],
      defaultData: `${DEFAULT_FOOTER_DATA.links.length} links padrão inseridos`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar tabelas de footer",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

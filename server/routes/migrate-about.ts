import { RequestHandler } from "express";
import { pool } from "../database/config";
import { DEFAULT_ABOUT_DATA } from "../../shared/about.js";

export const migrateAbout: RequestHandler = async (req, res) => {
  try {
    // Create about_section table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS about_section (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) DEFAULT 'Sobre a [destaque]Ecko[/destaque]',
        subtitle VARCHAR(500),
        description TEXT,
        background_type ENUM('white', 'gray', 'gradient', 'dark') DEFAULT 'gray',
        image_url VARCHAR(500),
        button_text VARCHAR(255) DEFAULT 'Seja um Lojista',
        button_url VARCHAR(500) DEFAULT '#form',
        show_stats BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create about_stats table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS about_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        value VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(10) DEFAULT '📊',
        is_active BOOLEAN DEFAULT TRUE,
        position INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES about_section(id) ON DELETE CASCADE,
        INDEX idx_section_id (section_id),
        INDEX idx_is_active (is_active),
        INDEX idx_position (position)
      )
    `);

    // Insert default section if doesn't exist
    const [sectionRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM about_section",
    );
    const sectionCount = (sectionRows as any[])[0].count;

    let sectionId;
    if (sectionCount === 0) {
      const [sectionResult] = await pool.execute(
        `
        INSERT INTO about_section (title, subtitle, description, background_type, image_url, button_text, button_url, show_stats)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          DEFAULT_ABOUT_DATA.title,
          DEFAULT_ABOUT_DATA.subtitle,
          DEFAULT_ABOUT_DATA.description,
          DEFAULT_ABOUT_DATA.background_type,
          DEFAULT_ABOUT_DATA.image_url,
          DEFAULT_ABOUT_DATA.button_text,
          DEFAULT_ABOUT_DATA.button_url,
          DEFAULT_ABOUT_DATA.show_stats,
        ],
      );
      sectionId = (sectionResult as any).insertId;
    } else {
      const [sections] = await pool.execute(
        "SELECT id FROM about_section LIMIT 1",
      );
      sectionId = (sections as any[])[0].id;
    }

    // Insert default stats if table is empty
    const [statsRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM about_stats",
    );
    const statsCount = (statsRows as any[])[0].count;

    if (statsCount === 0) {
      for (const stat of DEFAULT_ABOUT_DATA.stats) {
        await pool.execute(
          `
          INSERT INTO about_stats (section_id, title, value, description, icon, is_active, position)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            sectionId,
            stat.title,
            stat.value,
            stat.description,
            stat.icon,
            stat.is_active,
            stat.position,
          ],
        );
      }
    }

    res.json({
      message: "Tabelas de About criadas com sucesso!",
      tables: ["about_section", "about_stats"],
      defaultData: `${DEFAULT_ABOUT_DATA.stats.length} estatísticas padrão inseridas`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar tabelas de About",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

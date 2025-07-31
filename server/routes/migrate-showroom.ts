import { RequestHandler } from "express";
import { pool } from "../database/config";
import { DEFAULT_SHOWROOM_DATA } from "../../shared/showroom.js";

export const migrateShowroom: RequestHandler = async (req, res) => {
  try {
    // Create showroom_section table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS showroom_section (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) DEFAULT 'Nosso [destaque]Showroom[/destaque]',
        subtitle TEXT,
        background_type ENUM('white', 'gray', 'gradient', 'dark') DEFAULT 'dark',
        layout_type ENUM('grid', 'masonry', 'carousel') DEFAULT 'masonry',
        max_items INT DEFAULT 12,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create showroom_items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS showroom_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        media_url VARCHAR(500) NOT NULL,
        media_type ENUM('image', 'video') DEFAULT 'image',
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        position INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES showroom_section(id) ON DELETE CASCADE,
        INDEX idx_section_id (section_id),
        INDEX idx_is_featured (is_featured),
        INDEX idx_is_active (is_active),
        INDEX idx_position (position)
      )
    `);

    // Insert default section if doesn't exist
    const [sectionRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM showroom_section",
    );
    const sectionCount = (sectionRows as any[])[0].count;

    let sectionId;
    if (sectionCount === 0) {
      const [sectionResult] = await pool.execute(
        `
        INSERT INTO showroom_section (title, subtitle, background_type, layout_type, max_items)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          "Nosso [destaque]Showroom[/destaque]",
          "Explore experiências visuais que capturam a essência da marca Ecko em diferentes contextos e estilos.",
          "dark",
          "masonry",
          12,
        ],
      );
      sectionId = (sectionResult as any).insertId;
    } else {
      const [sections] = await pool.execute(
        "SELECT id FROM showroom_section LIMIT 1",
      );
      sectionId = (sections as any[])[0].id;
    }

    // Insert default showroom items if table is empty
    const [showroomRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM showroom_items",
    );
    const showroomCount = (showroomRows as any[])[0].count;

    if (showroomCount === 0) {
      for (const item of DEFAULT_SHOWROOM_DATA) {
        await pool.execute(
          `
          INSERT INTO showroom_items (section_id, title, description, media_url, media_type, is_featured, is_active, position)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            sectionId,
            item.title,
            item.description,
            item.media_url,
            item.media_type,
            item.is_featured,
            item.is_active,
            item.position,
          ],
        );
      }
    }

    res.json({
      message: "Tabelas de showroom criadas com sucesso!",
      tables: ["showroom_section", "showroom_items"],
      defaultData: `${DEFAULT_SHOWROOM_DATA.length} itens padrão inseridos`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar tabelas de showroom",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

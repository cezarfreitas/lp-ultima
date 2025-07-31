import { RequestHandler } from "express";
import { pool } from "../database/config";
import { DEFAULT_TESTIMONIALS_DATA } from "../../shared/testimonials.js";

export const migrateTestimonials: RequestHandler = async (req, res) => {
  try {
    // Create testimonials_section table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS testimonials_section (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) DEFAULT 'O que nossos [destaque]Parceiros[/destaque] dizem',
        subtitle TEXT,
        background_type ENUM('white', 'gray', 'gradient') DEFAULT 'gray',
        show_ratings BOOLEAN DEFAULT TRUE,
        max_testimonials INT DEFAULT 6,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create testimonials table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        avatar_url VARCHAR(500),
        rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        is_active BOOLEAN DEFAULT TRUE,
        position INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES testimonials_section(id) ON DELETE CASCADE,
        INDEX idx_section_id (section_id),
        INDEX idx_is_active (is_active),
        INDEX idx_position (position)
      )
    `);

    // Insert default section if doesn't exist
    const [sectionRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM testimonials_section",
    );
    const sectionCount = (sectionRows as any[])[0].count;

    let sectionId;
    if (sectionCount === 0) {
      const [sectionResult] = await pool.execute(
        `
        INSERT INTO testimonials_section (title, subtitle, background_type, show_ratings, max_testimonials)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          "O que nossos [destaque]Parceiros[/destaque] dizem",
          "Veja os depoimentos de quem já faz parte da nossa rede de lojistas e transformou seu negócio com a Ecko.",
          "gray",
          true,
          6,
        ],
      );
      sectionId = (sectionResult as any).insertId;
    } else {
      const [sections] = await pool.execute(
        "SELECT id FROM testimonials_section LIMIT 1",
      );
      sectionId = (sections as any[])[0].id;
    }

    // Insert default testimonials if table is empty
    const [testimonialRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM testimonials",
    );
    const testimonialCount = (testimonialRows as any[])[0].count;

    if (testimonialCount === 0) {
      for (const testimonial of DEFAULT_TESTIMONIALS_DATA) {
        await pool.execute(
          `
          INSERT INTO testimonials (section_id, name, role, company, content, rating, is_active, position)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            sectionId,
            testimonial.name,
            testimonial.role,
            testimonial.company,
            testimonial.content,
            testimonial.rating,
            testimonial.is_active,
            testimonial.position,
          ],
        );
      }
    }

    res.json({
      message: "Tabelas de depoimentos criadas com sucesso!",
      tables: ["testimonials_section", "testimonials"],
      defaultData: `${DEFAULT_TESTIMONIALS_DATA.length} depoimentos padrão inseridos`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar tabelas de depoimentos",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

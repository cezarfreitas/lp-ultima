import { RequestHandler } from "express";
import { pool } from "../database/config";
import { DEFAULT_GALLERY_DATA } from "../../shared/product-gallery";

export const migrateProductGallery: RequestHandler = async (req, res) => {
  try {
    // Create product_gallery table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) DEFAULT 'Nossos [destaque]Produtos[/destaque]',
        subtitle TEXT,
        cta_text VARCHAR(255) DEFAULT 'Ver Catálogo Completo',
        cta_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create product_items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        gallery_id INT NOT NULL,
        image_url VARCHAR(1000) NOT NULL,
        alt_text VARCHAR(255) DEFAULT 'Produto Ecko',
        position INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (gallery_id) REFERENCES product_gallery(id) ON DELETE CASCADE,
        INDEX idx_gallery_id (gallery_id),
        INDEX idx_position (position)
      )
    `);

    // Insert default data if tables are empty
    const [galleryRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM product_gallery",
    );
    const galleryCount = (galleryRows as any)[0].count;

    if (galleryCount === 0) {
      // Insert gallery settings
      const [galleryResult] = await pool.execute(
        `
        INSERT INTO product_gallery (title, subtitle, cta_text, cta_description)
        VALUES (?, ?, ?, ?)
      `,
        [
          DEFAULT_GALLERY_DATA.title,
          DEFAULT_GALLERY_DATA.subtitle,
          DEFAULT_GALLERY_DATA.cta_text,
          DEFAULT_GALLERY_DATA.cta_description,
        ],
      );

      const galleryId = (galleryResult as any).insertId;

      // Insert default products
      for (const product of DEFAULT_GALLERY_DATA.products) {
        await pool.execute(
          `
          INSERT INTO product_items (gallery_id, image_url, alt_text, position)
          VALUES (?, ?, ?, ?)
        `,
          [galleryId, product.image_url, product.alt_text, product.position],
        );
      }
    }

    res.json({
      message:
        "Tabelas da galeria de produtos criadas com sucesso (product_gallery e product_items)",
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar tabelas da galeria de produtos",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

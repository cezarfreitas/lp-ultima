import { RequestHandler } from "express";
import { pool } from "../database/config";

export const migrateNewTables: RequestHandler = async (req, res) => {
  try {
    // Create webhook_settings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS webhook_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        webhook_url VARCHAR(500) DEFAULT '',
        webhook_secret VARCHAR(255) DEFAULT '',
        webhook_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create form_content table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS form_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        main_title VARCHAR(255) DEFAULT 'Por que ser um',
        main_subtitle VARCHAR(500) DEFAULT 'Junte-se à nossa rede de parceiros e transforme sua paixão pela moda urbana em um negócio lucrativo.',
        form_title VARCHAR(255) DEFAULT 'Seja um Lojista Oficial',
        form_subtitle VARCHAR(500) DEFAULT 'Preencha o formulário e nossa equipe entrará em contato em até 24 horas.',
        benefit1_title VARCHAR(255) DEFAULT 'Preços Exclusivos',
        benefit1_description TEXT,
        benefit2_title VARCHAR(255) DEFAULT 'Produtos Exclusivos',
        benefit2_description TEXT,
        benefit3_title VARCHAR(255) DEFAULT 'Suporte Completo',
        benefit3_description TEXT,
        benefit4_title VARCHAR(255) DEFAULT 'Crescimento Rápido',
        benefit4_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default data if tables are empty
    const [webhookRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM webhook_settings",
    );
    const webhookCount = (webhookRows as any)[0].count;

    if (webhookCount === 0) {
      await pool.execute(
        `
        INSERT INTO webhook_settings (webhook_url, webhook_secret, webhook_enabled)
        VALUES (?, ?, ?)
      `,
        ["", "", false],
      );
    }

    const [formContentRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM form_content",
    );
    const formContentCount = (formContentRows as any)[0].count;

    if (formContentCount === 0) {
      await pool.execute(
        `
        INSERT INTO form_content (
          main_title, main_subtitle, form_title, form_subtitle,
          benefit1_title, benefit1_description, benefit2_title, benefit2_description,
          benefit3_title, benefit3_description, benefit4_title, benefit4_description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          "Por que ser um",
          "Junte-se à nossa rede de parceiros e transforme sua paixão pela moda urbana em um negócio lucrativo.",
          "Seja um Lojista Oficial",
          "Preencha o formulário e nossa equipe entrará em contato em até 24 horas.",
          "Preços Exclusivos",
          "Acesso a preços diferenciados e margens competitivas que garantem sua lucratividade.",
          "Produtos Exclusivos",
          "Tenha acesso primeiro às novas coleções e produtos limitados da marca Ecko.",
          "Suporte Completo",
          "Nossa equipe oferece treinamento, marketing e suporte técnico para o sucesso do seu negócio.",
          "Crescimento Rápido",
          "Aproveite a força da marca Ecko para acelerar o crescimento do seu negócio.",
        ],
      );
    }

    res.json({
      message:
        "Novas tabelas criadas com sucesso (webhook_settings e form_content)",
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      error: "Erro ao criar novas tabelas",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

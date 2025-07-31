import mysql from "mysql2/promise";
import { config } from "../../shared/config.js";

export const dbConfig = config.DATABASE;

export const pool = mysql.createPool(dbConfig);

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create hero_section table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hero_section (
        id INT PRIMARY KEY AUTO_INCREMENT,
        logo_text VARCHAR(10) DEFAULT 'L',
        logo_image VARCHAR(500) DEFAULT '',
        impact_title VARCHAR(255) NOT NULL DEFAULT 'Seja bem-vindo ao',
        impact_subtitle VARCHAR(255) NOT NULL DEFAULT 'Futuro Digital',
        description VARCHAR(1000) NOT NULL DEFAULT 'Transforme suas ideias em realidade com nossa plataforma inovadora. Conecte-se, crie e conquiste novos horizontes.',
        button_text VARCHAR(100) NOT NULL DEFAULT 'Comece Agora',
        background_image VARCHAR(500) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create design_settings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS design_settings (
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

    // Create leads table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50),
        has_cnpj ENUM('sim', 'nao') NOT NULL,
        store_type ENUM('fisica', 'online', 'fisica_online', 'midias_sociais'),
        cep VARCHAR(10),
        source VARCHAR(100) DEFAULT 'website',
        status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
        webhook_sent BOOLEAN DEFAULT FALSE,
        webhook_attempts INT DEFAULT 0,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_has_cnpj (has_cnpj),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // Check if leads table exists and has old structure, then migrate
    try {
      const [columns] = await pool.execute(
        `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'leads'
      `,
        [dbConfig.database],
      );

      const columnNames = (columns as any[]).map((col) => col.COLUMN_NAME);

      // If old columns exist, migrate them
      if (columnNames.includes("email")) {
        console.log("Migrating leads table to new structure...");

        // Drop old structure and recreate
        await pool.execute("DROP TABLE IF EXISTS leads_backup");
        await pool.execute(`
          CREATE TABLE leads_backup AS SELECT * FROM leads
        `);

        await pool.execute("DROP TABLE leads");

        // Recreate with new structure
        await pool.execute(`
          CREATE TABLE leads (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            whatsapp VARCHAR(50),
            has_cnpj ENUM('sim', 'nao') NOT NULL,
            store_type ENUM('fisica', 'online', 'fisica_online', 'midias_sociais'),
            cep VARCHAR(10),
            source VARCHAR(100) DEFAULT 'website',
            status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
            webhook_sent BOOLEAN DEFAULT FALSE,
            webhook_attempts INT DEFAULT 0,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_has_cnpj (has_cnpj),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
          )
        `);

        console.log("Leads table migrated successfully");
      }
    } catch (error) {
      console.log("No existing leads table to migrate or migration not needed");
    }

    // Insert default data if tables are empty
    const [heroRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM hero_section",
    );
    const heroCount = (heroRows as any)[0].count;

    if (heroCount === 0) {
      await pool.execute(
        `
        INSERT INTO hero_section (logo_text, logo_image, impact_title, impact_subtitle, description, button_text, background_image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          "L",
          "",
          "Seja bem-vindo ao",
          "Futuro Digital",
          "Transforme suas ideias em realidade com nossa plataforma inovadora. Conecte-se, crie e conquiste novos horizontes.",
          "Comece Agora",
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
        ],
      );
    }

    const [designRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM design_settings",
    );
    const designCount = (designRows as any)[0].count;

    if (designCount === 0) {
      await pool.execute(
        `
        INSERT INTO design_settings (primary_color, secondary_color, accent_color, background_color, text_color, font_family, font_size_base, font_weight_normal, font_weight_bold, border_radius)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          "#dc2626", // Red
          "#6b7280", // Gray
          "#000000", // Black
          "#ffffff", // White
          "#000000", // Black text
          "Inter",
          "16px",
          "400",
          "700",
          "8px",
        ],
      );
    }

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

    // Create SEO table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        keywords TEXT NOT NULL,
        canonical_url VARCHAR(500),
        og_title VARCHAR(100) NOT NULL,
        og_description TEXT NOT NULL,
        og_image VARCHAR(500),
        og_type VARCHAR(50) NOT NULL,
        twitter_card VARCHAR(50) NOT NULL,
        twitter_title VARCHAR(100) NOT NULL,
        twitter_description TEXT NOT NULL,
        twitter_image VARCHAR(500),
        robots VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        language VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create pixels table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pixels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('google_analytics', 'meta_pixel', 'google_tag_manager', 'custom_header', 'custom_body', 'ga4_simple', 'meta_simple', 'meta_conversions') NOT NULL,
        code TEXT NOT NULL,
        enabled BOOLEAN DEFAULT FALSE,
        position ENUM('head', 'body_start', 'body_end') DEFAULT 'head',
        description TEXT,
        pixel_id VARCHAR(255),
        access_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_enabled (enabled),
        INDEX idx_position (position),
        INDEX idx_type (type),
        INDEX idx_pixel_id (pixel_id)
      )
    `);

    // Insert default SEO data if table is empty
    const [seoRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM seo_data",
    );
    const seoCount = (seoRows as any)[0].count;

    if (seoCount === 0) {
      await pool.execute(
        `INSERT INTO seo_data (
          title, description, keywords, canonical_url, og_title, og_description,
          og_image, og_type, twitter_card, twitter_title, twitter_description,
          twitter_image, robots, author, language
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Seja um Lojista Oficial Ecko - Parceria Exclusiva | Ecko Brasil",
          "🏪 Torne-se um lojista oficial Ecko! Acesso a produtos exclusivos, preços especiais e suporte completo. Junte-se à maior rede de streetwear do Brasil. Cadastre-se agora!",
          "lojista ecko, franquia ecko, parceria ecko, revenda ecko, streetwear brasil, roupas urbanas, moda jovem, distribuidor ecko, negócio próprio, empreendedorismo, marca famosa",
          "https://sejaum.lojista.ecko.com.br",
          "Seja um Lojista Oficial Ecko - Oportunidade Única de Negócio",
          "💰 Descubra como se tornar um lojista oficial Ecko. Produtos exclusivos, margem atrativa e suporte completo para seu negócio crescer no mercado de streetwear. Cadastre-se gratuitamente!",
          "https://sejaum.lojista.ecko.com.br/images/og-lojista-ecko.jpg",
          "website",
          "summary_large_image",
          "Seja um Lojista Oficial Ecko - Parceria Exclusiva",
          "🚀 Torne-se parceiro oficial Ecko. Acesso a produtos exclusivos, preços especiais e suporte completo para seu negócio decolar!",
          "https://sejaum.lojista.ecko.com.br/images/twitter-lojista-ecko.jpg",
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          "Ecko Brasil",
          "pt-BR",
        ],
      );
    }

    // Insert default pixel templates if table is empty
    const [pixelRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM pixels",
    );
    const pixelCount = (pixelRows as any)[0].count;

    if (pixelCount === 0) {
      await pool.execute(
        `INSERT INTO pixels (name, type, code, enabled, position, description, pixel_id, access_token) VALUES
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Google Analytics GA4 - Simples",
          "ga4_simple",
          "",
          false,
          "head",
          "Versão simplificada do GA4 - apenas insira seu ID",
          null,
          null,

          "Meta Pixel - Simples",
          "meta_simple",
          "",
          false,
          "head",
          "Versão simplificada do Meta Pixel - apenas insira seu ID",
          null,
          null,

          "Meta Conversions API",
          "meta_conversions",
          "",
          false,
          "head",
          "API de conversões da Meta para rastreamento server-side",
          null,
          null,
        ],
      );
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export interface HeroSection {
  id: number;
  logo_text: string;
  logo_image: string;
  impact_title: string;
  impact_subtitle: string;
  description: string;
  button_text: string;
  background_image: string;
  created_at: Date;
  updated_at: Date;
}

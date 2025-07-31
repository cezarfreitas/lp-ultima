import mysql from "mysql2/promise";

const dbConfig = {
  host: "148.230.78.129",
  port: 3307,
  user: "ecko",
  password: "5acf3bfd1f1c3846491a",
  database: "lp-ecko-db",
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

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
      const [columns] = await pool.execute(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'leads'
      `, [dbConfig.database]);

      const columnNames = (columns as any[]).map(col => col.COLUMN_NAME);

      // If old columns exist, migrate them
      if (columnNames.includes('email')) {
        console.log('Migrating leads table to new structure...');

        // Drop old structure and recreate
        await pool.execute('DROP TABLE IF EXISTS leads_backup');
        await pool.execute(`
          CREATE TABLE leads_backup AS SELECT * FROM leads
        `);

        await pool.execute('DROP TABLE leads');

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

        console.log('Leads table migrated successfully');
      }
    } catch (error) {
      console.log('No existing leads table to migrate or migration not needed');
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
        [
          "",
          "",
          false,
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

import mysql from 'mysql2/promise';

const dbConfig = {
  host: '148.230.78.129',
  port: 3307,
  user: 'ecko',
  password: '5acf3bfd1f1c3846491a',
  database: 'lp-ecko-db',
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
        impact_title VARCHAR(255) NOT NULL DEFAULT 'Seja bem-vindo ao',
        impact_subtitle VARCHAR(255) NOT NULL DEFAULT 'Futuro Digital',
        description VARCHAR(1000) NOT NULL DEFAULT 'Transforme suas ideias em realidade com nossa plataforma inovadora. Conecte-se, crie e conquiste novos horizontes.',
        button_text VARCHAR(100) NOT NULL DEFAULT 'Comece Agora',
        background_image VARCHAR(500) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default data if table is empty
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM hero_section');
    const count = (rows as any)[0].count;
    
    if (count === 0) {
      await pool.execute(`
        INSERT INTO hero_section (logo_text, impact_title, impact_subtitle, description, button_text, background_image)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'L',
        'Seja bem-vindo ao',
        'Futuro Digital',
        'Transforme suas ideias em realidade com nossa plataforma inovadora. Conecte-se, crie e conquiste novos horizontes.',
        'Comece Agora',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80'
      ]);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export interface HeroSection {
  id: number;
  logo_text: string;
  impact_title: string;
  impact_subtitle: string;
  description: string;
  button_text: string;
  background_image: string;
  created_at: Date;
  updated_at: Date;
}

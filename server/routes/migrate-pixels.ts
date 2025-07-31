import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { dbConfig } from '../database/config';

export async function migratePixels(req: Request, res: Response) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      console.log('Creating pixels table...');
      
      // Create pixels table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS pixels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type ENUM('google_analytics', 'meta_pixel', 'google_tag_manager', 'custom_header', 'custom_body') NOT NULL,
          code TEXT NOT NULL,
          enabled BOOLEAN DEFAULT FALSE,
          position ENUM('head', 'body_start', 'body_end') DEFAULT 'head',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_enabled (enabled),
          INDEX idx_position (position),
          INDEX idx_type (type)
        )
      `);

      // Check if data already exists
      const [existing] = await connection.execute('SELECT COUNT(*) as count FROM pixels');
      const existingArray = existing as { count: number }[];
      
      if (existingArray[0].count === 0) {
        console.log('Inserting default pixel data...');
        
        // Insert default pixel templates (disabled by default)
        await connection.execute(
          `INSERT INTO pixels (name, type, code, enabled, position, description) VALUES 
           (?, ?, ?, ?, ?, ?),
           (?, ?, ?, ?, ?, ?)`,
          [
            'Google Analytics - Lojistas Ecko',
            'google_analytics',
            `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`,
            false,
            'head',
            'Rastreamento de conversões para captura de lojistas interessados. Substitua GA_MEASUREMENT_ID pelo seu ID do Google Analytics.',
            
            'Meta Pixel - Parceria Ecko',
            'meta_pixel',
            `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`,
            false,
            'head',
            'Pixel do Facebook para remarketing e conversões. Substitua YOUR_PIXEL_ID pelo seu ID do Meta Pixel.'
          ]
        );
        
        console.log('Default pixel data inserted successfully');
      } else {
        console.log('Pixel data already exists, skipping default data insertion');
      }

      res.json({ 
        success: true, 
        message: 'Pixel migration completed successfully' 
      });
      
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Pixel migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

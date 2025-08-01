import { RequestHandler } from "express";
import { pool } from "../database/config";
import fs from "fs";
import path from "path";

// Migrate old URLs to new multi-format URLs
export const migrateUrls: RequestHandler = async (req, res) => {
  try {
    // Get all products with old-style URLs
    const [rows] = await pool.execute(
      "SELECT id, image_url FROM product_items WHERE image_url NOT LIKE '%/medium/%' AND image_url NOT LIKE '%/small/%' AND image_url NOT LIKE '%/large/%' AND image_url NOT LIKE '%/thumbnail/%'"
    );
    
    const products = rows as Array<{id: number, image_url: string}>;
    const uploadsDir = path.join(process.cwd(), "uploads");
    const updates = [];
    const errors = [];

    for (const product of products) {
      try {
        // Get filename from old URL
        const oldFilename = product.image_url.replace("/uploads/", "");
        const baseNameFromOld = oldFilename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        
        // Look for corresponding medium format file
        const mediumDir = path.join(uploadsDir, "medium");
        const files = fs.readdirSync(mediumDir);
        
        // Find a file that contains similar timestamp or name pattern
        const matchingFile = files.find(file => {
          // Extract timestamp from both files to match
          const oldTimestamp = oldFilename.match(/(\d{13})/)?.[0];
          const newTimestamp = file.match(/(\d{13})/)?.[0];
          
          return oldTimestamp && newTimestamp && Math.abs(parseInt(oldTimestamp) - parseInt(newTimestamp)) < 10000; // 10 second tolerance
        });

        if (matchingFile) {
          const newUrl = `/uploads/medium/${matchingFile}`;
          
          // Update database
          await pool.execute(
            "UPDATE product_items SET image_url = ? WHERE id = ?",
            [newUrl, product.id]
          );
          
          updates.push({
            id: product.id,
            old_url: product.image_url,
            new_url: newUrl
          });
        } else {
          errors.push({
            id: product.id,
            url: product.image_url,
            error: "Matching file not found"
          });
        }
      } catch (error) {
        console.error("Error processing product", product.id, error);
        errors.push({
          id: product.id,
          url: product.image_url,
          error: error.message
        });
      }
    }

    res.json({
      message: "Migration completed",
      updated: updates.length,
      errors: errors.length,
      updates,
      errors
    });
  } catch (error) {
    console.error("Error migrating URLs:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

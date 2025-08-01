import { RequestHandler } from "express";
import { pool } from "../database/config";
import fs from "fs";
import path from "path";

// Fix broken multi-format URLs in hero section
export const fixHeroUrls: RequestHandler = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");

    // Get current hero data
    const [heroRows] = await pool.execute(
      "SELECT * FROM hero_sections LIMIT 1",
    );
    const hero = (heroRows as any[])[0];

    if (!hero) {
      return res.status(404).json({ error: "Hero not found" });
    }

    const fixes = [];
    const errors = [];

    // Check and fix logo_image
    if (
      hero.logo_image &&
      hero.logo_image.includes("/uploads/medium/") &&
      !fs.existsSync(path.join(process.cwd(), hero.logo_image))
    ) {
      // Extract base name and find original file
      const filename = hero.logo_image.split("/").pop();
      const baseName = filename.replace(/-medium\.webp$/, "");

      // Find matching file in uploads directory
      const files = fs.readdirSync(uploadsDir);
      const matchingFile = files.find((file) => {
        const fileBaseName = path.parse(file).name;
        return (
          fileBaseName.includes(baseName.split("-")[0]) ||
          baseName.includes(fileBaseName.split("-")[0])
        );
      });

      if (matchingFile) {
        const newUrl = `/uploads/${matchingFile}`;
        await pool.execute(
          "UPDATE hero_sections SET logo_image = ? WHERE id = ?",
          [newUrl, hero.id],
        );
        fixes.push({
          field: "logo_image",
          old_url: hero.logo_image,
          new_url: newUrl,
        });
      } else {
        errors.push({
          field: "logo_image",
          url: hero.logo_image,
          error: "No matching file found",
        });
      }
    }

    // Check other image fields if they exist
    const imageFields = ["background_image", "hero_image"];
    for (const field of imageFields) {
      if (
        hero[field] &&
        hero[field].includes("/uploads/medium/") &&
        !fs.existsSync(path.join(process.cwd(), hero[field]))
      ) {
        const filename = hero[field].split("/").pop();
        const baseName = filename.replace(/-medium\.webp$/, "");

        const files = fs.readdirSync(uploadsDir);
        const matchingFile = files.find((file) => {
          const fileBaseName = path.parse(file).name;
          return (
            fileBaseName.includes(baseName.split("-")[0]) ||
            baseName.includes(fileBaseName.split("-")[0])
          );
        });

        if (matchingFile) {
          const newUrl = `/uploads/${matchingFile}`;
          await pool.execute(
            `UPDATE hero_sections SET ${field} = ? WHERE id = ?`,
            [newUrl, hero.id],
          );
          fixes.push({
            field,
            old_url: hero[field],
            new_url: newUrl,
          });
        } else {
          errors.push({
            field,
            url: hero[field],
            error: "No matching file found",
          });
        }
      }
    }

    res.json({
      message: "Hero URLs fix completed",
      fixes: fixes.length,
      errors: errors.length,
      details: { fixes, errors },
    });
  } catch (error) {
    console.error("Error fixing hero URLs:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

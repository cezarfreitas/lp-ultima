import { RequestHandler } from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Process existing single-format images into multi-format
export const processExistingImages: RequestHandler = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");

    // Create subdirectories if they don't exist
    const sizeDirectories = ["thumbnail", "small", "medium", "large"];
    sizeDirectories.forEach((dir) => {
      const dirPath = path.join(uploadsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Image size configurations - optimized for square format
    const sizeConfigs = {
      thumbnail: { width: 150, height: 150, quality: 85 },
      small: { width: 400, height: 400, quality: 85 },
      medium: { width: 800, height: 800, quality: 90 },
      large: { width: 1200, height: 1200, quality: 95 },
    };

    // Get all image files in the main uploads directory
    const files = fs.readdirSync(uploadsDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        [".jpg", ".jpeg", ".png", ".webp"].includes(ext) &&
        !file.includes("-thumbnail") &&
        !file.includes("-small") &&
        !file.includes("-medium") &&
        !file.includes("-large")
      );
    });

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const inputPath = path.join(uploadsDir, file);
        const baseName = path.parse(file).name;

        console.log(`Processing: ${file}`);

        // Process each size
        for (const [sizeName, config] of Object.entries(sizeConfigs)) {
          const outputFilename = `${baseName}-${sizeName}.webp`;
          const outputPath = path.join(uploadsDir, sizeName, outputFilename);

          // Skip if already exists
          if (fs.existsSync(outputPath)) {
            console.log(`Skipping existing: ${outputFilename}`);
            continue;
          }

          await sharp(inputPath)
            .resize(config.width, config.height, {
              fit: "cover", // Use cover for square cropping
              position: "center",
            })
            .webp({
              quality: config.quality,
              effort: 6,
            })
            .toFile(outputPath);

          console.log(`Created: ${outputFilename}`);
        }

        results.push({
          original: file,
          processed: true,
          formats: Object.keys(sizeConfigs),
        });
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errors.push({
          file,
          error: error.message,
        });
      }
    }

    res.json({
      message: "Image processing completed",
      total_files: files.length,
      processed: results.length,
      errors: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

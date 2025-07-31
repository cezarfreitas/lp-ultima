import { RequestHandler } from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different sizes
const sizeDirectories = ["thumb", "small", "medium", "large"];
sizeDirectories.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Memory storage for processing before saving
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos de imagem são permitidos!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for original
  },
});

// Image size configurations
const sizeConfigs = {
  thumb: { width: 150, height: 150, quality: 85 },
  small: { width: 400, height: 400, quality: 85 },
  medium: { width: 800, height: 800, quality: 90 },
  large: { width: 1200, height: 1200, quality: 95 },
};

// Generate unique filename base
const generateFilename = (originalName: string): string => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const baseName = path.parse(originalName).name;
  return `${baseName}-${uniqueSuffix}`;
};

// Process and save image in multiple formats
const processImageSizes = async (
  buffer: Buffer,
  filename: string
): Promise<{ [key: string]: string }> => {
  const urls: { [key: string]: string } = {};
  
  for (const [sizeName, config] of Object.entries(sizeConfigs)) {
    const outputFilename = `${filename}-${sizeName}.webp`;
    const outputPath = path.join(uploadsDir, sizeName, outputFilename);
    
    await sharp(buffer)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: config.quality,
        effort: 6 // Higher compression effort
      })
      .toFile(outputPath);
    
    urls[sizeName] = `/uploads/${sizeName}/${outputFilename}`;
  }
  
  return urls;
};

// Upload and process multiple formats endpoint
export const uploadMultiFormat: RequestHandler = (req, res) => {
  const uploadSingle = upload.single("file");

  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        error: err.message || "Erro no upload do arquivo",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Nenhum arquivo foi enviado",
      });
    }

    try {
      // Generate base filename
      const filename = generateFilename(req.file.originalname);
      
      // Process image in multiple sizes
      const urls = await processImageSizes(req.file.buffer, filename);
      
      // Get original file info
      const originalSize = req.file.buffer.length;
      
      // Calculate compression stats for the medium size (default display)
      const mediumPath = path.join(uploadsDir, "medium", `${filename}-medium.webp`);
      const compressedSize = fs.statSync(mediumPath).size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      res.json({
        message: "Upload realizado com sucesso",
        url: urls.medium, // Default URL for backward compatibility
        urls: urls, // All format URLs
        filename: filename,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: `${compressionRatio}%`,
        formats: Object.keys(urls)
      });
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({
        error: "Erro ao processar imagem",
      });
    }
  });
};

// Get available formats for an image
export const getImageFormats: RequestHandler = (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({ error: "Nome do arquivo é obrigatório" });
  }

  const baseName = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const formats: { [key: string]: string } = {};
  
  for (const sizeName of Object.keys(sizeConfigs)) {
    const imagePath = path.join(uploadsDir, sizeName, `${baseName}-${sizeName}.webp`);
    if (fs.existsSync(imagePath)) {
      formats[sizeName] = `/uploads/${sizeName}/${baseName}-${sizeName}.webp`;
    }
  }
  
  res.json({ formats });
};

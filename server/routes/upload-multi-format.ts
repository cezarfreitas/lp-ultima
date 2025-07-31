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

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for Sharp processing

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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Image format configurations
const IMAGE_FORMATS = {
  thumbnail: { width: 150, height: 150, quality: 80 },
  small: { width: 400, height: 400, quality: 85 },
  medium: { width: 800, height: 800, quality: 90 },
  large: { width: 1200, height: 1200, quality: 95 },
};

interface ProcessedImages {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: {
    width: number;
    height: number;
    size: number;
  };
}

// Process image into multiple formats
async function processImageFormats(
  buffer: Buffer,
  originalName: string,
): Promise<ProcessedImages> {
  const timestamp = Date.now();
  const randomId = Math.round(Math.random() * 1e9);
  const baseName = path.parse(originalName).name;
  
  const results: ProcessedImages = {
    thumbnail: "",
    small: "",
    medium: "",
    large: "",
    original: { width: 0, height: 0, size: buffer.length },
  };

  // Get original image metadata
  const metadata = await sharp(buffer).metadata();
  results.original.width = metadata.width || 0;
  results.original.height = metadata.height || 0;

  // Process each format
  for (const [formatName, config] of Object.entries(IMAGE_FORMATS)) {
    const filename = `${baseName}-${formatName}-${timestamp}-${randomId}.webp`;
    const filePath = path.join(uploadsDir, filename);

    await sharp(buffer)
      .resize(config.width, config.height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: config.quality })
      .toFile(filePath);

    results[formatName as keyof typeof IMAGE_FORMATS] = `/uploads/${filename}`;
  }

  return results;
}

// Upload and process single file endpoint
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
      // Process image into multiple formats
      const processedImages = await processImageFormats(
        req.file.buffer,
        req.file.originalname,
      );

      // Calculate compression savings
      const thumbnailSize = fs.statSync(
        path.join(uploadsDir, processedImages.thumbnail.replace("/uploads/", "")),
      ).size;
      const smallSize = fs.statSync(
        path.join(uploadsDir, processedImages.small.replace("/uploads/", "")),
      ).size;
      const mediumSize = fs.statSync(
        path.join(uploadsDir, processedImages.medium.replace("/uploads/", "")),
      ).size;
      const largeSize = fs.statSync(
        path.join(uploadsDir, processedImages.large.replace("/uploads/", "")),
      ).size;

      const totalOptimizedSize = thumbnailSize + smallSize + mediumSize + largeSize;
      const originalSize = processedImages.original.size;
      const savings = ((originalSize - totalOptimizedSize) / originalSize) * 100;

      res.json({
        message: "Upload realizado com sucesso em múltiplos formatos",
        formats: processedImages,
        sizes: {
          original: {
            bytes: originalSize,
            formatted: formatBytes(originalSize),
          },
          thumbnail: {
            bytes: thumbnailSize,
            formatted: formatBytes(thumbnailSize),
          },
          small: {
            bytes: smallSize,
            formatted: formatBytes(smallSize),
          },
          medium: {
            bytes: mediumSize,
            formatted: formatBytes(mediumSize),
          },
          large: {
            bytes: largeSize,
            formatted: formatBytes(largeSize),
          },
          total_optimized: {
            bytes: totalOptimizedSize,
            formatted: formatBytes(totalOptimizedSize),
          },
        },
        compression: {
          total_savings_percent: Math.round(savings * 100) / 100,
          space_saved: formatBytes(originalSize - totalOptimizedSize),
        },
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({
        error: "Erro ao processar imagem",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

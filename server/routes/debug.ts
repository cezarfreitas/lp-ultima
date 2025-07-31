import { RequestHandler } from "express";
import { pool } from "../database/config";

// Debug endpoint to check database URLs
export const getDebugImageUrls: RequestHandler = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, image_url, created_at, updated_at FROM product_items ORDER BY id DESC LIMIT 10"
    );
    
    res.json({
      message: "URLs das imagens no banco",
      data: rows
    });
  } catch (error) {
    console.error("Error fetching debug data:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

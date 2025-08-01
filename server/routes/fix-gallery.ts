import { RequestHandler } from "express";
import { pool } from "../database/config";

// Fix gallery URLs with existing multi-format images
export const fixGalleryUrls: RequestHandler = async (req, res) => {
  try {
    // Available images in medium format
    const availableImages = [
      "/uploads/medium/CÃ³pia de @mauvistto_ECKO UNLTD--12-1754006127096-834392953-medium.webp",
      "/uploads/medium/CÃ³pia de @mauvistto_ECKO UNLTD--12-1754006160724-30289477-medium.webp", 
      "/uploads/medium/CÃ³pia de @mauvistto_ECKO UNLTD--12-1754006180791-535179300-medium.webp"
    ];

    // Get all products
    const [products] = await pool.execute(
      "SELECT id FROM product_items ORDER BY id ASC"
    );
    
    const productList = products as Array<{id: number}>;
    const updates = [];

    for (let i = 0; i < productList.length && i < availableImages.length; i++) {
      const product = productList[i];
      const imageUrl = availableImages[i];
      
      await pool.execute(
        "UPDATE product_items SET image_url = ? WHERE id = ?",
        [imageUrl, product.id]
      );
      
      updates.push({
        id: product.id,
        new_url: imageUrl
      });
    }

    res.json({
      message: "Gallery URLs fixed",
      updated: updates.length,
      updates
    });
  } catch (error) {
    console.error("Error fixing gallery URLs:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

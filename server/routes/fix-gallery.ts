import { RequestHandler } from "express";
import { pool } from "../database/config";

// Fix gallery URLs with existing multi-format images
export const fixGalleryUrls: RequestHandler = async (req, res) => {
  try {
    // Available working images (using old format temporarily)
    const availableImages = [
      "/uploads/file-1753965760377-749116186.png",
      "/uploads/file-1753965764727-496696993.png",
      "/uploads/file-1753965806646-564295651.png",
      "/uploads/file-1753965811939-349385636.png",
      "/uploads/file-1753965907323-773306901.png",
      "/uploads/file-1753967601283-437363940.png"
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

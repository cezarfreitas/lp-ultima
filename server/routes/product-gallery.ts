import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const ProductGalleryUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_description: z.string().optional(),
});

const ProductItemCreateSchema = z.object({
  image_url: z.string().min(1, "URL da imagem é obrigatória").refine(
    (url) => {
      // Accept relative URLs (starting with /) or absolute URLs
      return url.startsWith('/') || z.string().url().safeParse(url).success;
    },
    { message: "URL da imagem inválida" }
  ),
  alt_text: z.string().optional(),
  position: z.number().int().min(1).optional(),
});

const ProductItemUpdateSchema = z.object({
  image_url: z.string().min(1).refine(
    (url) => {
      // Accept relative URLs (starting with /) or absolute URLs
      return url.startsWith('/') || z.string().url().safeParse(url).success;
    },
    { message: "URL da imagem inválida" }
  ).optional(),
  alt_text: z.string().optional(),
  position: z.number().int().min(1).optional(),
});

// Get product gallery with all products
export const getProductGallery: RequestHandler = async (req, res) => {
  try {
    // Get gallery settings
    const [galleryRows] = await pool.execute('SELECT * FROM product_gallery LIMIT 1');
    const gallery = (galleryRows as any[])[0];
    
    if (!gallery) {
      return res.status(404).json({ error: 'Galeria não encontrada' });
    }

    // Get all products for this gallery
    const [productRows] = await pool.execute(
      'SELECT * FROM product_items WHERE gallery_id = ? ORDER BY position ASC',
      [gallery.id]
    );

    const galleryWithProducts = {
      ...gallery,
      products: productRows
    };
    
    res.json(galleryWithProducts);
  } catch (error) {
    console.error('Error fetching product gallery:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update gallery settings
export const updateProductGallery: RequestHandler = async (req, res) => {
  try {
    const validation = ProductGalleryUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const data = validation.data;
    const updateFields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => data[field as keyof typeof data]);
    
    await pool.execute(
      `UPDATE product_gallery SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT * FROM (SELECT id FROM product_gallery LIMIT 1) as temp)`,
      values
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM product_gallery LIMIT 1');
    const updatedGallery = (rows as any[])[0];
    
    res.json(updatedGallery);
  } catch (error) {
    console.error('Error updating product gallery:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Create new product item
export const createProductItem: RequestHandler = async (req, res) => {
  try {
    const validation = ProductItemCreateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const { image_url, alt_text, position } = validation.data;
    
    // Get gallery ID
    const [galleryRows] = await pool.execute('SELECT id FROM product_gallery LIMIT 1');
    const gallery = (galleryRows as any[])[0];
    
    if (!gallery) {
      return res.status(404).json({ error: 'Galeria não encontrada' });
    }
    
    // If position not provided, get next position
    let finalPosition = position;
    if (!finalPosition) {
      const [positionRows] = await pool.execute(
        'SELECT MAX(position) as max_position FROM product_items WHERE gallery_id = ?',
        [gallery.id]
      );
      const maxPosition = (positionRows as any[])[0].max_position || 0;
      finalPosition = maxPosition + 1;
    }
    
    const [result] = await pool.execute(`
      INSERT INTO product_items (gallery_id, image_url, alt_text, position)
      VALUES (?, ?, ?, ?)
    `, [gallery.id, image_url, alt_text || 'Produto Ecko', finalPosition]);
    
    const insertId = (result as any).insertId;
    
    // Get the created product
    const [rows] = await pool.execute('SELECT * FROM product_items WHERE id = ?', [insertId]);
    const newProduct = (rows as any[])[0];
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Update product item
export const updateProductItem: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const validation = ProductItemUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validation.error.errors 
      });
    }
    
    const data = validation.data;
    const updateFields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => data[field as keyof typeof data]);
    
    await pool.execute(
      `UPDATE product_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    // Return updated data
    const [rows] = await pool.execute('SELECT * FROM product_items WHERE id = ?', [id]);
    const updatedProduct = (rows as any[])[0];
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Delete product item
export const deleteProductItem: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const [result] = await pool.execute('DELETE FROM product_items WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting product item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Reorder products
export const reorderProducts: RequestHandler = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds deve ser um array' });
    }
    
    // Update positions
    for (let i = 0; i < productIds.length; i++) {
      await pool.execute(
        'UPDATE product_items SET position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [i + 1, productIds[i]]
      );
    }
    
    res.json({ message: 'Ordem dos produtos atualizada' });
  } catch (error) {
    console.error('Error reordering products:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

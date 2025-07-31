import { RequestHandler } from "express";
import { pool, HeroSection } from "../database/config";
import { z } from "zod";

// Schema for validation
const HeroUpdateSchema = z.object({
  logo_text: z.string().optional(),
  logo_image: z.string().optional(),
  impact_title: z.string().optional(),
  impact_subtitle: z.string().optional(),
  description: z.string().optional(),
  button_text: z.string().optional(),
  background_image: z.string().optional(),
});

// Get hero section data
export const getHeroSection: RequestHandler = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM hero_section ORDER BY id DESC LIMIT 1",
    );
    const hero = (rows as HeroSection[])[0];

    if (!hero) {
      return res.status(404).json({ error: "Hero section not found" });
    }

    res.json(hero);
  } catch (error) {
    console.error("Error fetching hero section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update hero section data
export const updateHeroSection: RequestHandler = async (req, res) => {
  try {
    const validation = HeroUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: validation.error.errors,
      });
    }

    const data = validation.data;
    const updateFields = Object.keys(data);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Build dynamic update query
    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map(
      (field) => data[field as keyof typeof data],
    );

    await pool.execute(
      `UPDATE hero_section SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM (SELECT id FROM hero_section ORDER BY id DESC LIMIT 1) as temp)`,
      values,
    );

    // Return updated data
    const [rows] = await pool.execute(
      "SELECT * FROM hero_section ORDER BY id DESC LIMIT 1",
    );
    const updatedHero = (rows as HeroSection[])[0];

    res.json(updatedHero);
  } catch (error) {
    console.error("Error updating hero section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new hero section (admin backup/versioning)
export const createHeroSection: RequestHandler = async (req, res) => {
  try {
    const validation = HeroUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: validation.error.errors,
      });
    }

    const {
      logo_text = "L",
      logo_image = "",
      impact_title = "Seja bem-vindo ao",
      impact_subtitle = "Futuro Digital",
      description = "Transforme suas ideias em realidade com nossa plataforma inovadora.",
      button_text = "Comece Agora",
      background_image = "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80",
    } = validation.data;

    const [result] = await pool.execute(
      `
      INSERT INTO hero_section (logo_text, logo_image, impact_title, impact_subtitle, description, button_text, background_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        logo_text,
        logo_image,
        impact_title,
        impact_subtitle,
        description,
        button_text,
        background_image,
      ],
    );

    const insertId = (result as any).insertId;

    // Return newly created data
    const [rows] = await pool.execute(
      "SELECT * FROM hero_section WHERE id = ?",
      [insertId],
    );
    const newHero = (rows as HeroSection[])[0];

    res.status(201).json(newHero);
  } catch (error) {
    console.error("Error creating hero section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

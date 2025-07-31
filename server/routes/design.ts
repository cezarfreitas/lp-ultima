import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const DesignUpdateSchema = z.object({
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  text_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  font_family: z.string().max(100).optional(),
  font_size_base: z.string().max(10).optional(),
  font_weight_normal: z.string().max(10).optional(),
  font_weight_bold: z.string().max(10).optional(),
  border_radius: z.string().max(10).optional(),
});

// Get design settings
export const getDesignSettings: RequestHandler = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM design_settings ORDER BY id DESC LIMIT 1",
    );
    const settings = (rows as any[])[0];

    if (!settings) {
      return res.status(404).json({ error: "Design settings not found" });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching design settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update design settings
export const updateDesignSettings: RequestHandler = async (req, res) => {
  try {
    const validation = DesignUpdateSchema.safeParse(req.body);

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
      `UPDATE design_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM (SELECT id FROM design_settings ORDER BY id DESC LIMIT 1) as temp)`,
      values,
    );

    // Return updated data
    const [rows] = await pool.execute(
      "SELECT * FROM design_settings ORDER BY id DESC LIMIT 1",
    );
    const updatedSettings = (rows as any[])[0];

    res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating design settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new design settings (backup/versioning)
export const createDesignSettings: RequestHandler = async (req, res) => {
  try {
    const validation = DesignUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: validation.error.errors,
      });
    }

    const {
      primary_color = "#dc2626",
      secondary_color = "#6b7280",
      accent_color = "#000000",
      background_color = "#ffffff",
      text_color = "#000000",
      font_family = "Inter",
      font_size_base = "16px",
      font_weight_normal = "400",
      font_weight_bold = "700",
      border_radius = "8px",
    } = validation.data;

    const [result] = await pool.execute(
      `
      INSERT INTO design_settings (primary_color, secondary_color, accent_color, background_color, text_color, font_family, font_size_base, font_weight_normal, font_weight_bold, border_radius)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        primary_color,
        secondary_color,
        accent_color,
        background_color,
        text_color,
        font_family,
        font_size_base,
        font_weight_normal,
        font_weight_bold,
        border_radius,
      ],
    );

    const insertId = (result as any).insertId;

    // Return newly created data
    const [rows] = await pool.execute(
      "SELECT * FROM design_settings WHERE id = ?",
      [insertId],
    );
    const newSettings = (rows as any[])[0];

    res.status(201).json(newSettings);
  } catch (error) {
    console.error("Error creating design settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

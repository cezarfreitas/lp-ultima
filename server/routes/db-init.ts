import { RequestHandler } from "express";
import { initializeDatabase } from "../database/config";

export const initializeDB: RequestHandler = async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

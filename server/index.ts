import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getHeroSection, updateHeroSection, createHeroSection } from "./routes/hero";
import { initializeDB } from "./routes/db-init";
import { initializeDatabase } from "./database/config";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Database initialization route
  app.post("/api/init-db", initializeDB);

  // Hero section routes
  app.get("/api/hero", getHeroSection);
  app.put("/api/hero", updateHeroSection);
  app.post("/api/hero", createHeroSection);

  return app;
}

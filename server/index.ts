import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getHeroSection, updateHeroSection, createHeroSection } from "./routes/hero";
import { initializeDB } from "./routes/db-init";
import { uploadFile } from "./routes/upload";
import { migrateLogo } from "./routes/migrate";
import { getDesignSettings, updateDesignSettings, createDesignSettings } from "./routes/design";
import { initializeDatabase } from "./database/config";
import path from "path";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Database initialization route
  app.post("/api/init-db", initializeDB);

  // Database migration route
  app.post("/api/migrate-logo", migrateLogo);

  // Upload route
  app.post("/api/upload", uploadFile);

  // Hero section routes
  app.get("/api/hero", getHeroSection);
  app.put("/api/hero", updateHeroSection);
  app.post("/api/hero", createHeroSection);

  return app;
}

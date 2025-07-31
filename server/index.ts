import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getHeroSection,
  updateHeroSection,
  createHeroSection,
} from "./routes/hero";
import { initializeDB } from "./routes/db-init";
import { uploadFile } from "./routes/upload";
import { migrateLogo, migrateDesign, migrateLeads } from "./routes/migrate";
import { migrateNewTables } from "./routes/migrate-new-tables";
import { removeLimits } from "./routes/remove-limits";
import {
  getDesignSettings,
  updateDesignSettings,
  createDesignSettings,
} from "./routes/design";
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadsStats,
  sendConsumerWebhook,
} from "./routes/leads";
import { getWebhookSettings, updateWebhookSettings } from "./routes/webhooks";
import { getFormContent, updateFormContent } from "./routes/form-content";
import { initializeDatabase } from "./database/config";
import { paths } from "../shared/config.js";
import path from "path";

export function createServer() {
  const app = express();

  // Initialize database on server start
  initializeDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use("/uploads", express.static(paths.uploadsDir()));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Database initialization route
  app.post("/api/init-db", initializeDB);

  // Database migration routes
  app.post("/api/migrate-logo", migrateLogo);
  app.post("/api/migrate-design", migrateDesign);
  app.post("/api/migrate-leads", migrateLeads);
  app.post("/api/migrate-new-tables", migrateNewTables);
  app.post("/api/remove-limits", removeLimits);

  // Upload route
  app.post("/api/upload", uploadFile);

  // Hero section routes
  app.get("/api/hero", getHeroSection);
  app.put("/api/hero", updateHeroSection);
  app.post("/api/hero", createHeroSection);

  // Design settings routes
  app.get("/api/design", getDesignSettings);
  app.put("/api/design", updateDesignSettings);
  app.post("/api/design", createDesignSettings);

  // Leads routes
  app.post("/api/leads", createLead);
  app.get("/api/leads", getLeads);
  app.get("/api/leads/stats", getLeadsStats);
  app.get("/api/leads/:id", getLead);
  app.put("/api/leads/:id", updateLead);
  app.delete("/api/leads/:id", deleteLead);
  app.post("/api/consumer-webhook", sendConsumerWebhook);

  // Webhook settings routes
  app.get("/api/webhooks", getWebhookSettings);
  app.put("/api/webhooks", updateWebhookSettings);

  // Form content routes
  app.get("/api/form-content", getFormContent);
  app.put("/api/form-content", updateFormContent);

  return app;
}

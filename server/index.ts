import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { handleDemo } from "./routes/demo";
import {
  getHeroSection,
  updateHeroSection,
  createHeroSection,
} from "./routes/hero";
import { initializeDB } from "./routes/db-init";
import { uploadFile } from "./routes/upload";
import { uploadMultiFormat } from "./routes/upload-multi-format";
import { migrateLogo, migrateDesign, migrateLeads } from "./routes/migrate";
import { migrateNewTables } from "./routes/migrate-new-tables";
import { migrateProductGallery } from "./routes/migrate-product-gallery";
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
  getLeadsChart,
  sendConsumerWebhook,
} from "./routes/leads";
import { getWebhookSettings, updateWebhookSettings } from "./routes/webhooks";
import { getFormContent, updateFormContent } from "./routes/form-content";
import {
  getProductGallery,
  updateProductGallery,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  reorderProducts,
} from "./routes/product-gallery";
import {
  getTestimonialsSection,
  getAllTestimonials,
  updateTestimonialsSection,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from "./routes/testimonials";
import { migrateTestimonials } from "./routes/migrate-testimonials";
import {
  getFAQSection,
  getAllFAQs,
  updateFAQSection,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
} from "./routes/faq";
import { migrateFAQ } from "./routes/migrate-faq";
import {
  getShowroomSection,
  getAllShowroomItems,
  updateShowroomSection,
  createShowroomItem,
  updateShowroomItem,
  deleteShowroomItem,
  reorderShowroomItems,
} from "./routes/showroom";
import { migrateShowroom } from "./routes/migrate-showroom";
import {
  getFooterSection,
  getAllFooterLinks,
  updateFooterSection,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  reorderFooterLinks,
} from "./routes/footer";
import { migrateFooter } from "./routes/migrate-footer";
import {
  getAboutSection,
  getAllAboutStats,
  updateAboutSection,
  createAboutStat,
  updateAboutStat,
  deleteAboutStat,
  reorderAboutStats,
} from "./routes/about";
import { migrateAbout } from "./routes/migrate-about";
import { getSEO, updateSEO } from "./routes/seo";
import { migrateSEO } from "./routes/migrate-seo";
import {
  getAllPixels,
  getEnabledPixels,
  createPixel,
  updatePixel,
  deletePixel,
  togglePixel,
} from "./routes/pixels";
import { migratePixels } from "./routes/migrate-pixels";
import { migrateMultiFormat } from "./routes/migrate-multi-format";
import { sendMetaConversion } from "./routes/meta-conversion";
import { initializeDatabase } from "./database/config";
import { paths } from "../shared/config.js";
import path from "path";

export function createServer() {
  const app = express();

  // Initialize database on server start
  initializeDatabase().catch(console.error);

  // Performance middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP to avoid conflicts with Vite
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Response time tracking
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(
          `Slow response: ${req.method} ${req.path} took ${duration}ms`,
        );
      }
    });
    next();
  });

  app.use(
    compression({
      level: 6, // Balanced compression level
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers["x-no-compression"]) {
          return false;
        }
        // Use compression filter function
        return compression.filter(req, res);
      },
    }),
  );

  // CORS and body parsing middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Add performance headers to API responses
  app.use("/api", (req, res, next) => {
    // Enable caching for GET requests
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes cache
    } else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Vary", "Accept-Encoding");
    next();
  });

  // Serve uploaded files statically with caching
  app.use(
    "/uploads",
    express.static(paths.uploadsDir(), {
      maxAge: "7d", // Cache for 7 days
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Add cache control headers
        res.setHeader("Cache-Control", "public, max-age=604800"); // 7 days
        // Add compression hint
        if (
          path.endsWith(".js") ||
          path.endsWith(".css") ||
          path.endsWith(".html")
        ) {
          res.setHeader("Vary", "Accept-Encoding");
        }
      },
    }),
  );

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
  app.post("/api/migrate-product-gallery", migrateProductGallery);
  app.post("/api/remove-limits", removeLimits);

  // Upload routes
  app.post("/api/upload", uploadFile);
  app.post("/api/upload/multi-format", uploadMultiFormat);

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
  app.get("/api/leads/chart", getLeadsChart);
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

  // Product gallery routes
  app.get("/api/product-gallery", getProductGallery);
  app.put("/api/product-gallery", updateProductGallery);
  app.post("/api/product-gallery/products", createProductItem);
  app.put("/api/product-gallery/products/:id", updateProductItem);
  app.delete("/api/product-gallery/products/:id", deleteProductItem);
  app.post("/api/product-gallery/reorder", reorderProducts);

  // Testimonials routes
  app.get("/api/testimonials", getTestimonialsSection);
  app.get("/api/admin/testimonials", getAllTestimonials);
  app.put("/api/testimonials/section", updateTestimonialsSection);
  app.post("/api/testimonials", createTestimonial);
  app.put("/api/testimonials/:id", updateTestimonial);
  app.delete("/api/testimonials/:id", deleteTestimonial);
  app.post("/api/testimonials/reorder", reorderTestimonials);

  // FAQ routes
  app.get("/api/faq", getFAQSection);
  app.get("/api/admin/faq", getAllFAQs);
  app.put("/api/faq/section", updateFAQSection);
  app.post("/api/faq", createFAQ);
  app.put("/api/faq/:id", updateFAQ);
  app.delete("/api/faq/:id", deleteFAQ);
  app.post("/api/faq/reorder", reorderFAQs);

  // Showroom routes
  app.get("/api/showroom", getShowroomSection);
  app.get("/api/admin/showroom", getAllShowroomItems);
  app.put("/api/showroom/section", updateShowroomSection);
  app.post("/api/showroom", createShowroomItem);
  app.put("/api/showroom/:id", updateShowroomItem);
  app.delete("/api/showroom/:id", deleteShowroomItem);
  app.post("/api/showroom/reorder", reorderShowroomItems);

  // Footer routes
  app.get("/api/footer", getFooterSection);
  app.get("/api/admin/footer", getAllFooterLinks);
  app.put("/api/footer/section", updateFooterSection);
  app.post("/api/footer/links", createFooterLink);
  app.put("/api/footer/links/:id", updateFooterLink);
  app.delete("/api/footer/links/:id", deleteFooterLink);
  app.post("/api/footer/reorder", reorderFooterLinks);

  // About routes
  app.get("/api/about", getAboutSection);
  app.get("/api/admin/about", getAllAboutStats);
  app.put("/api/about/section", updateAboutSection);
  app.post("/api/about/stats", createAboutStat);
  app.put("/api/about/stats/:id", updateAboutStat);
  app.delete("/api/about/stats/:id", deleteAboutStat);
  app.post("/api/about/reorder", reorderAboutStats);

  // SEO routes
  app.get("/api/seo", getSEO);
  app.put("/api/seo", updateSEO);

  // Pixels routes
  app.get("/api/pixels", getAllPixels);
  app.get("/api/pixels/enabled", getEnabledPixels);
  app.post("/api/pixels", createPixel);
  app.put("/api/pixels/:id", updatePixel);
  app.delete("/api/pixels/:id", deletePixel);
  app.put("/api/pixels/:id/toggle", togglePixel);

  // Meta Conversions API
  app.post("/api/meta-conversion", sendMetaConversion);

  // Migration routes
  app.post("/api/migrate-testimonials", migrateTestimonials);
  app.post("/api/migrate-faq", migrateFAQ);
  app.post("/api/migrate-showroom", migrateShowroom);
  app.post("/api/migrate-footer", migrateFooter);
  app.post("/api/migrate-about", migrateAbout);
  app.post("/api/migrate-seo", migrateSEO);
  app.post("/api/migrate-pixels", migratePixels);
  app.post("/api/migrate-multi-format", migrateMultiFormat);

  return app;
}

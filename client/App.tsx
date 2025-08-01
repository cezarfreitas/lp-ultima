import "./lib/consoleOverride";
import "./global.css";
import React from "react";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminHeroTabbed from "./pages/AdminHeroTabbed";
import AdminDesign from "./pages/AdminDesign";
import AdminLeads from "./pages/AdminLeads";
import AdminFormContent from "./pages/AdminFormContent";
import AdminProductGallery from "./pages/AdminProductGallery";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminFAQ from "./pages/AdminFAQ";
import AdminShowroom from "./pages/AdminShowroom";
import AdminAbout from "./pages/AdminAbout";
import AdminFooter from "./pages/AdminFooter";
import AdminSettings from "./pages/AdminSettings";
import InitDB from "./pages/InitDB";
import Migrate from "./pages/Migrate";
import MigrateTestimonials from "./pages/MigrateTestimonials";
import MigrateFAQ from "./pages/MigrateFAQ";
import MigrateShowroom from "./pages/MigrateShowroom";
import MigrateAbout from "./pages/MigrateAbout";
import MigrateFooter from "./pages/MigrateFooter";
import AdminSEO from "./pages/AdminSEO";
import MigrateSEO from "./pages/MigrateSEO";
import MigratePixels from "./pages/MigratePixels";
import AdminPixels from "./pages/AdminPixels";
import SetupComplete from "./pages/SetupComplete";
import TestTestimonials from "./pages/TestTestimonials";
import TestUpload from "./pages/TestUpload";
import FixGallery from "./pages/FixGallery";
import ProcessImages from "./pages/ProcessImages";
import FixHero from "./pages/FixHero";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminHeroTabbed />} />
          <Route path="/admin/design" element={<AdminDesign />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/form-content" element={<AdminFormContent />} />
          <Route
            path="/admin/product-gallery"
            element={<AdminProductGallery />}
          />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/faq" element={<AdminFAQ />} />
          <Route path="/admin/showroom" element={<AdminShowroom />} />
          <Route path="/admin/about" element={<AdminAbout />} />
          <Route path="/admin/footer" element={<AdminFooter />} />
          <Route path="/admin/seo" element={<AdminSEO />} />
          <Route path="/admin/pixels" element={<AdminPixels />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/init-db" element={<InitDB />} />
          <Route path="/migrate" element={<Migrate />} />
          <Route
            path="/migrate-testimonials"
            element={<MigrateTestimonials />}
          />
          <Route path="/migrate-faq" element={<MigrateFAQ />} />
          <Route path="/migrate-showroom" element={<MigrateShowroom />} />
          <Route path="/migrate-about" element={<MigrateAbout />} />
          <Route path="/migrate-footer" element={<MigrateFooter />} />
          <Route path="/migrate-seo" element={<MigrateSEO />} />
          <Route path="/migrate-pixels" element={<MigratePixels />} />
          <Route path="/setup-complete" element={<SetupComplete />} />
          <Route path="/test-testimonials" element={<TestTestimonials />} />
          <Route path="/test-upload" element={<TestUpload />} />
          <Route path="/fix-gallery" element={<FixGallery />} />
          <Route path="/process-images" element={<ProcessImages />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

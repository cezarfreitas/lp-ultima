import "./global.css";

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
import AdminSettings from "./pages/AdminSettings";
import InitDB from "./pages/InitDB";
import Migrate from "./pages/Migrate";
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
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/init-db" element={<InitDB />} />
          <Route path="/migrate" element={<Migrate />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    // Fix MIME type issues
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  build: {
    outDir: "dist",
    // Optimize chunks for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-accordion", "@radix-ui/react-dialog"],
        },
      },
    },
    // Enable compression
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096,
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Remove DevTools in production
      devTarget: mode === "development" ? "es2020" : "es2018",
    }),
    expressPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Enable CSS optimization
  css: {
    devSourcemap: mode === "development",
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Fix MIME types for modules
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Set correct MIME types for various file types
        if (url.endsWith('.tsx') || url.endsWith('.ts') || url.includes('/.vite/') || url.includes('/assets/')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (url.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (url.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        } else if (url.endsWith('.js') || url.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }

        next();
      });

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

import path from "path";

// Environment-based configuration
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // Server
  PORT: parseInt(process.env.PORT || "8080"),
  HOST: process.env.HOST || "localhost",

  // Paths
  BUILD_DIR: process.env.BUILD_DIR || "dist",
  PUBLIC_DIR: process.env.PUBLIC_DIR || "public",
  UPLOADS_DIR: process.env.UPLOADS_DIR || "uploads",

  // Database
  DATABASE: {
    host: process.env.DB_HOST || "148.230.78.129",
    port: parseInt(process.env.DB_PORT || "3307"),
    user: process.env.DB_USER || "ecko",
    password: process.env.DB_PASSWORD || "5acf3bfd1f1c3846491a",
    database: process.env.DB_NAME || "lp-ecko-db",
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
  },

  // Webhooks
  WEBHOOK: {
    url: process.env.WEBHOOK_URL || "",
    secret: process.env.WEBHOOK_SECRET || "",
  },

  // Development
  DEV: {
    proxyPort: parseInt(process.env.DEV_PROXY_PORT || "8080"),
    vitePort: parseInt(process.env.VITE_DEV_PORT || "8080"),
  },

  // Production
  PROD: {
    staticFilesPath: process.env.STATIC_FILES_PATH || "/app/public",
    serverTimeout: parseInt(process.env.SERVER_TIMEOUT || "30000"),
  },
};

// Helper functions for path resolution
export const paths = {
  // Resolve build directory path
  buildDir: (relativePath = "") => {
    if (config.IS_PRODUCTION) {
      return path.join(config.PROD.staticFilesPath, relativePath);
    }
    return path.join(process.cwd(), config.BUILD_DIR, relativePath);
  },

  // Resolve uploads directory path
  uploadsDir: (relativePath = "") => {
    return path.join(process.cwd(), config.UPLOADS_DIR, relativePath);
  },

  // Resolve public directory path
  publicDir: (relativePath = "") => {
    if (config.IS_PRODUCTION) {
      return path.join(config.PROD.staticFilesPath, relativePath);
    }
    return path.join(process.cwd(), config.PUBLIC_DIR, relativePath);
  },

  // Get static files directory for serving
  getStaticDir: () => {
    if (config.IS_PRODUCTION) {
      return config.PROD.staticFilesPath;
    }
    return path.join(process.cwd(), config.BUILD_DIR);
  },

  // Get index.html path
  getIndexPath: () => {
    return path.join(paths.getStaticDir(), "index.html");
  },
};

// Validation
export const validateConfig = () => {
  const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
  }

  console.log(`🔧 Environment: ${config.NODE_ENV}`);
  console.log(`📁 Build Directory: ${paths.getStaticDir()}`);
  console.log(
    `🗄️  Database: ${config.DATABASE.host}:${config.DATABASE.port}/${config.DATABASE.database}`,
  );
};

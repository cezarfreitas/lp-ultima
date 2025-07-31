# Multi-stage build for production deployment
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built frontend from build stage
COPY --from=build /app/dist ./public

# Copy server source code
COPY server ./server
COPY shared ./shared

# Create uploads directory
RUN mkdir -p uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=80

# Expose port
EXPOSE 80

# Create simple production server
RUN echo 'import express from "express";\
import path from "path";\
import { fileURLToPath } from "url";\
import { createServer } from "./server/index.js";\
\
const __filename = fileURLToPath(import.meta.url);\
const __dirname = path.dirname(__filename);\
\
const app = createServer();\
\
// Serve static files from public directory\
app.use(express.static(path.join(__dirname, "public")));\
\
// Handle SPA routing - serve index.html for non-API routes\
app.get("*", (req, res) => {\
  if (req.path.startsWith("/api/")) {\
    return res.status(404).json({ error: "API endpoint not found" });\
  }\
  res.sendFile(path.join(__dirname, "public", "index.html"));\
});\
\
const PORT = process.env.PORT || 80;\
app.listen(PORT, () => {\
  console.log(`🚀 Server running on port ${PORT}`);\
  console.log(`📱 Frontend: http://localhost:${PORT}`);\
  console.log(`🔧 API: http://localhost:${PORT}/api`);\
});\
' > start.mjs

# Start the server
CMD ["node", "start.mjs"]

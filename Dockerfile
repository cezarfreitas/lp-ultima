# Multi-stage build optimized for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV BUILD_DIR=dist

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./public

# Copy server code and shared modules
COPY server ./server
COPY shared ./shared

# Create necessary directories
RUN mkdir -p uploads

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=80
ENV BUILD_DIR=dist
ENV PUBLIC_DIR=public
ENV UPLOADS_DIR=uploads
ENV STATIC_FILES_PATH=/app/public

# Copy environment configuration
COPY .env.example .env

# Expose application port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/ping', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1) \
  }).on('error', () => process.exit(1))"

# Start the application using tsx to run TypeScript
CMD ["npx", "tsx", "server/node-build.ts"]

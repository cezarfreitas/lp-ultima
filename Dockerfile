# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the client (static site)
RUN npx vite build

# Compile TypeScript server code to JavaScript
RUN npx tsc server/node-build.ts --outDir dist-server --module commonjs --target es2020 --esModuleInterop --allowSyntheticDefaultImports --resolveJsonModule

# Production stage - serve both static files and backend APIs
FROM node:18-alpine AS production

WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built static files
COPY --from=builder /app/dist /app/dist

# Copy compiled server code
COPY --from=builder /app/dist-server /app/dist-server

# Copy server source and shared code (needed for imports)
COPY server /app/server
COPY shared /app/shared

# Copy uploads directory structure
RUN mkdir -p /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Expose port 80
EXPOSE 80

# Start the compiled Node.js server
CMD ["node", "dist-server/node-build.js"]

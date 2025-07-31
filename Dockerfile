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

# Production stage - serve both static files and backend APIs
FROM node:18-alpine AS production

WORKDIR /app

# Copy package.json and install dependencies with tsx for running TypeScript
COPY package*.json ./
RUN npm install --legacy-peer-deps tsx

# Copy built static files
COPY --from=builder /app/dist /app/dist

# Copy server source and shared code
COPY server /app/server
COPY shared /app/shared

# Copy uploads directory structure
RUN mkdir -p /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Expose port 80
EXPOSE 80

# Start the TypeScript server using tsx
CMD ["npx", "tsx", "server/node-build.ts"]

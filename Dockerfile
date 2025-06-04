# Use Node.js 20 LTS version (required for NestJS 11)
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Set environment variables needed for build
ENV NODE_ENV=production
ENV DATABASE_URL="mysql://localhost:3306/API"

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and Prisma schema to production stage
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Generate Prisma client in production stage
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Add curl for health checks
RUN apk add --no-cache curl

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/ || exit 1

# Start the application
CMD ["npm", "run", "start:prod"] 
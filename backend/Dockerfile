# Napment Onboarding Backend
# Node.js with WebSocket + OAuth

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for TypeScript)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:8001/health || exit 1

CMD ["node", "dist/main.js"]


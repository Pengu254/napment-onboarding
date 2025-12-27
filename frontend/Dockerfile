# Napment Onboarding Frontend - Generative UI
# Multi-stage Docker build

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build arguments for environment
ARG VITE_WS_URL=wss://onboarding-api.bobbi.live/ws
ARG VITE_API_URL=https://onboarding-api.bobbi.live
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# ============================================================================
# Stage 2: Production (Nginx)
# ============================================================================
FROM nginx:alpine AS production

# Install wget for health check
RUN apk add --no-cache wget

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:3001/health || exit 1

CMD ["nginx", "-g", "daemon off;"]


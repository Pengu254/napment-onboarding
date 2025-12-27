# Napment Onboarding Backend
# Node.js with WebSocket + OAuth

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:8001/health || exit 1

# Install wget for healthcheck
RUN apk add --no-cache wget

CMD ["node", "dist/main.js"]


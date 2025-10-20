# Multi-stage build for LibreChat Admin Panel with MongoDB backend

# Stage 1: Build the React application
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY admin-ui/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY admin-ui/ ./

# Build the application
RUN npm run build

# Stage 2: Install backend dependencies
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY admin-api/package*.json ./

# Install production dependencies only
RUN npm ci --production

# Stage 3: Production image with Node.js, nginx, and both frontend and backend
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

# Create necessary directories
RUN mkdir -p /usr/share/nginx/html/admin /app/admin-api /run/nginx

# Copy built frontend assets from frontend-builder stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html/admin

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy backend API code and dependencies
COPY --from=backend-builder /app/node_modules /app/admin-api/node_modules
COPY admin-api/src /app/admin-api/src
COPY admin-api/package.json /app/admin-api/

WORKDIR /app/admin-api

# Create startup script to run both nginx and backend API
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Starting LibreChat Admin Panel..."' >> /start.sh && \
    echo 'echo "📦 Starting backend API server..."' >> /start.sh && \
    echo 'node src/server.js &' >> /start.sh && \
    echo 'API_PID=$!' >> /start.sh && \
    echo 'echo "🌐 Starting nginx..."' >> /start.sh && \
    echo 'nginx -g "daemon off;" &' >> /start.sh && \
    echo 'NGINX_PID=$!' >> /start.sh && \
    echo 'echo "✅ All services started"' >> /start.sh && \
    echo 'echo "   - Backend API: http://localhost:3001"' >> /start.sh && \
    echo 'echo "   - Frontend: http://localhost:80/admin/"' >> /start.sh && \
    echo 'wait $API_PID $NGINX_PID' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 3001

# Health check (check both nginx and API)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/admin/ && \
      wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["/start.sh"]

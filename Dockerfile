# Multi-stage build for LibreChat Admin Panel

# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY admin-ui/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY admin-ui/ ./

# Build the application
RUN npm run build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/admin

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/admin/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# Multi-stage build for production-ready React + Vite frontend

# Stage 1: Build
FROM node:24-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run -w build

# Stage 2: Production
FROM nginx:alpine AS production


# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy startup script for runtime environment injection
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy nginx template (rendered by entrypoint to inject BACKEND_UPSTREAM)
COPY docker/nginx.default.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

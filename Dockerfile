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

# Copy both nginx configuration templates. entrypoint.sh picks one at
# container start based on the PROXY env var: nginx.proxy.conf.template
# (reverse-proxies /api to BACKEND_INTERNAL_URL, kept off the browser) or
# nginx.direct.conf.template (static-only, browser calls the backend directly).
COPY docker/nginx.proxy.conf.template /etc/nginx/templates/nginx.proxy.conf.template
COPY docker/nginx.direct.conf.template /etc/nginx/templates/nginx.direct.conf.template

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1/ || exit 1

# Start nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

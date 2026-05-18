# ── Stage 1: Build the React app ──────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first (layer cache friendly)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY public/ ./public/
COPY src/    ./src/
RUN npm run build

# ── Stage 2: Serve the static files with nginx ────────────────────────────────
FROM nginx:1.25-alpine

# Install curl so the HEALTHCHECK can probe the server
RUN apk add --no-cache curl

# Copy the React production build
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config (SPA routing + reverse proxy to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# Stage 1: build the React app
FROM node:18-alpine AS build

WORKDIR /app

# install deps first so this layer is cached when only source changes
COPY package*.json ./
RUN npm ci --prefer-offline

COPY public/ ./public/
COPY src/ ./src/
RUN npm run build

# Stage 2: serve the built files with nginx
FROM nginx:1.25-alpine

# curl is needed for the healthcheck below
RUN apk add --no-cache curl

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

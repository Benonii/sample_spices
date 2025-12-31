# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Build the frontend
# Assuming the build script in root package.json or using turbo
RUN bun run build --filter=frontend

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

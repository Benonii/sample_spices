# Build stage
FROM node:20-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app


# Copy all files
COPY . .

# Install dependencies
RUN pnpm install

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend
# Assuming the build script in root package.json or using turbo
RUN pnpm run build --filter=frontend

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

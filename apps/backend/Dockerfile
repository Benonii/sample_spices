FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN pnpm install

# Set working directory to backend
WORKDIR /app/apps/backend

# Expose port
EXPOSE 5000

# Start the application
CMD ["pnpm", "run", "start"]

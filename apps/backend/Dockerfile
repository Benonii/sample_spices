FROM oven/bun:1 AS base
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Set working directory to backend
WORKDIR /app/apps/backend

# Expose port
EXPOSE 5000

# Start the application
CMD ["bun", "run", "start"]

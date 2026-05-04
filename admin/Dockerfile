# Stage 1: Build the Vite React App
FROM node:24.15.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
# We use bun in the actual project, but npm works fine too. Using npm ci for reliability.
COPY package.json bun.lock ./
RUN npm install -g bun
RUN bun install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine AS runner

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

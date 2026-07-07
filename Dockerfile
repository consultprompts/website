# Build stage
FROM node:22-slim AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built assets from the build stage
COPY --from=build /app/dist ./dist

# Copy the server entry point (and any other necessary files)
COPY server.ts ./

# Expose the port (Cloud Run will inject PORT env var, but 3000 is our default)
EXPOSE 3000

# Start the server using the npm script which we updated to include the flag
CMD ["npm", "start"]

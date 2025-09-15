# Use Node 20 as the base image for building the project
FROM node:20-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install the latest npm version
RUN npm install -g npm@latest

# Install all dependencies including dev dependencies for building
RUN npm install --legacy-peer-deps

# Copy the entire project
COPY . .

# Build the Next.js project
RUN npm run build

# Create a minimal production image
FROM node:20-slim AS runner

WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production

# Copy entire .next folder from builder (✅ FIXED HERE)
COPY --from=builder /app/.next ./.next

# Copy public assets
COPY --from=builder /app/public ./public

# Copy required config files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps

# Expose the port Next.js runs on
EXPOSE 3000

# Start the production server
CMD ["npm", "run", "start"]

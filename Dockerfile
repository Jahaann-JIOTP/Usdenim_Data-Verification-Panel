# Use Node 20 as the base image for building the project
FROM node:20-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for building the app)
RUN npm install --legacy-peer-deps

# Copy the rest of the project files
COPY . .

# Build the Next.js project
RUN npm run build

# Create a production image
FROM node:20-slim AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only the build artifacts from the builder stage
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 3000

# Copy package.json again and install all dependencies (including 'next')
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install --legacy-peer-deps

# Start the production server
CMD ["npm", "run", "start"]

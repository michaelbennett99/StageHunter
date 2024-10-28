# Dockerfile for a nextjs frontend
# Set base image
FROM node:20-alpine AS base

# First stage: Install dependencies
FROM base AS deps
# We need this for some reason
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Second stage: Development
FROM base AS development
WORKDIR /app

RUN npm install -g pnpm

# Copy all the files we need
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["pnpm", "dev"]

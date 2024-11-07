# Frontend Dockerfile
# -------------------
# Dockerfile for a nextjs frontend
#
# Development Mode:
# Required volumes:
# - ./frontend:/app   # Mount the frontend source code to allow hot reloading
# - /app/.next        # Don't copy .next from base image
# - /app/node_modules # Don't copy node_modules from base image
#
# Staging Mode:
# No required volumes, source will be copied into image
#
# Production Mode:
# No required volumes, source will be copied into image
#
# All modes:
# - Listens on port 3000

# Set base image
FROM node:20-alpine AS base

#
# First stage: Install dependencies, used for all environments
#
FROM base AS deps
# We need this for some reason
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Development Environment
FROM base AS development
WORKDIR /app

RUN npm install -g pnpm

# Copy all the node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["pnpm", "dev"]

#
# Staging Environment
#
FROM base AS staging
WORKDIR /app

RUN npm install -g pnpm

# Copy all the files we need
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]

#
# Production Environment
#
FROM base AS production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

RUN ["pnpm", "build"]

CMD ["pnpm", "start"]

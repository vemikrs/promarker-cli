# Use Node.js 18 LTS as base image
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /workspace

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Set up user permissions
RUN chown -R node:node /workspace
USER node

# Install global npm packages that are useful for development
RUN npm install -g \
    @types/node \
    tsx \
    vitest \
    prettier \
    eslint

# Copy package files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm install

# Copy source code
COPY --chown=node:node . .

# Build the project
RUN npm run build

# Default command
CMD ["bash"]
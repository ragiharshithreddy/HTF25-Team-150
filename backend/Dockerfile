# Backend Dockerfile
FROM node:18-alpine

LABEL maintainer="HTF25-Team-150"
LABEL description="Project Enrollment & Allocation System - Backend API"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip puppeteer download)
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]

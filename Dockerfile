# Multi-stage build for WifiX production deployment

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/react/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/react/ ./

# Build frontend
RUN npm run build

# Stage 2: Production image
FROM python:3.11-slim

LABEL maintainer="WifiX Team"
LABEL description="WifiX - Easy LAN File Sharing"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    avahi-daemon \
    avahi-utils \
    libavahi-compat-libdnssd-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./backend/

# Install Python dependencies + gunicorn for production
RUN pip install --no-cache-dir -r backend/requirements.txt gunicorn

# Copy backend application
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/react/dist/

# Create uploads directory with proper permissions
RUN mkdir -p backend/uploads && \
    chmod 755 backend/uploads

# Create non-root user for security
RUN useradd -m -u 1000 wifux && \
    chown -R wifux:wifux /app

# Switch to non-root user
USER wifux

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/info').read()" || exit 1

# Production command using gunicorn with eventlet worker
CMD ["gunicorn", "-k", "eventlet", "-w", "1", "--bind", "0.0.0.0:5000", "--timeout", "300", "--log-level", "info", "backend.app:app"]

# Multi-stage build for WifiX production deployment

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/react/package*.json ./

# Install dependencies (need devDependencies for build)
RUN npm ci

# Copy frontend source
COPY frontend/react/ ./

# Build frontend
RUN npm run build

# Stage 2: Production image
FROM python:3.11-alpine

LABEL maintainer="WifiX Team"
LABEL description="WifiX - Easy LAN File Sharing"

# Set working directory
WORKDIR /app

# Install system dependencies (Alpine uses apk instead of apt-get)
RUN apk add --no-cache \
    gcc \
    musl-dev \
    linux-headers \
    avahi \
    avahi-dev \
    avahi-compat-libdns_sd \
    dbus

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

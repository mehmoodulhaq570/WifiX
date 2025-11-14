# 🚀 WifiX Deployment Guide

Complete guide for deploying WifiX in production environments.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Zeroconf/mDNS Service Discovery](#zeroconfmdns-service-discovery)
- [Production Considerations](#production-considerations)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Linux systemd Service](#linux-systemd-service)
  - [Windows Service](#windows-service)
- [Reverse Proxy Setup](#reverse-proxy-setup)
- [HTTPS Configuration](#https-configuration)
- [Environment Variables](#environment-variables)
- [Monitoring & Logs](#monitoring--logs)

---

## 🌟 Overview

WifiX is designed for **local network file sharing** with three deployment scenarios:

1. **Development**: Quick local testing with Flask dev server
2. **Production LAN**: Deployed on local network with production WSGI server
3. **Production Internet**: Deployed with HTTPS, reverse proxy, and security hardening

---

## 🔍 Zeroconf/mDNS Service Discovery

### What is Zeroconf?

**Zeroconf** (Zero Configuration Networking) allows devices to automatically discover services on a local network without manual configuration. WifiX uses this for automatic server discovery.

### How It Works in WifiX

When you start WifiX, it broadcasts itself on the local network:

```
Service Name: WifiX on 10.5.48.95._wifi-share._tcp.local.
Service Type: _wifi-share._tcp.local.
Port: 5000
IP Address: Your LAN IP
```

**Benefits:**

- ✅ Clients can auto-discover the server without typing IP addresses
- ✅ Mobile apps can scan for WifiX instances automatically
- ✅ Shows hostname and IP in network browsers (e.g., Bonjour Browser on macOS)
- ✅ Works across Windows, macOS, Linux, iOS, and Android

### Controlling Zeroconf

**Enable Zeroconf (default):**

```bash
export ENABLE_ZEROCONF=1
python backend/app.py
```

**Disable Zeroconf:**

```bash
export ENABLE_ZEROCONF=0
python backend/app.py
```

### Testing Zeroconf Discovery

**On macOS:**

```bash
dns-sd -B _wifi-share._tcp local.
# Should show: WifiX on <your-ip>._wifi-share._tcp.local.
```

**On Linux:**

```bash
avahi-browse -r _wifi-share._tcp
```

**On Windows:**

- Install [Bonjour Print Services](https://support.apple.com/kb/DL999)
- Use DNS-SD tools or network scanner apps

**Mobile Apps:**

- iOS: Network Analyzer, Discovery
- Android: Service Browser, BonjourBrowser

---

## ⚙️ Production Considerations

### 1. **Never Use Flask Development Server in Production**

Your logs show:

```
WARNING: This is a development server. Do not use it in a production deployment.
```

**Why?** The Flask dev server is:

- ❌ Single-threaded (slow)
- ❌ Not designed for security
- ❌ Cannot handle concurrent connections well

**Solution:** Use a production WSGI server (see below)

### 2. **Use Production WSGI Server**

Replace `socketio.run(app, ...)` with a production server.

### 3. **Security Checklist**

- [ ] Set strong `SECRET_KEY` environment variable
- [ ] Enable PIN protection (`REQUIRE_PIN=1`)
- [ ] Use HTTPS with valid SSL certificates
- [ ] Configure CORS for specific origins only
- [ ] Enable rate limiting
- [ ] Run as non-root user
- [ ] Set firewall rules

### 4. **File Storage**

- Configure `FILE_TTL_SECONDS` for automatic cleanup
- Set `CLEANUP_INTERVAL_SECONDS` for cleanup frequency
- Monitor disk space
- Consider external storage (NFS, S3-compatible)

---

## 🐳 Docker Deployment

### Dockerfile

See `Dockerfile` in project root:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application
COPY backend/ ./backend/
COPY frontend/react/dist/ ./frontend/react/dist/

# Create uploads directory
RUN mkdir -p backend/uploads

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "-k", "eventlet", "-w", "1", "--bind", "0.0.0.0:5000", "backend.app:app"]
```

### Docker Compose

See `docker-compose.yml`:

```yaml
version: "3.8"

services:
  wifux:
    build: .
    container_name: wifux-app
    ports:
      - "5000:5000"
    environment:
      - SECRET_KEY=${SECRET_KEY:-change-this-secret-key}
      - REQUIRE_PIN=${REQUIRE_PIN:-0}
      - GLOBAL_PIN=${GLOBAL_PIN:-}
      - FILE_TTL_SECONDS=${FILE_TTL_SECONDS:-0}
      - CLEANUP_INTERVAL_SECONDS=${CLEANUP_INTERVAL_SECONDS:-60}
      - ENABLE_ZEROCONF=${ENABLE_ZEROCONF:-1}
      - CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:5173}
    volumes:
      - ./uploads:/app/backend/uploads
    restart: unless-stopped
    networks:
      - wifux-net
    # For Zeroconf to work in Docker, use host network mode
    # network_mode: "host"  # Uncomment for Zeroconf auto-discovery

networks:
  wifux-net:
    driver: bridge
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Zeroconf in Docker

**Important:** For Zeroconf to work in Docker, use **host network mode**:

```yaml
services:
  wifux:
    network_mode: "host"
    # Remove ports section when using host mode
```

Or run with:

```bash
docker run --network host wifux-app
```

---

## 🐧 Linux systemd Service

### Create Service File

Create `/etc/systemd/system/wifux.service`:

```ini
[Unit]
Description=WifiX File Sharing Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/wifux
Environment="PATH=/opt/wifux/venv/bin"
Environment="SECRET_KEY=your-secret-key-here"
Environment="ENABLE_ZEROCONF=1"
Environment="REQUIRE_PIN=0"
ExecStart=/opt/wifux/venv/bin/gunicorn -k eventlet -w 1 --bind 0.0.0.0:5000 backend.app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Installation Steps

```bash
# 1. Create application directory
sudo mkdir -p /opt/wifux
sudo chown www-data:www-data /opt/wifux

# 2. Copy application files
sudo -u www-data cp -r /path/to/WifiX/* /opt/wifux/

# 3. Create virtual environment
cd /opt/wifux
sudo -u www-data python3 -m venv venv
sudo -u www-data venv/bin/pip install -r backend/requirements.txt gunicorn

# 4. Build frontend (if deploying from source)
cd frontend/react
npm install
npm run build
# Output is in frontend/react/dist/

# 5. Install and enable service
sudo cp wifux.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wifux
sudo systemctl start wifux

# 6. Check status
sudo systemctl status wifux
sudo journalctl -u wifux -f  # Follow logs
```

### Service Management

```bash
# Start service
sudo systemctl start wifux

# Stop service
sudo systemctl stop wifux

# Restart service
sudo systemctl restart wifux

# View logs
sudo journalctl -u wifux -n 100 -f

# Enable auto-start on boot
sudo systemctl enable wifux

# Disable auto-start
sudo systemctl disable wifux
```

---

## 🪟 Windows Service

### Option 1: NSSM (Non-Sucking Service Manager)

```powershell
# Download NSSM from https://nssm.cc/download

# Install WifiX as Windows service
nssm install WifiX "C:\Python311\python.exe" "C:\WifiX\backend\app.py"

# Configure service
nssm set WifiX AppDirectory "C:\WifiX"
nssm set WifiX AppEnvironmentExtra "SECRET_KEY=your-secret-key" "ENABLE_ZEROCONF=1"
nssm set WifiX DisplayName "WifiX File Sharing"
nssm set WifiX Description "Local network file sharing service"
nssm set WifiX Start SERVICE_AUTO_START

# Start service
nssm start WifiX

# View status
nssm status WifiX

# Stop service
nssm stop WifiX

# Remove service
nssm remove WifiX confirm
```

### Option 2: Task Scheduler

```powershell
# Create a scheduled task that runs at startup
$action = New-ScheduledTaskAction -Execute "C:\Python311\python.exe" -Argument "C:\WifiX\backend\app.py" -WorkingDirectory "C:\WifiX"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "WifiX" -Action $action -Trigger $trigger -Principal $principal -Description "WifiX File Sharing Service"

# Start task
Start-ScheduledTask -TaskName "WifiX"

# Stop task
Stop-ScheduledTask -TaskName "WifiX"

# Remove task
Unregister-ScheduledTask -TaskName "WifiX" -Confirm:$false
```

---

## 🔒 Reverse Proxy Setup

### Nginx Configuration

Create `/etc/nginx/sites-available/wifux`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name wifux.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name wifux.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/wifux.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wifux.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Max upload size (adjust as needed)
    client_max_body_size 1024M;

    # Timeouts for large file uploads
    client_body_timeout 300s;
    client_header_timeout 300s;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_read_timeout 86400;
        proxy_buffering off;
    }

    # Socket.IO endpoint
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

**Enable and test:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wifux /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName wifux.yourdomain.com
    Redirect permanent / https://wifux.yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName wifux.yourdomain.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/wifux.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/wifux.yourdomain.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:5000/
    ProxyPassReverse / http://127.0.0.1:5000/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://127.0.0.1:5000/$1 [P,L]

    # Request headers
    RequestHeader set X-Forwarded-Proto "https"
</VirtualHost>
```

---

## 🔐 HTTPS Configuration

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (Nginx)
sudo certbot --nginx -d wifux.yourdomain.com

# Obtain certificate (standalone)
sudo certbot certonly --standalone -d wifux.yourdomain.com

# Auto-renewal (already set up by Certbot)
sudo certbot renew --dry-run
```

### Self-Signed Certificate (Development/LAN Only)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=wifux.local"

# Use in app.py (not recommended for production)
# socketio.run(app, host='0.0.0.0', port=5000,
#              ssl_context=('cert.pem', 'key.pem'))
```

**Note:** Self-signed certificates will show browser warnings. Use only for testing.

---

## 🔧 Environment Variables

Create `.env` file in project root:

```bash
# Security
SECRET_KEY=your-very-long-random-secret-key-change-this
REQUIRE_PIN=0                    # 1 = enable PIN authentication
GLOBAL_PIN=                      # Global PIN for all files (if REQUIRE_PIN=1)

# File Management
FILE_TTL_SECONDS=0               # 0 = keep forever, >0 = auto-delete after N seconds
CLEANUP_INTERVAL_SECONDS=60      # How often to check for expired files

# Network Discovery
ENABLE_ZEROCONF=1                # 1 = enable mDNS/Zeroconf, 0 = disable

# CORS (for production, set to your domain)
CORS_ORIGINS=https://wifux.yourdomain.com

# Rate Limiting
RATELIMIT_STORAGE_URL=redis://localhost:6379  # Optional: Redis for rate limiting
```

### Loading Environment Variables

**Using python-dotenv (recommended):**

```python
# backend/app.py already includes:
from dotenv import load_dotenv
load_dotenv()
```

**Manual export (Linux/Mac):**

```bash
export SECRET_KEY="your-secret-key"
export REQUIRE_PIN=1
export GLOBAL_PIN="1234"
```

**PowerShell (Windows):**

```powershell
$env:SECRET_KEY="your-secret-key"
$env:REQUIRE_PIN="1"
$env:GLOBAL_PIN="1234"
```

---

## 📊 Monitoring & Logs

### Application Logs

**Systemd (Linux):**

```bash
# View real-time logs
sudo journalctl -u wifux -f

# View last 100 lines
sudo journalctl -u wifux -n 100

# View logs since today
sudo journalctl -u wifux --since today
```

**Docker:**

```bash
# View real-time logs
docker-compose logs -f wifux

# View last 100 lines
docker-compose logs --tail=100 wifux
```

**Windows NSSM:**

```powershell
# Logs are in the configured output file
Get-Content C:\WifiX\logs\output.log -Wait
```

### Log Rotation

**Create `/etc/logrotate.d/wifux`:**

```
/var/log/wifux/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload wifux > /dev/null 2>&1 || true
    endscript
}
```

### Health Checks

**Create monitoring script:**

```bash
#!/bin/bash
# /opt/wifux/healthcheck.sh

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/info)

if [ "$RESPONSE" -eq 200 ]; then
    echo "WifiX is healthy"
    exit 0
else
    echo "WifiX is down (HTTP $RESPONSE)"
    exit 1
fi
```

**Add to crontab:**

```bash
*/5 * * * * /opt/wifux/healthcheck.sh || systemctl restart wifux
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Port Already in Use**

```bash
# Find process using port 5000
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

**2. Zeroconf Not Working**

```bash
# Linux: Install avahi
sudo apt install avahi-daemon avahi-utils

# Windows: Install Bonjour
# Download from Apple

# Check if service is registered
avahi-browse -r _wifi-share._tcp  # Linux
dns-sd -B _wifi-share._tcp local.  # Mac/Windows
```

**3. WebSocket Connection Failed**

- Check CORS configuration
- Verify reverse proxy WebSocket support
- Check firewall rules for port 5000

**4. Large File Upload Fails**

- Increase `MAX_CONTENT_LENGTH` in app.py
- Adjust nginx `client_max_body_size`
- Check disk space

**5. Permission Denied on Uploads Directory**

```bash
# Fix permissions
sudo chown -R www-data:www-data /opt/wifux/backend/uploads
sudo chmod -R 755 /opt/wifux/backend/uploads
```

---

## 📚 Additional Resources

- **Documentation**: https://mehmoodulhaq570.github.io/WifiX/
- **GitHub**: https://github.com/mehmoodulhaq570/WifiX
- **Issues**: Report bugs and request features on GitHub
- **Flask Deployment**: https://flask.palletsprojects.com/en/latest/deploying/
- **Gunicorn**: https://docs.gunicorn.org/
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

## 🎯 Quick Deployment Commands

### Development

```bash
python backend/app.py
```

### Production (Gunicorn)

```bash
gunicorn -k eventlet -w 1 --bind 0.0.0.0:5000 backend.app:app
```

### Docker

```bash
docker-compose up -d
```

### Systemd

```bash
sudo systemctl start wifux
```

---

**Need help?** Open an issue on [GitHub](https://github.com/mehmoodulhaq570/WifiX/issues) or check the [documentation](https://mehmoodulhaq570.github.io/WifiX/).

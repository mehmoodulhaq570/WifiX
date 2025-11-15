# 🐳 Docker Deployment Guide - Step by Step

This guide will walk you through deploying WifiX using Docker.

---

## ✅ Pre-Deployment Checklist

Your code is **READY** for Docker deployment! Here's what you have:

- ✅ Dockerfile with multi-stage build
- ✅ docker-compose.yml configured
- ✅ .dockerignore for optimized builds
- ✅ Frontend build scripts in package.json
- ✅ Backend requirements.txt
- ✅ Zeroconf support configured

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Docker installed** (version 20.10 or higher)

   - Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - Mac: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - Linux: `sudo apt install docker.io docker-compose`

2. **Docker Compose installed** (usually comes with Docker Desktop)

   - Check: `docker-compose --version`

3. **Git** (to clone/update the repository)

---

## 🚀 Deployment Steps

### Step 1: Verify Docker Installation

```powershell
# Check Docker is installed and running
docker --version
docker-compose --version

# Test Docker (should show "Hello from Docker!")
docker run hello-world
```

Expected output:

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

### Step 2: Navigate to Project Directory

```powershell
cd D:\Projects\WifiX
```

---

### Step 3: Create Environment Configuration (Optional but Recommended)

Create a `.env` file for production settings:

```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit with Notepad
notepad .env
```

**Recommended production settings:**

```env
# Security (IMPORTANT: Change these!)
SECRET_KEY=Zx9mK2nP4qR8sT3vW7yB1cD6fG0hJ5lN
REQUIRE_PIN=1
GLOBAL_PIN=1234

# File Management
FILE_TTL_SECONDS=86400
CLEANUP_INTERVAL_SECONDS=60

# Network Discovery
ENABLE_ZEROCONF=1

# CORS (update with your domain/IP)
CORS_ORIGINS=http://localhost:5000,http://10.5.48.95:5000
```

**Generate a secure SECRET_KEY:**

```powershell
python -c "import os; print(os.urandom(24).hex())"
```

---

### Step 4: Build the Docker Image

This creates your Docker container image:

```powershell
# Build the image (takes 3-5 minutes first time)
docker-compose build

# Or build without cache (if you made changes)
docker-compose build --no-cache
```

**What happens during build:**

- Stage 1: Builds React frontend (npm install, vite build)
- Stage 2: Sets up Python backend with Flask + Gunicorn
- Installs Zeroconf dependencies
- Creates optimized production image

**Expected output:**

```
[+] Building 120.5s (22/22) FINISHED
=> [frontend-builder 1/6] FROM docker.io/library/node:18-alpine
=> [stage-1 1/9] FROM docker.io/library/python:3.11-slim
...
=> => naming to docker.io/library/wifux-wifux
```

---

### Step 5: Start the Application

```powershell
# Start in detached mode (runs in background)
docker-compose up -d

# Or start with logs visible (for debugging)
docker-compose up
```

**Expected output:**

```
[+] Running 2/2
 ✔ Network wifux_wifux-net  Created
 ✔ Container wifux-app      Started
```

---

### Step 6: Verify Deployment

**Check container status:**

```powershell
docker-compose ps
```

Expected:

```
NAME        IMAGE         STATUS         PORTS
wifux-app   wifux-wifux   Up 10 seconds  0.0.0.0:5000->5000/tcp
```

**View logs:**

```powershell
# View real-time logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

**Check application health:**

```powershell
# Test the /info endpoint
curl http://localhost:5000/info

# Or open in browser
start http://localhost:5000
```

---

### Step 7: Access Your Application

🎉 **Your WifiX is now running!**

**From your machine:**

- Open browser: `http://localhost:5000`

**From other devices on your network:**

- Find your IP: `ipconfig` (look for IPv4 Address)
- Access: `http://YOUR_IP:5000` (e.g., `http://10.5.48.95:5000`)

**Mobile devices:**

- Open the web interface
- Scan the QR code displayed

**With Zeroconf auto-discovery:**

- Devices can find your server automatically as `WifiX on YOUR_IP._wifi-share._tcp.local.`

---

## 📱 Managing Your Docker Deployment

### View Logs

```powershell
# Real-time logs (Ctrl+C to exit)
docker-compose logs -f

# View only backend logs
docker-compose logs -f wifux

# Last 50 lines
docker-compose logs --tail=50
```

### Stop the Application

```powershell
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data in volumes)
docker-compose down

# Stop, remove, and delete volumes (DELETES uploaded files!)
docker-compose down -v
```

### Restart the Application

```powershell
# Restart after making changes
docker-compose restart

# Or stop and start
docker-compose down
docker-compose up -d
```

### Update After Code Changes

```powershell
# 1. Pull latest code (if using git)
git pull

# 2. Rebuild the image
docker-compose build

# 3. Restart with new image
docker-compose down
docker-compose up -d

# Or do it all at once
docker-compose up -d --build
```

---

## 🔍 Troubleshooting

### Issue 1: Port 5000 Already in Use

**Error:**

```
Error starting userland proxy: listen tcp 0.0.0.0:5000: bind: address already in use
```

**Solution:**

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change the port in docker-compose.yml
ports:
  - "5001:5000"  # Access on http://localhost:5001
```

---

### Issue 2: Build Fails

**Error during frontend build:**

```
npm ERR! code ELIFECYCLE
```

**Solution:**

```powershell
# Build without cache
docker-compose build --no-cache

# Or build frontend locally first to test
cd frontend\react
npm install
npm run build
```

---

### Issue 3: Container Exits Immediately

**Check logs:**

```powershell
docker-compose logs wifux
```

**Common causes:**

- Missing environment variables
- Python dependency issues
- Port conflicts

**Solution:**

```powershell
# Run in foreground to see errors
docker-compose up

# Check container status
docker ps -a
```

---

### Issue 4: Can't Access from Other Devices

**Firewall blocking port 5000:**

```powershell
# Allow port 5000 in Windows Firewall
New-NetFirewallRule -DisplayName "WifiX Docker" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

**Check your IP address:**

```powershell
ipconfig
# Look for IPv4 Address under your active network adapter
```

---

### Issue 5: Zeroconf Not Working in Docker

**For full Zeroconf support, use host network mode:**

Edit `docker-compose.yml`:

```yaml
services:
  wifux:
    network_mode: "host" # Uncomment this line
    # Comment out the ports section when using host mode
    # ports:
    #   - "5000:5000"
```

Then restart:

```powershell
docker-compose down
docker-compose up -d
```

---

## 🔒 Production Deployment

### Enable Security Features

Edit `.env` file:

```env
SECRET_KEY=your-long-secure-random-key-here
REQUIRE_PIN=1
GLOBAL_PIN=your-secure-pin
FILE_TTL_SECONDS=86400  # Auto-delete after 24 hours
```

### Set Up HTTPS with Nginx

1. **Create `nginx.conf`:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://wifux:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. **Update `docker-compose.yml`:** (uncomment nginx section)

3. **Deploy:**

```powershell
docker-compose up -d
```

---

## 📊 Monitoring

### View Container Stats

```powershell
# Real-time resource usage
docker stats wifux-app

# Container details
docker inspect wifux-app
```

### Health Checks

The Dockerfile includes automatic health checks:

```powershell
# Check health status
docker inspect --format='{{.State.Health.Status}}' wifux-app
```

Statuses:

- `starting` - Container just started
- `healthy` - Application responding
- `unhealthy` - Health check failing

---

## 💾 Data Persistence

### Uploaded Files

Files are stored in the `uploads` volume:

```powershell
# Location on host (Windows)
./uploads
```

**Backup uploads:**

```powershell
# Create backup
Compress-Archive -Path .\uploads\* -DestinationPath wifux-backup-$(Get-Date -Format 'yyyyMMdd').zip

# Restore backup
Expand-Archive -Path wifux-backup-20251115.zip -DestinationPath .\uploads\
```

---

## 🚀 Advanced: Multi-Host Deployment

### Deploy on a Remote Server

1. **Save your image:**

```powershell
docker save wifux-wifux:latest | gzip > wifux.tar.gz
```

2. **Transfer to server:**

```powershell
scp wifux.tar.gz user@server:/tmp/
```

3. **Load on server:**

```bash
docker load < /tmp/wifux.tar.gz
docker-compose up -d
```

### Use Docker Registry

1. **Tag image:**

```powershell
docker tag wifux-wifux:latest your-registry/wifux:latest
```

2. **Push to registry:**

```powershell
docker push your-registry/wifux:latest
```

3. **Pull and deploy on any server:**

```bash
docker pull your-registry/wifux:latest
docker-compose up -d
```

---

## 🎯 Quick Reference Commands

```powershell
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Check status
docker-compose ps

# Execute command in container
docker-compose exec wifux bash

# Remove everything (including volumes)
docker-compose down -v

# View resource usage
docker stats wifux-app
```

---

## ✅ Deployment Verification Checklist

After deployment, verify:

- [ ] Container is running: `docker-compose ps`
- [ ] Logs show no errors: `docker-compose logs`
- [ ] Web interface accessible: `http://localhost:5000`
- [ ] Can upload files successfully
- [ ] Files persist after restart
- [ ] Accessible from other devices: `http://YOUR_IP:5000`
- [ ] Zeroconf broadcasting (check logs for "Zeroconf: registered service")
- [ ] Health check passing: `docker inspect wifux-app | Select-String Health`

---

## 🎉 Success!

Your WifiX is now running in Docker!

**Next steps:**

- Set up HTTPS for production (see DEPLOYMENT.md)
- Configure automatic backups
- Set up monitoring/alerts
- Add nginx reverse proxy

**Need help?**

- Check logs: `docker-compose logs -f`
- Full documentation: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Issues: https://github.com/mehmoodulhaq570/WifiX/issues

---

**Happy file sharing! 🚀**

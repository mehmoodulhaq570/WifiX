# Troubleshooting Guide

Common issues and solutions for WifiX

## Table of Contents

- [Connection Issues](#connection-issues)
- [Upload/Download Problems](#uploaddownload-problems)
- [WebSocket Errors](#websocket-errors)
- [Authentication Issues](#authentication-issues)
- [Performance Problems](#performance-problems)
- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Network Configuration](#network-configuration)
- [Platform-Specific Issues](#platform-specific-issues)

---

## Connection Issues

### Cannot Connect to Server

**Symptom:** Browser shows "Cannot connect" or "ERR_CONNECTION_REFUSED"

**Solutions:**

1. **Verify server is running:**

   ```bash
   # Check if process is running
   # Windows:
   Get-Process -Name python

   # Linux/Mac:
   ps aux | grep python
   ```

2. **Check IP address and port:**

   ```bash
   # Server displays correct IP on startup:
   python backend/app.py
   # Look for: "Running on http://192.168.1.100:5000"
   ```

3. **Firewall blocking:**

   ```bash
   # Windows - Allow port 5000:
   netsh advfirewall firewall add rule name="WifiX" dir=in action=allow protocol=TCP localport=5000

   # Linux - Allow port 5000:
   sudo ufw allow 5000

   # macOS - Check System Preferences > Security & Privacy > Firewall
   ```

4. **Wrong network:**

   - Ensure client and server are on same WiFi/LAN
   - Check IP range matches (e.g., both 192.168.1.x)

5. **Port already in use:**

   ```bash
   # Windows:
   netstat -ano | findstr :5000

   # Linux/Mac:
   lsof -i :5000

   # Change port in app.py:
   socketio.run(app, host='0.0.0.0', port=5001)
   ```

### Connection Drops Randomly

**Symptom:** Connected clients lose connection intermittently

**Solutions:**

1. **WiFi signal issues:**

   - Move closer to router
   - Use 5GHz band for less interference
   - Check for WiFi channel congestion

2. **Router timeout:**

   - Increase router timeout settings
   - Enable keep-alive in Socket.IO config

3. **Server resource exhaustion:**

   ```bash
   # Check server resources
   # Windows:
   Get-Process -Name python | Select CPU, WorkingSet

   # Linux:
   top -p $(pgrep python)
   ```

### QR Code Won't Scan

**Symptom:** Mobile device can't read QR code

**Solutions:**

1. **Display quality:**

   - Increase browser zoom
   - Ensure good screen brightness
   - Avoid screen glare

2. **QR code regeneration:**

   - Refresh the page
   - Check server IP hasn't changed

3. **Camera permissions:**
   - Grant camera access to QR scanner app
   - Try different QR scanner app

---

## Upload/Download Problems

### File Upload Fails

**Symptom:** Upload progress bar stops or error message appears

**Solutions:**

1. **File size limit:**

   ```python
   # Check/modify in backend/app.py:
   MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1GB default

   # Increase to 5GB:
   MAX_CONTENT_LENGTH = 5 * 1024 * 1024 * 1024
   ```

2. **Disk space:**

   ```bash
   # Windows:
   Get-PSDrive -PSProvider FileSystem

   # Linux/Mac:
   df -h
   ```

3. **Permissions:**

   ```bash
   # Check/fix upload folder permissions
   # Linux/Mac:
   chmod 755 backend/uploads

   # Windows:
   # Right-click uploads folder > Properties > Security
   ```

4. **Network timeout:**

   - For large files, increase timeout:

   ```python
   # In backend/app.py:
   socketio.run(app, host='0.0.0.0', port=5000,
                ping_timeout=120, ping_interval=60)
   ```

5. **Browser memory:**
   - Split large files into smaller chunks
   - Close unnecessary browser tabs
   - Clear browser cache

### Download Fails or Corrupts

**Symptom:** Downloaded file is incomplete or won't open

**Solutions:**

1. **Verify file integrity:**

   ```bash
   # Check file size matches
   ls -lh backend/uploads/
   ```

2. **Browser cache issue:**

   - Clear browser cache
   - Try incognito/private mode
   - Try different browser

3. **Server error during download:**

   - Check server logs for errors
   - Restart server
   - Verify file wasn't deleted

4. **Network interruption:**
   - Use stable wired connection
   - Re-download file
   - Enable resume capability (requires code modification)

### Slow Transfer Speeds

**Symptom:** Uploads/downloads are slower than expected

**Solutions:**

1. **Network bottleneck:**

   - Use WiFi 5GHz instead of 2.4GHz
   - Use wired Ethernet connection
   - Close bandwidth-heavy apps

2. **Server hardware:**

   - Check CPU usage isn't maxed
   - Ensure SSD/fast storage for uploads folder
   - Add more RAM if swapping occurs

3. **Multiple transfers:**

   - Limit concurrent uploads/downloads
   - Queue large transfers

4. **Compression (optional feature):**
   ```python
   # Add to backend/app.py:
   from flask_compress import Compress
   Compress(app)
   ```

---

## WebSocket Errors

### "WebSocket connection failed"

**Symptom:** Console shows WebSocket errors, real-time updates don't work

**Solutions:**

1. **CORS configuration:**

   ```python
   # In backend/app.py, verify:
   socketio = SocketIO(app, cors_allowed_origins='*')

   # Or specify origins:
   socketio = SocketIO(app, cors_allowed_origins=[
       'http://localhost:5173',
       'http://192.168.1.100:5000'
   ])
   ```

2. **Proxy/reverse proxy:**

   - If using nginx/Apache, configure WebSocket proxy

   ```nginx
   # nginx example:
   location /socket.io {
       proxy_pass http://localhost:5000/socket.io;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **Firewall/antivirus:**

   - Temporarily disable to test
   - Add exception for Python and port 5000

4. **Browser extensions:**
   - Disable ad blockers
   - Disable privacy extensions
   - Try incognito mode

### "Transport unknown"

**Symptom:** Socket.IO can't establish connection transport

**Solutions:**

1. **Update dependencies:**

   ```bash
   # Backend:
   pip install --upgrade python-socketio flask-socketio eventlet

   # Frontend:
   npm install socket.io-client@latest
   ```

2. **Force polling transport:**

   ```javascript
   // In frontend/react/src/App.jsx:
   const socket = io(API_URL, {
     transports: ["polling", "websocket"],
   });
   ```

3. **Check server engine:**
   ```bash
   # Server should use eventlet or gevent
   pip install eventlet
   # Then restart server
   ```

---

## Authentication Issues

### PIN Not Working

**Symptom:** Correct PIN is rejected

**Solutions:**

1. **Whitespace:**

   - Ensure no leading/trailing spaces
   - Check CAPS LOCK

2. **PIN not set:**

   ```python
   # Verify in backend/app.py:
   ACCESS_PIN = "1234"  # Or os.getenv('ACCESS_PIN')
   ```

3. **Session expired:**

   - Refresh page
   - Clear cookies
   - Re-enter PIN

4. **PIN encoding:**
   - Use only ASCII characters
   - Avoid special characters that might be encoded differently

### Can't Access After PIN Entry

**Symptom:** PIN accepted but files/features not accessible

**Solutions:**

1. **Check session:**

   ```javascript
   // In browser console:
   console.log(document.cookie);
   // Should show session cookie
   ```

2. **Secret key:**

   ```python
   # Ensure set in backend/app.py:
   app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
   ```

3. **Clear cookies:**
   - Browser settings > Clear browsing data > Cookies
   - Restart browser

---

## Performance Problems

### High CPU Usage

**Symptom:** Server uses excessive CPU

**Solutions:**

1. **File cleanup:**

   ```python
   # Disable or increase interval in backend/app.py:
   FILE_TTL_SECONDS = 0  # Disable cleanup
   # Or:
   CLEANUP_INTERVAL_SECONDS = 300  # Run every 5 minutes instead
   ```

2. **Logging level:**

   ```python
   # Reduce logging:
   logging.basicConfig(level=logging.WARNING)
   ```

3. **Production server:**
   ```bash
   # Use gunicorn instead of Flask dev server:
   pip install gunicorn eventlet
   gunicorn -k eventlet -w 1 --bind 0.0.0.0:5000 app:app
   ```

### High Memory Usage

**Symptom:** Server memory consumption grows over time

**Solutions:**

1. **Memory leak check:**

   - Restart server regularly
   - Monitor with `htop` or Task Manager

2. **File buffering:**

   ```python
   # Stream large files instead of loading to memory
   # Already implemented in app.py with send_from_directory
   ```

3. **Connection cleanup:**
   - Ensure old WebSocket connections are closed
   - Check for orphaned threads

### Frontend Lag

**Symptom:** UI is slow or unresponsive

**Solutions:**

1. **Large file list:**

   - Implement pagination (feature request)
   - Clear old files regularly

2. **React optimization:**

   ```jsx
   // Use React.memo for expensive components
   export default React.memo(FileList);
   ```

3. **Browser DevTools:**
   - Check for console errors
   - Profile with Performance tab
   - Look for memory leaks

---

## Frontend Issues

### UI Not Updating

**Symptom:** Changes don't reflect immediately

**Solutions:**

1. **WebSocket connection:**

   - Check browser console for errors
   - Verify Socket.IO is connected

   ```javascript
   socket.on("connect", () => console.log("Connected"));
   ```

2. **Hard refresh:**

   - Windows/Linux: `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

3. **Cache issue:**
   - Clear browser cache
   - Disable cache in DevTools (Network tab)

### Drag-and-Drop Not Working

**Symptom:** Dropping files doesn't upload them

**Solutions:**

1. **Browser compatibility:**

   - Use modern browser (Chrome, Firefox, Edge, Safari)
   - Update browser to latest version

2. **Permissions:**

   - Grant file access permissions
   - Check browser security settings

3. **Console errors:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Verify drag event handlers

### Styling Issues

**Symptom:** UI looks broken or unstyled

**Solutions:**

1. **Build frontend:**

   ```bash
   cd frontend/react
   npm run build
   ```

2. **Tailwind CSS:**

   ```bash
   # Rebuild CSS:
   npm run build:css  # If separate script exists
   ```

3. **Cache:**
   - Clear browser cache
   - Force refresh (Ctrl+F5)

---

## Backend Issues

### Server Won't Start

**Symptom:** Python script exits with error

**Solutions:**

1. **Dependencies:**

   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Python version:**

   ```bash
   python --version  # Should be 3.8+
   ```

3. **Port conflict:**

   ```bash
   # Change port:
   python backend/app.py  # Then edit app.py
   ```

4. **Import errors:**
   ```bash
   # Check PYTHONPATH:
   echo $PYTHONPATH  # Linux/Mac
   $env:PYTHONPATH  # Windows PowerShell
   ```

### "Module not found" Error

**Symptom:** ImportError or ModuleNotFoundError

**Solutions:**

1. **Virtual environment:**

   ```bash
   # Activate venv:
   source .venv/bin/activate  # Linux/Mac
   .venv\Scripts\activate  # Windows

   # Verify correct Python:
   which python  # Linux/Mac
   Get-Command python  # Windows PowerShell
   ```

2. **Install missing module:**

   ```bash
   pip install <module-name>
   ```

3. **Requirements file:**
   ```bash
   pip install -r backend/requirements.txt --force-reinstall
   ```

### File Not Found Errors

**Symptom:** Server can't find upload folder or files

**Solutions:**

1. **Create folders:**

   ```bash
   mkdir -p backend/uploads
   mkdir -p backend/static
   ```

2. **Check paths:**

   ```python
   # In backend/app.py:
   UPLOAD_FOLDER = Path(__file__).parent / "uploads"
   print(f"Upload folder: {UPLOAD_FOLDER.absolute()}")
   ```

3. **Permissions:**
   ```bash
   # Linux/Mac:
   chmod -R 755 backend/
   ```

---

## Network Configuration

### Can't Access from Other Devices

**Symptom:** Server works on host but not from other devices

**Solutions:**

1. **Bind to all interfaces:**

   ```python
   # In backend/app.py:
   socketio.run(app, host='0.0.0.0', port=5000)  # Not 127.0.0.1
   ```

2. **Firewall:**

   - See [Connection Issues - Firewall blocking](#cannot-connect-to-server)

3. **Network isolation:**
   - Check router AP isolation is disabled
   - Ensure not on guest network
   - VPN might block local access

### SSL/HTTPS Issues

**Symptom:** Errors with HTTPS connections

**Solutions:**

1. **Self-signed certificate:**

   ```bash
   # Generate certificate:
   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
   ```

2. **Use certificate:**

   ```python
   # In backend/app.py:
   socketio.run(app, host='0.0.0.0', port=5000,
                certfile='cert.pem', keyfile='key.pem')
   ```

3. **Browser warning:**
   - Accept self-signed certificate warning
   - Or use trusted CA certificate

---

## Platform-Specific Issues

### Windows

**Issue:** PowerShell execution policy prevents scripts

**Solution:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue:** `pip` not found

**Solution:**

```powershell
python -m pip install --upgrade pip
```

### macOS

**Issue:** SSL certificate verification fails

**Solution:**

```bash
# Install certificates:
/Applications/Python\ 3.x/Install\ Certificates.command
```

**Issue:** Permission denied on port 80/443

**Solution:**

```bash
# Use port >1024 or run with sudo (not recommended):
sudo python backend/app.py
```

### Linux

**Issue:** `eventlet` import fails

**Solution:**

```bash
pip install eventlet
# Or use gevent:
pip install gevent gevent-websocket
```

**Issue:** Can't bind to port 5000

**Solution:**

```bash
# Check if service using port:
sudo lsof -i :5000
# Kill process or use different port
```

---

## Debugging Tools

### Enable Debug Mode

**Backend:**

```python
# In backend/app.py:
app.debug = True
socketio.run(app, host='0.0.0.0', port=5000, debug=True)
```

**Frontend:**

```javascript
// In browser console:
localStorage.debug = "socket.io-client:socket";
// Reload page to see Socket.IO debug logs
```

### Check Logs

**Backend:**

```python
# Add detailed logging:
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Frontend:**

```javascript
// Browser DevTools > Console
// Check for errors and warnings
```

### Network Inspection

**Browser DevTools > Network Tab:**

- Filter by "WS" to see WebSocket connections
- Check request/response headers
- Monitor file upload progress

**Wireshark (advanced):**

- Capture packets on port 5000
- Filter: `tcp.port == 5000`

---

## Getting More Help

If your issue isn't covered here:

1. **Check existing issues:** [GitHub Issues](https://github.com/yourusername/WifiX/issues)
2. **Enable debug mode** and collect logs
3. **Create new issue** with:
   - OS and versions (Python, Node, browser)
   - Steps to reproduce
   - Error messages/logs
   - Screenshots (if UI issue)

---

## Useful Commands Reference

### Quick Diagnostics

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Check port availability
# Windows:
Test-NetConnection -ComputerName localhost -Port 5000

# Linux/Mac:
nc -zv localhost 5000

# Check network interfaces
# Windows:
ipconfig
# Linux/Mac:
ifconfig

# Test server connectivity
curl http://localhost:5000/api/files

# Check WebSocket connection
wscat -c ws://localhost:5000/socket.io/?EIO=4&transport=websocket
```

---

**Last Updated:** November 13, 2025

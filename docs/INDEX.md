# WifiX Documentation

Complete documentation for WifiX - LAN File Sharing Application

## 📚 Table of Contents

### Getting Started

- [README](../README.md) - Project overview and quick start
- [Installation Guide](#installation)
- [Usage Guide](USAGE.md) - How to use WifiX
- [FAQ](#frequently-asked-questions)

### Features & Capabilities

- [Features List](../FEATURES.md) - Complete feature documentation
- [API Documentation](API.md) - REST API and WebSocket events
- [Architecture](ARCHITECTURE.md) - System design and architecture

### Development

- [Contributing](../CONTRIBUTING.md) - How to contribute
- [Development Setup](#development-setup)
- [Code Style Guide](#code-style)
- [Testing Guide](#testing)

### Maintenance & Support

- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Changelog](../CHANGELOG.md) - Version history
- [Security Policy](../SECURITY.md) - Security guidelines

### Deployment

- [Production Deployment](#production-deployment)
- [Docker Setup](#docker-setup)
- [Configuration](#configuration)

---

## Installation

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Git** (for cloning)

### Quick Install

```bash
# Clone repository
git clone https://github.com/yourusername/WifiX.git
cd WifiX

# Backend setup
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Frontend setup
cd frontend/react
npm install
cd ../..
```

### Detailed Installation

See [README](../README.md#setup-instructions) for platform-specific instructions.

---

## Frequently Asked Questions

### General

**Q: What is WifiX?**  
A: WifiX is a local network file sharing application that allows easy file transfer between devices on the same network with features like drag-and-drop uploads, QR codes, and real-time updates.

**Q: Is WifiX free?**  
A: Yes, WifiX is open-source and free under the MIT License.

**Q: Can I use WifiX over the internet?**  
A: WifiX is designed for local networks. Internet use requires proper security measures (HTTPS, authentication, firewall rules).

### Technical

**Q: What platforms are supported?**  
A: WifiX runs on Windows, macOS, and Linux. Any modern browser can access the web interface.

**Q: What file types can I share?**  
A: All file types are supported by default. You can configure restrictions if needed.

**Q: Is there a file size limit?**  
A: Default limit is 1GB per file, configurable in `app.py`.

**Q: How many simultaneous connections?**  
A: No hard limit, but performance depends on your hardware and network.

### Security

**Q: Is WifiX secure?**  
A: For local network use, yes. Enable PIN authentication for added security. See [Security Policy](../SECURITY.md).

**Q: Can I password-protect files?**  
A: Yes, use per-file PIN protection when uploading.

**Q: Do files persist after restart?**  
A: Yes, unless auto-cleanup is configured via `FILE_TTL_SECONDS`.

### Troubleshooting

**Q: Can't connect to server**  
A: Check:

- Server is running (`python backend/app.py`)
- Correct IP address and port
- Firewall allows connections
- Same network as server

**Q: Upload fails**  
A: Check:

- File size under limit (1GB)
- Sufficient disk space
- Proper permissions on upload folder

**Q: WebSocket errors**  
A: Check:

- CORS configuration
- Firewall/antivirus settings
- Browser console for specific errors

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more solutions.

---

## Development Setup

### Backend Development

```bash
# Activate virtual environment
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Run with auto-reload
export FLASK_ENV=development
python backend/app.py
```

### Frontend Development

```bash
cd frontend/react
npm run dev  # Starts Vite dev server with hot reload
```

### Debugging

**Backend:**

- Use `logger.info()` and `logger.error()`
- Check terminal output
- Flask debugger in browser (development mode)

**Frontend:**

- Browser DevTools (F12)
- React DevTools extension
- Network tab for API calls

---

## Code Style

### Python (Backend)

Follow PEP 8:

```python
# Good
def upload_file(file_obj, pin=None):
    """Upload a file with optional PIN protection."""
    filename = secure_filename(file_obj.filename)
    return save_file(filename, file_obj)

# Bad
def uploadFile(f, p=None):
    fname = f.filename
    return saveFile(fname, f)
```

### JavaScript/React (Frontend)

Use ES6+ and functional components:

```jsx
// Good
export default function FileList({ files, onDelete }) {
  const [selected, setSelected] = useState(null);
  return <div>{/* Component JSX */}</div>;
}

// Bad
class FileList extends React.Component {
  constructor(props) {
    this.state = { selected: null };
  }
  render() {
    return <div>{/* Component JSX */}</div>;
  }
}
```

---

## Testing

### Run Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend/react
npm test
```

### Manual Testing

Use the [Testing Checklist](../CONTRIBUTING.md#testing) before submitting changes.

---

## Production Deployment

### Basic Deployment

```bash
# Build frontend
cd frontend/react
npm run build

# Copy build to backend
cp -r dist/* ../../backend/static/

# Run production server
cd ../../backend
gunicorn -k eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

### With HTTPS

```bash
# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 -nodes \
  -out cert.pem -keyout key.pem -days 365

# Run with SSL
python backend/app.py  # Modify app.py to use SSL context
```

### Environment Variables

```bash
export PORT=5000
export ACCESS_PIN="secure-pin"
export SECRET_KEY="$(openssl rand -hex 32)"
export CORS_ORIGINS="https://yourdomain.com"
export FILE_TTL_SECONDS=86400  # 24 hours
```

---

## Docker Setup

### Dockerfile Example

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY frontend/react/dist/ ./backend/static/

EXPOSE 5000

CMD ["python", "backend/app.py"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  wifix:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./uploads:/app/backend/uploads
    environment:
      - ACCESS_PIN=1234
      - SECRET_KEY=your-secret-key
```

---

## Configuration

### Backend Configuration

Edit `backend/app.py` or use environment variables:

```python
# File uploads
UPLOAD_FOLDER = Path(__file__).parent / "uploads"
MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1GB

# File cleanup
FILE_TTL_SECONDS = 0  # 0 = disabled
CLEANUP_INTERVAL_SECONDS = 60

# CORS
ALLOWED_ORIGINS = ['http://localhost:5173']

# Rate limiting
DEFAULT_LIMITS = ["200 per day", "50 per hour"]
```

### Frontend Configuration

Edit `frontend/react/.env`:

```bash
VITE_API_URL=http://localhost:5000
```

---

## Performance Optimization

### Backend

- Use production WSGI server (gunicorn, uWSGI)
- Enable file compression
- Configure proper logging levels
- Use Redis for session storage (optional)

### Frontend

- Build for production (`npm run build`)
- Enable code splitting
- Optimize images and assets
- Use CDN for static files (optional)

### Network

- Use local network for best performance
- Configure QoS for file transfers
- Minimize network hops

---

## Monitoring

### Logging

Backend logs to console by default:

```python
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Metrics

Monitor:

- Upload/download speeds
- Active connections
- File storage usage
- Error rates

---

## Backup & Recovery

### Backup Files

```bash
# Backup uploads directory
tar -czf backup-$(date +%Y%m%d).tar.gz backend/uploads/
```

### Restore Files

```bash
# Restore from backup
tar -xzf backup-20251113.tar.gz
```

---

## Support

### Getting Help

1. Check [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Search [existing issues](https://github.com/yourusername/WifiX/issues)
3. Read [FAQ](#frequently-asked-questions)
4. Open a new issue with details

### Community

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and ideas
- Pull Requests: Code contributions

---

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## License

WifiX is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

**Last Updated:** November 13, 2025

<div align="center">

# 📡 WifiX

**Easy LAN File Sharing Made Simple**

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-2.3.2-000000.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Share files seamlessly across your local network with drag-and-drop simplicity, QR code access, and real-time updates.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](https://mehmoodulhaq570.github.io/WifiX/) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### Core Functionality

- 📁 **Drag & Drop Uploads** - Intuitive file upload with progress tracking
- ⬇️ **Instant Downloads** - Quick file retrieval from any connected device
- 📱 **QR Code Access** - Scan to connect from mobile devices instantly
- 🔄 **Real-Time Sync** - WebSocket-powered live updates across all clients

### Security & Control

- 🔐 **Host/Client Approval** - Host authorizes all client connections
- 🔑 **PIN Protection** - Global and per-file PIN authentication
- 🔒 **Secure Filenames** - Automatic sanitization prevents path traversal
- 🛡️ **Rate Limiting** - Built-in protection against abuse
- 🔍 **Zeroconf Discovery** - Auto-discover WifiX servers on local network (mDNS/Bonjour)

### User Experience

- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🗑️ **Safe Deletion** - Confirmation modals prevent accidental removals
- 📈 **Upload Progress** - Real-time feedback during file transfers
- 💾 **File Persistence** - Files remain until explicitly deleted

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Installation

```powershell
# Clone repository
git clone https://github.com/yourusername/WifiX.git
cd WifiX

# Backend setup
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# Frontend setup
cd frontend\react
npm install
```

### Running the Application

**Terminal 1 - Backend:**

```powershell
python backend/app.py
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```powershell
cd frontend\react
npm run dev
# Development server on http://localhost:5173
```

### Access

- **Host Dashboard:** `http://localhost:5173`
- **Client Access:** Scan QR code or use displayed IP address
- **Mobile:** Scan QR code from any mobile device on same network

### Production Deployment

**🖥️ Desktop App (Recommended for Personal Use):**

WifiX can be packaged as a standalone desktop application using **Tauri**:

```powershell
# Quick start (after Rust installation)
.\START_TAURI.ps1

# Or manually:
cd frontend\react
npm run tauri:dev      # Development mode
npm run tauri:build    # Build .exe installer
```

📱 **Benefits:**

- ✅ Single .exe file (~5 MB)
- ✅ No hosting costs
- ✅ Python backend auto-starts
- ✅ No internet required
- ✅ Users just download and run

📖 **Desktop app guide:** [TAURI_DESKTOP_APP.md](TAURI_DESKTOP_APP.md)

---

**☁️ Cloud Deployment (For Public Access):**

For production deployment with Docker, systemd, HTTPS, and more, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

**Quick production options:**

```bash
# Docker deployment
docker-compose up -d

# Linux systemd service
sudo systemctl start wifux

# Production server (Gunicorn)
gunicorn -k eventlet -w 1 --bind 0.0.0.0:5000 backend.app:app
```

📖 **Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md) - Covers Docker, nginx, HTTPS, Zeroconf, monitoring, and more.

## 🛠️ Tech Stack

| Layer             | Technology             | Purpose                   |
| ----------------- | ---------------------- | ------------------------- |
| **Backend**       | Flask 2.3.2            | Web framework             |
|                   | Flask-SocketIO         | WebSocket support         |
|                   | Flask-Limiter          | Rate limiting             |
|                   | Zeroconf               | Network service discovery |
|                   | Werkzeug               | Security utilities        |
| **Frontend**      | React 19               | UI framework              |
|                   | Vite                   | Build tool & dev server   |
|                   | Tailwind CSS + DaisyUI | Styling                   |
|                   | Socket.IO Client       | Real-time communication   |
| **Communication** | WebSocket              | Live updates              |
|                   | REST API               | File operations           |

## Project Structure

```
WifiX/
├── backend/
│   ├── app.py                      # Flask backend server
│   └── requirements.txt            # Python dependencies for backend
├── backend/uploads/                # File storage directory
├── frontend/
│   └── react/
│       ├── src/
│       │   ├── components/         # React components
│       │   │   ├── Header.jsx
│       │   │   ├── ServerControl.jsx
│       │   │   ├── FileUploadZone.jsx
│       │   │   ├── FileList.jsx
│       │   │   ├── DeleteModal.jsx
│       │   │   ├── ConnectionApprovalModal.jsx
│       │   │   ├── ConnectionStatus.jsx
│       │   │   ├── UploadErrorModal.jsx
│       │   │   ├── DarkModeToggle.jsx
│       │   │   └── Footer.jsx
│       │   ├── hooks/              # Custom React hooks
│       │   │   ├── useSocket.js
│       │   │   ├── useFileUpload.js
│       │   │   └── useAuth.js
│       │   ├── utils/              # Utility functions
│       │   │   ├── api.js
│       │   │   └── constants.js
│       │   ├── App.jsx             # Main React component
│       │   └── main.jsx            # React entry point
│       ├── .env                    # Environment variables
│       ├── package.json            # Node dependencies
│       └── vite.config.js          # Vite configuration
└── README.md
```

## Setup Instructions

### Backend Setup

1. **Create and activate Python virtual environment**:

   ```powershell
   cd D:\Projects\WifiX
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install Python dependencies**:

   ```powershell
   pip install -r backend/requirements.txt
   ```

3. **Configure environment variables** (optional):

   ```powershell
   # Create a .env file or set environment variables
   $env:ACCESS_PIN = "1234"              # Enable PIN authentication
   $env:CORS_ORIGINS = "http://localhost:5173,http://localhost:5174"
   $env:FILE_TTL_SECONDS = "0"           # 0 = files persist until deleted
   $env:SECRET_KEY = "your-secret-key"   # Session encryption key
   ```

4. **Run the Flask backend**:
   ```powershell
   python backend/app.py
   ```
   Backend will start on `http://localhost:5000`

Note: uploaded files are now stored in `backend/uploads/`. During the migration the original top-level `uploads/` directory was copied and the original was renamed to `uploads_backup_20251111154617/` in the repo root as a safety backup — delete it only after you verify everything is present.

### Frontend Setup

1. **Navigate to frontend directory**:

   ```powershell
   cd frontend\react
   ```

2. **Install Node dependencies**:

   ```powershell
   npm install
   ```

3. **Configure environment variables**:
   Create or edit `.env` file:

   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Run the Vite dev server**:
   ```powershell
   npm run dev
   ```
   Frontend will start on `http://localhost:5173` (or 5174 if 5173 is in use).

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Features Guide](docs/FEATURES.md)** - Detailed feature documentation
- **[Usage Guide](docs/USAGE.md)** - How to use WifiX
- **[API Documentation](docs/API.md)** - REST & WebSocket API reference
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history
- **[Security Policy](SECURITY.md)** - Security guidelines

## 📋 Project Structure

```
WifiX/
├── backend/
│   ├── app.py                   # Flask application
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # File storage (gitignored)
├── frontend/
│   └── react/
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── hooks/           # Custom hooks
│       │   ├── utils/           # Utility functions
│       │   ├── App.jsx          # Main app component
│       │   └── main.jsx         # Entry point
│       ├── package.json         # Node dependencies
│       └── vite.config.js       # Vite configuration
├── docs/                        # Documentation
│   ├── INDEX.md                 # Documentation index
│   ├── ARCHITECTURE.md          # System architecture
│   ├── TROUBLESHOOTING.md       # Problem solving
│   └── USAGE.md                 # Usage guide
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── SECURITY.md                  # Security policies
├── API.md                       # API documentation
├── LICENSE                      # MIT License
└── README.md                    # This file
```

## ⚙️ Configuration

### Environment Variables

**Backend (`backend/.env` or system):**

```bash
ACCESS_PIN=1234                    # Optional: Enable PIN authentication
SECRET_KEY=your-secret-key-here    # Session encryption (auto-generated if not set)
CORS_ORIGINS=http://localhost:5173 # Allowed origins (comma-separated)
FILE_TTL_SECONDS=0                 # File auto-cleanup (0=disabled)
CLEANUP_INTERVAL_SECONDS=60        # Cleanup check interval
```

**Frontend (`frontend/react/.env`):**

```bash
VITE_API_URL=http://localhost:5000  # Backend API URL
```

### File Upload Limits

Modify in `backend/app.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB default
```

## 🔒 Security

WifiX includes multiple security layers:

- **Host Approval** - All client connections require host authorization
- **PIN Authentication** - Optional global and per-file PIN protection
- **Rate Limiting** - Prevents abuse (10 uploads/min, 20 deletes/min)
- **Secure Filenames** - Automatic sanitization prevents path traversal
- **Session Management** - Secure, HTTP-only cookies
- **CORS Protection** - Configurable origin restrictions

For security issues, see [SECURITY.md](SECURITY.md).

## 📊 API Reference

### REST Endpoints

| Method   | Endpoint                   | Description    | Rate Limit |
| -------- | -------------------------- | -------------- | ---------- |
| `GET`    | `/api/files`               | List all files | -          |
| `POST`   | `/api/upload`              | Upload file    | 10/min     |
| `DELETE` | `/api/delete/<filename>`   | Delete file    | 20/min     |
| `GET`    | `/api/download/<filename>` | Download file  | -          |
| `GET`    | `/api/info`                | Server info    | -          |

### WebSocket Events

**Client → Server:**

- `become_host` - Register as host
- `stop_host` - Stop hosting
- `request_connect` - Request connection
- `approve_request` - Approve client (host only)
- `deny_request` - Deny client (host only)

**Server → Client:**

- `file_uploaded` - New file available
- `file_deleted` - File removed
- `incoming_request` - Connection request (host)
- `request_approved` - Connection approved
- `request_denied` - Connection denied

See [API.md](API.md) for complete documentation.

## 🛠️ Development

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Setup Development Environment

```powershell
# Clone repository
git clone https://github.com/yourusername/WifiX.git
cd WifiX

# Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# Frontend
cd frontend\react
npm install
```

### Running Development Servers

**Terminal 1 - Backend (with auto-reload):**

```powershell
$env:FLASK_ENV="development"
python backend/app.py
```

**Terminal 2 - Frontend (with HMR):**

```powershell
cd frontend\react
npm run dev
```

### Building for Production

```powershell
cd frontend\react
npm run build
# Build output in dist/ folder
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
npm run build
npm run preview # Preview production build

````

### Lint Frontend Code

```powershell
cd frontend\react
npm run lint
````

## Improvements Implemented

- ✅ Environment-based CORS configuration
- ✅ Comprehensive logging system
- ✅ Enhanced error handling with user feedback
- ✅ Rate limiting on critical endpoints
- ✅ File size validation (100MB limit)
- ✅ Modular component architecture
- ✅ Custom React hooks for reusability
- ✅ Constants file for configuration
- ✅ Improved error messages
- ✅ Delete confirmation modal
- ✅ Upload progress tracking
- ✅ File persistence (no auto-cleanup by default)

## Future Enhancements

- [ ] TypeScript migration for better type safety
- [ ] Unit tests (pytest for backend, vitest for frontend)
- [ ] Docker support for easy deployment
- [ ] HTTPS support for production
- [ ] Toast notifications (react-hot-toast)
- [ ] Virtual scrolling for large file lists
- [ ] File search and filtering
- [ ] Multi-file upload
- [ ] Folder support
- [ ] Download all as ZIP

## 🐛 Troubleshooting

For detailed troubleshooting, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

### Common Issues

**Port Already in Use:**

- Vite auto-selects next available port (5174, 5175...)
- Update `CORS_ORIGINS` in backend if needed

**Socket.IO Connection Errors:**

- Ensure `CORS_ORIGINS` includes frontend dev server URL
- Check firewall/antivirus settings
- Verify backend is running

**Upload Failures:**

- Check file size limit (1GB default)
- Verify rate limits (10 uploads/min)
- Check backend logs for errors

**Files Not Showing:**

- Verify PIN authentication (if enabled)
- Check host approval (if client)
- Refresh browser or reconnect

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code of Conduct
- Development setup
- Coding standards
- Pull request process
- Issue guidelines

Quick contribution steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

### Version 1.0.0 (Current)

- ✅ Core file sharing functionality
- ✅ Host/Client approval system
- ✅ PIN authentication
- ✅ QR code generation
- ✅ Real-time updates via WebSocket
- ✅ Dark mode support
- ✅ Rate limiting

### Version 1.1.0 (Planned)

- [x] Docker support (see [DEPLOYMENT.md](DEPLOYMENT.md))
- [x] Zeroconf/mDNS auto-discovery
- [ ] Database integration (SQLite/PostgreSQL)
- [ ] File search and filtering
- [ ] Batch file operations
- [ ] Enhanced mobile UI

### Future Versions

- [ ] TypeScript migration
- [ ] Unit and integration tests
- [ ] Folder upload/download
- [ ] ZIP archive creation
- [ ] HTTPS/SSL by default
- [ ] Multi-language support
- [ ] Room codes for easy connections

See [CHANGELOG.md](CHANGELOG.md) for version history and [GitHub Issues](https://github.com/mehmoodulhaq570/WifiX/issues) for tracking.

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Flask](https://flask.palletsprojects.com/) - Web framework
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [DaisyUI](https://daisyui.com/) - Component library
- [Socket.IO](https://socket.io/) - Real-time communication
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support & Community

- 📚 **Documentation:** Browse [GitHub Pages](https://mehmoodulhaq570.github.io/WifiX/)
- 🐛 **Issues:** Report bugs on [GitHub Issues](https://github.com/mehmoodulhaq570/WifiX/issues)
- 💬 **Discussions:** Join [GitHub Discussions](https://github.com/mehmoodulhaq570/WifiX/discussions)
- 🔒 **Security:** Report vulnerabilities via [SECURITY.md](SECURITY.md)

---

<div align="center">

**Made with ❤️ for easy local file sharing**

If you find WifiX useful, please ⭐ star this repository!

[Report Bug](https://github.com/mehmoodulhaq570/WifiX/issues) · [Request Feature](https://github.com/mehmoodulhaq570/WifiX/issues) · [Documentation](https://mehmoodulhaq570.github.io/WifiX/)

</div>

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Note**: This application is designed for trusted local networks. For production use on untrusted networks, implement additional security measures (HTTPS, stronger authentication, network isolation, etc.).

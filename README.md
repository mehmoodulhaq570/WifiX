# WifiX — LAN File Sharing Application

WifiX is a local area network (LAN) file sharing application built with Flask backend and React frontend. It enables easy file sharing between devices on the same network with features like QR code generation, PIN authentication, host/client approval flow, and real-time updates.

## Features

- 🔐 **Host/Client Approval Flow**: Host must approve client connections before file access
- 📁 **File Upload & Download**: Drag-and-drop file uploads with progress tracking
- 📱 **QR Code Generation**: Generate QR codes for easy mobile access
- 🔑 **PIN Authentication**: Optional PIN protection for file access
- 🔄 **Real-time Updates**: WebSocket-based live file list updates
- 🌙 **Dark Mode**: Toggle between light and dark themes
- ⚡ **Rate Limiting**: Built-in protection against abuse
- 📊 **File Persistence**: Files persist until explicitly deleted by user
- 🗑️ **Delete Confirmation**: Modal confirmation before file deletion
- 📈 **Upload Progress**: Real-time upload progress indication

## Tech Stack

### Backend

- **Flask** - Web framework
- **Flask-SocketIO** - WebSocket support for real-time communication
- **Flask-Limiter** - Rate limiting middleware
- **qrcode** - QR code generation
- **Werkzeug** - Secure filename handling

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind component library
- **react-qr-code** - QR code rendering

## Project Structure

```
WifiX/
├── backend/
│   ├── app.py                      # Flask backend server
│   └── requirements.txt            # Python dependencies for backend
├── uploads/                        # File storage directory
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
   Frontend will start on `http://localhost:5173` (or 5174 if 5173 is in use)

## Usage

### Quick Start

1. **Start the Flask backend**:

   ```powershell
   python backend/app.py
   ```

   You'll see a banner with the shareable link:

   ```
   ============================================================
   🚀 WifiX Server Started Successfully!
   ============================================================

   📡 Server is running on:
      Local:   http://127.0.0.1:5000
      Network: http://192.168.1.5:5000

   🔗 Share this link with others:
      👉 http://192.168.1.5:5000

   💡 Instructions:
      1. Open the link above in your browser to become the HOST
      2. Share the link with others to let them connect as CLIENTS
      3. As HOST, you'll approve/deny incoming connections
   ============================================================
   ```

2. **Start the Vite dev server** (for development):

   ```powershell
   cd frontend\react
   npm run dev
   ```

3. **Open the Network URL** in your browser (e.g., `http://192.168.1.5:5000`)

### Host Workflow

1. **Open the shareable link** in your browser
2. **Click "🏠 Become Host"** to enable hosting
3. **Upload Files**: Drag and drop files or use the upload button
4. **Approve Clients**: Accept incoming connection requests from clients
5. **Share Link**: Use the "📋 Copy" button or "Show QR Code" for easy sharing
6. **Manage Files**: Delete files when no longer needed
7. **Stop Hosting**: Click "🛑 Stop Hosting" to end the session

### Client Workflow

1. **Get the link** from the host (e.g., `http://192.168.1.5:5000`)
2. **Open it in your browser**
3. **Click "👥 Connect as Client"** to request access
4. **Wait for host approval** (host will see a popup)
5. **Browse and download** available files once approved

### Key Concepts

- **Server**: The Flask backend running on your machine
- **Host**: The person who clicks "Become Host" - controls file sharing
- **Client**: Anyone who connects as a client - can only view/download files

See [USAGE.md](USAGE.md) for detailed usage instructions and troubleshooting.

## API Endpoints

### File Operations

- `GET /files` - List all available files
- `POST /upload` - Upload a new file (rate limited: 10/min)
- `GET /download/<filename>` - Download a file
- `DELETE /delete/<filename>` - Delete a file (rate limited: 20/min)

### Server Info

- `GET /info` - Get server connection information (host URL, LAN IP, etc.)
- `GET /qr` - Generate QR code for a URL

### Authentication

- `POST /auth` - Authenticate with PIN (if enabled)
- `GET /auth/status` - Check authentication status

## WebSocket Events

### Client → Server

- `become_host` - Register as the host
- `stop_host` - Unregister as host
- `request_connect` - Request connection to host
- `approve_request` - Approve a client request (host only)
- `deny_request` - Deny a client request (host only)

### Server → Client

- `host_status` - Host availability status
- `incoming_request` - New connection request (to host)
- `request_approved` - Connection request approved
- `request_denied` - Connection request denied
- `file_uploaded` - File uploaded notification
- `file_deleted` - File deleted notification

## Configuration

### Backend Environment Variables

| Variable                   | Default             | Description                                  |
| -------------------------- | ------------------- | -------------------------------------------- |
| `ACCESS_PIN`               | None                | Enable PIN authentication (set to PIN value) |
| `CORS_ORIGINS`             | localhost:5173,5174 | Allowed frontend origins                     |
| `FILE_TTL_SECONDS`         | 0                   | Auto-cleanup interval (0 = disabled)         |
| `CLEANUP_INTERVAL_SECONDS` | 60                  | Cleanup check interval                       |
| `SECRET_KEY`               | Random              | Session encryption key                       |

### Frontend Environment Variables

| Variable       | Default               | Description          |
| -------------- | --------------------- | -------------------- |
| `VITE_API_URL` | http://localhost:5000 | Backend API base URL |

## Security Features

- **Rate Limiting**: Upload (10/min), Delete (20/min), Global (200/day, 50/hour)
- **Environment-based CORS**: Configurable allowed origins
- **Secure Filename Handling**: Uses werkzeug's secure_filename
- **PIN Authentication**: Optional PIN protection for file access
- **Host Approval Flow**: Clients must be approved by host
- **Logging**: Comprehensive logging for debugging and monitoring

## Development

### Run Backend in Development

```powershell
.\.venv\Scripts\Activate.ps1
python app.py
```

### Run Frontend in Development

```powershell
cd frontend\react
npm run dev
```

### Build Frontend for Production

```powershell
cd frontend\react
npm run build
npm run preview  # Preview production build
```

### Lint Frontend Code

```powershell
cd frontend\react
npm run lint
```

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

## Troubleshooting

### Port Already in Use

If port 5173 is in use, Vite will auto-select 5174. Update `CORS_ORIGINS` in backend if needed.

### Socket.IO Connection Errors

Ensure `CORS_ORIGINS` environment variable includes your frontend dev server URL.

### Upload Failures

- Check file size (max 100MB by default)
- Verify rate limits haven't been exceeded
- Check backend logs for detailed error messages

### Files Not Showing

- Verify you're authenticated (if PIN is enabled)
- Check that you're approved by the host (if connecting as client)
- Reload the file list using the browser refresh

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Note**: This application is designed for trusted local networks. For production use on untrusted networks, implement additional security measures (HTTPS, stronger authentication, network isolation, etc.).

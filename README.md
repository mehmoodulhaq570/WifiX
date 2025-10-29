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
├── app.py                          # Flask backend server
├── requirements.txt                # Python dependencies
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
   pip install -r requirements.txt
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
   python app.py
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

### Starting the Server

1. Start the Flask backend (port 5000)
2. Start the Vite dev server (port 5173/5174)
3. Open the React app in your browser
4. Click "Start Server" in the Server Control panel to become the host

### Host Workflow

1. **Start Server**: Click "Start Server" to enable hosting
2. **Approve Clients**: Accept incoming connection requests from clients
3. **Upload Files**: Drag and drop files or use the upload button
4. **Share QR Code**: Toggle "Show QR Code" to display QR for mobile access
5. **Manage Files**: Delete files when no longer needed
6. **Stop Server**: Click "Stop Server" to end the hosting session

### Client Workflow

1. Open the app in browser
2. Click "Connect to Host" to request access
3. Wait for host approval
4. Once approved, browse and download available files

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

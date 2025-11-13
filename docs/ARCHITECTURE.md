# WifiX Architecture

System design and technical architecture documentation

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Communication Protocol](#communication-protocol)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Database & Storage](#database--storage)
- [Deployment Architecture](#deployment-architecture)

---

## Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Browser   │  │   Mobile    │  │   Desktop   │         │
│  │  (React)    │  │  (Browser)  │  │  (Browser)  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                 │                 │                 │
│         └─────────────────┴─────────────────┘                │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   Network/LAN   │
                   └────────┬────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                           │      Server Layer                 │
│         ┌─────────────────┴──────────────┐                    │
│         │       Flask Application        │                    │
│         │  ┌──────────────────────────┐  │                    │
│         │  │    Flask-SocketIO         │  │                   │
│         │  │  (WebSocket Handler)     │  │                    │
│         │  └──────────────────────────┘  │                    │
│         │  ┌──────────────────────────┐  │                    │
│         │  │    REST API Endpoints    │  │                    │
│         │  └──────────────────────────┘  │                    │
│         │  ┌──────────────────────────┐  │                    │
│         │  │  File Manager & Storage  │  │                    │
│         │  └──────────────────────────┘  │                    │
│         │  ┌──────────────────────────┐  │                    │
│         │  │   Authentication Layer   │  │                    │
│         │  └──────────────────────────┘  │                    │
│         └─────────────────┬──────────────┘                    │
│                           │                                   │
│         ┌─────────────────┴──────────────┐                    │
│         │     File System Storage        │                    │
│         │       (uploads/ folder)        │                    │
│         └────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**

- Flask 2.3.2 - Web framework
- Flask-SocketIO - WebSocket support
- Flask-CORS - Cross-origin resource sharing
- Werkzeug - Security utilities
- Python 3.8+ - Runtime environment

**Frontend:**

- React 19 - UI framework
- Vite - Build tool
- Tailwind CSS - Styling
- Socket.IO Client - WebSocket client
- QRCode.react - QR code generation
- Lucide React - Icons

**Communication:**

- REST API - File operations and metadata
- WebSocket (Socket.IO) - Real-time updates
- HTTP/HTTPS - File transfer protocol

---

## System Architecture

### Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
├────────────┬────────────┬────────────┬────────────────────────┤
│   App.jsx  │ FileUpload │  FileList  │  PINAuth  │  QRCode   │
│ (Root)     │ Component  │ Component  │ Component │ Component  │
└─────┬──────┴──────┬─────┴──────┬─────┴──────┬────┴──────┬─────┘
      │             │            │            │           │
      └─────────────┴────────────┴────────────┴───────────┘
                              │
                    ┌─────────┴──────────┐
                    │   Socket.IO Client  │
                    │   (WebSocket)       │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
         REST API      WebSocket Events    File Download
              │               │                │
              │               │                │
┌─────────────┴───────────────┴────────────────┴──────────────┐
│                        Backend (Flask)                       │
├────────────┬────────────────┬──────────────┬─────────────────┤
│   Routes   │  Socket.IO     │  File Mgmt   │  Auth Mgmt      │
│  (REST)    │  (WebSocket)   │  (Storage)   │  (Sessions)     │
└────────────┴────────────────┴──────────────┴─────────────────┘
```

### Request Flow

**1. File Upload Flow:**

```
Browser → POST /api/upload → Flask Handler → Save to Disk
                                   ↓
                          Emit 'file_uploaded' event
                                   ↓
                          All connected clients receive update
```

**2. File Download Flow:**

```
Browser → GET /api/download/<filename> → Flask Handler
                                            ↓
                                  send_from_directory()
                                            ↓
                                    Stream file to client
```

**3. Real-Time Update Flow:**

```
Action (upload/delete) → Server → socketio.emit('event', data)
                                        ↓
                              Broadcast to all clients
                                        ↓
                              Clients update UI automatically
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── uploads/               # File storage directory
└── static/                # Frontend build files (production)
```

### Core Components

#### 1. Flask Application (`app.py`)

**Responsibilities:**

- HTTP server initialization
- Route definitions
- WebSocket event handlers
- Session management
- CORS configuration
- File cleanup scheduling

**Key Classes/Functions:**

```python
# Application initialization
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB
socketio = SocketIO(app, cors_allowed_origins='*')

# Global state
files_data = {}  # In-memory file metadata
clients = {}     # Connected clients

# Core functions
- get_files()                # List files with metadata
- upload_file()              # Handle file upload
- delete_file()              # Delete file and metadata
- download_file()            # Stream file to client
- cleanup_old_files()        # Periodic cleanup task
```

#### 2. File Management

**Storage Strategy:**

- Files stored on disk in `uploads/` directory
- Metadata stored in-memory (`files_data` dict)
- Unique IDs generated with `uuid.uuid4()`

**Metadata Structure:**

```python
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "document.pdf",
    "size": 1048576,
    "uploaded_at": 1731456789.123,
    "path": "/absolute/path/to/uploads/uuid_document.pdf",
    "protected": False,
    "pin": None  # or hashed PIN if protected
}
```

#### 3. Authentication System

**PIN Protection Levels:**

1. **Global Access PIN:**

   - Set via `ACCESS_PIN` environment variable
   - Required to access the application
   - Stored in session: `session['authenticated'] = True`

2. **Per-File PIN:**
   - Optional for each uploaded file
   - Hashed using `werkzeug.security.generate_password_hash`
   - Verified before download

**Session Management:**

```python
# Flask-Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
```

#### 4. WebSocket Events

**Server Events (Emitted):**

- `file_uploaded` - New file added
- `file_deleted` - File removed
- `file_list_updated` - General file list update
- `connect` - Client connected (auto)
- `disconnect` - Client disconnected (auto)

**Client Events (Received):**

- `request_file_list` - Client requests file list
- `connect` - New client connection
- `disconnect` - Client disconnection

#### 5. File Cleanup System

**Mechanism:**

```python
# Background thread
def cleanup_old_files():
    while True:
        time.sleep(CLEANUP_INTERVAL_SECONDS)
        if FILE_TTL_SECONDS > 0:
            current_time = time.time()
            for file_id, file_data in list(files_data.items()):
                if current_time - file_data['uploaded_at'] > FILE_TTL_SECONDS:
                    delete_file(file_id)
```

**Configuration:**

- `FILE_TTL_SECONDS` - Time-to-live (0 = disabled)
- `CLEANUP_INTERVAL_SECONDS` - Check interval

---

## Frontend Architecture

### Directory Structure

```
frontend/react/
├── src/
│   ├── App.jsx              # Root component
│   ├── components/
│   │   ├── FileUpload.jsx   # Upload interface
│   │   ├── FileList.jsx     # File display & actions
│   │   ├── PINAuth.jsx      # Authentication
│   │   ├── QRCode.jsx       # QR code display
│   │   └── Toast.jsx        # Notifications
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS config
```

### Component Architecture

```
App.jsx (Root)
├── State Management (useState, useEffect)
│   ├── files[] - File list
│   ├── authenticated - Auth status
│   ├── socket - Socket.IO connection
│   └── API_URL - Backend URL
│
├── Socket.IO Integration
│   ├── Connect on mount
│   ├── Event listeners
│   └── Disconnect on unmount
│
└── Child Components
    ├── PINAuth (if ACCESS_PIN set)
    ├── QRCodeDisplay
    ├── FileUpload
    │   └── Drag & Drop / Click to upload
    ├── FileList
    │   └── FileItem × N
    │       ├── File info display
    │       ├── Download button
    │       ├── Delete button (host only)
    │       └── PIN modal (if protected)
    └── Toast (notifications)
```

### State Management

**App-Level State:**

```javascript
const [files, setFiles] = useState([]);
const [authenticated, setAuthenticated] = useState(false);
const [socket, setSocket] = useState(null);
const [isHost, setIsHost] = useState(false);
```

**State Update Flow:**

```
User Action → Event Handler → API Call / Socket Emit
                                      ↓
                              Server Processing
                                      ↓
                          Socket Event Broadcast
                                      ↓
                        Socket Event Listener
                                      ↓
                          setState() Call
                                      ↓
                        React Re-render
```

### Socket.IO Integration

**Connection Setup:**

```javascript
useEffect(() => {
  const newSocket = io(API_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  newSocket.on("connect", () => {
    console.log("Connected to server");
    newSocket.emit("request_file_list");
  });

  setSocket(newSocket);

  return () => newSocket.close();
}, []);
```

**Event Handlers:**

```javascript
socket.on("file_uploaded", (file) => {
  setFiles((prevFiles) => [...prevFiles, file]);
});

socket.on("file_deleted", ({ file_id }) => {
  setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file_id));
});
```

### Styling Architecture

**Tailwind CSS Approach:**

- Utility-first CSS classes
- Responsive design with breakpoints
- Custom color palette in `tailwind.config.js`

**Example:**

```jsx
<button
  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 
                   text-white rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
>
  Upload
</button>
```

---

## Communication Protocol

### REST API Endpoints

| Method | Endpoint                   | Description       | Auth Required |
| ------ | -------------------------- | ----------------- | ------------- |
| `GET`  | `/api/files`               | List all files    | Session       |
| `POST` | `/api/upload`              | Upload file       | Session       |
| `POST` | `/api/delete/<file_id>`    | Delete file       | Session       |
| `GET`  | `/api/download/<filename>` | Download file     | Per-file PIN  |
| `POST` | `/api/verify-pin`          | Verify global PIN | None          |
| `POST` | `/api/verify-file-pin`     | Verify file PIN   | None          |

### WebSocket Events

**Server → Client:**

```javascript
// File uploaded
socket.emit("file_uploaded", {
  id: "uuid",
  name: "file.pdf",
  size: 1048576,
  uploaded_at: 1731456789.123,
  protected: false,
});

// File deleted
socket.emit("file_deleted", {
  file_id: "uuid",
});

// File list update
socket.emit("file_list_updated", {
  files: [
    /* array of file objects */
  ],
});
```

**Client → Server:**

```javascript
// Request file list
socket.emit("request_file_list");
```

### Data Formats

**File Object:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "document.pdf",
  "size": 1048576,
  "uploaded_at": 1731456789.123,
  "protected": false
}
```

**Error Response:**

```json
{
  "error": "Error message description"
}
```

**Success Response:**

```json
{
  "message": "Operation successful",
  "data": {
    /* relevant data */
  }
}
```

---

## Data Flow

### Upload Sequence

```
1. User selects file(s)
   ↓
2. Frontend: FileUpload component handles selection
   ↓
3. Frontend: Creates FormData with file + optional PIN
   ↓
4. Frontend: POST request to /api/upload
   ↓
5. Backend: Validates file size and type
   ↓
6. Backend: Generates unique ID
   ↓
7. Backend: Saves file to uploads/ directory
   ↓
8. Backend: Stores metadata in files_data
   ↓
9. Backend: Emits 'file_uploaded' event to all clients
   ↓
10. All clients: Receive event and update file list
    ↓
11. Frontend: Display success notification
```

### Download Sequence

```
1. User clicks download button
   ↓
2. Frontend: Check if file is protected
   ↓
3a. If protected: Show PIN modal
    ↓
    User enters PIN
    ↓
    POST /api/verify-file-pin
    ↓
    Backend validates PIN
    ↓
    If valid: Return download token (optional) or proceed

3b. If not protected: Proceed to download
    ↓
4. Frontend: Trigger GET /api/download/<filename>
   ↓
5. Backend: Stream file using send_from_directory()
   ↓
6. Browser: Handle file download
```

### Delete Sequence

```
1. Host clicks delete button
   ↓
2. Frontend: Confirm deletion (optional)
   ↓
3. Frontend: POST /api/delete/<file_id>
   ↓
4. Backend: Verify session (host only)
   ↓
5. Backend: Delete file from filesystem
   ↓
6. Backend: Remove from files_data
   ↓
7. Backend: Emit 'file_deleted' event
   ↓
8. All clients: Receive event and update UI
   ↓
9. Frontend: Display success notification
```

### Real-Time Sync

```
                    Server State Change
                           ↓
              ┌────────────┴────────────┐
              │   socketio.emit()       │
              └────────────┬────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   Client A           Client B           Client C
   socket.on()        socket.on()        socket.on()
        ↓                  ↓                  ↓
   Update UI          Update UI          Update UI
```

---

## Security Architecture

### Authentication Layers

**Layer 1: Global Access Control**

```
Request → Check ACCESS_PIN env var
           ↓
       Is set? → Yes → Check session['authenticated']
           ↓              ↓
          No            Valid? → Yes → Allow access
           ↓              ↓
    Allow access        No
                         ↓
                 Return 401 Unauthorized
```

**Layer 2: Per-File Protection**

```
Download Request → Check file.protected
                         ↓
                     Is protected? → Yes → Request PIN
                         ↓                    ↓
                        No              Verify PIN hash
                         ↓                    ↓
                   Allow download      Valid? → Yes → Allow download
                                              ↓
                                             No
                                              ↓
                                        Return 403 Forbidden
```

### Security Features

1. **PIN Hashing:**

   ```python
   from werkzeug.security import generate_password_hash, check_password_hash

   hashed_pin = generate_password_hash(pin)
   is_valid = check_password_hash(hashed_pin, user_input)
   ```

2. **Secure Filename Handling:**

   ```python
   from werkzeug.utils import secure_filename

   safe_name = secure_filename(original_filename)
   ```

3. **Session Security:**

   - HttpOnly cookies
   - Secure flag (HTTPS only)
   - SameSite attribute
   - Session expiration (24 hours)

4. **CORS Configuration:**

   ```python
   socketio = SocketIO(app, cors_allowed_origins='*')  # Development
   # Production:
   socketio = SocketIO(app, cors_allowed_origins=['https://trusted-domain.com'])
   ```

5. **File Upload Limits:**
   ```python
   app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB
   ```

### Threat Mitigation

| Threat              | Mitigation                             |
| ------------------- | -------------------------------------- |
| Unauthorized Access | PIN authentication, session management |
| File Overwrites     | UUID-based filenames                   |
| Path Traversal      | `secure_filename()`                    |
| Large File DoS      | `MAX_CONTENT_LENGTH` limit             |
| XSS                 | React auto-escaping, CSP headers       |
| CSRF                | SameSite cookies, token validation     |
| Man-in-the-Middle   | HTTPS enforcement (production)         |

---

## Database & Storage

### File Storage

**Strategy: Filesystem-based**

**Structure:**

```
uploads/
├── 550e8400-e29b-41d4-a716-446655440000_document.pdf
├── 661f9510-f3ac-52e5-b827-557766551111_image.jpg
└── 772fa620-g4bd-63f6-c938-668877662222_video.mp4
```

**Naming Convention:**

```
{uuid}_{sanitized_original_filename}
```

**Advantages:**

- Simple implementation
- No database overhead
- Easy backup/restore
- Direct web server serving

**Disadvantages:**

- No ACID guarantees
- Metadata in-memory (lost on restart)
- Limited query capabilities

### Metadata Storage

**Current: In-Memory Dictionary**

```python
files_data = {
    "550e8400-...": {
        "id": "550e8400-...",
        "name": "document.pdf",
        "size": 1048576,
        "uploaded_at": 1731456789.123,
        "path": "/path/to/uploads/550e8400_document.pdf",
        "protected": False,
        "pin": None
    }
}
```

**Future: Database Option (SQLite/PostgreSQL)**

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    path TEXT NOT NULL,
    protected BOOLEAN DEFAULT FALSE,
    pin_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_uploaded_at ON files(uploaded_at);
CREATE INDEX idx_deleted_at ON files(deleted_at);
```

---

## Deployment Architecture

### Development Deployment

```
┌─────────────────────────────────────┐
│  Developer Machine                  │
│  ┌───────────────────────────────┐  │
│  │  Vite Dev Server :5173       │  │
│  │  (Frontend with HMR)         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Flask Dev Server :5000      │  │
│  │  (Backend with auto-reload)  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Production Deployment

**Option 1: Single Server**

```
┌────────────────────────────────────────┐
│  Production Server                     │
│  ┌──────────────────────────────────┐  │
│  │  Nginx (Reverse Proxy)          │  │
│  │  ┌────────────┬──────────────┐  │  │
│  │  │ Static     │  Proxy to    │  │  │
│  │  │ Files      │  :5000       │  │  │
│  │  └────────────┴──────────────┘  │  │
│  └────────────┬────────────────────┘  │
│               ↓                        │
│  ┌──────────────────────────────────┐  │
│  │  Gunicorn + Eventlet :5000      │  │
│  │  (Flask + SocketIO)             │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  File Storage (uploads/)        │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name wifix.local;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Option 2: Docker Container**

```
┌────────────────────────────────────────┐
│  Docker Container                      │
│  ┌──────────────────────────────────┐  │
│  │  Python 3.11 Slim               │  │
│  │  ├── Flask App                  │  │
│  │  ├── Gunicorn                   │  │
│  │  └── Static Files               │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Volume: /app/uploads           │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Docker Compose:**

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
      - ACCESS_PIN=${ACCESS_PIN}
      - SECRET_KEY=${SECRET_KEY}
    restart: unless-stopped
```

### Scalability Considerations

**Current Limitations:**

- Single-server architecture
- In-memory metadata (not shared across instances)
- Filesystem storage (not distributed)

**Future Enhancements:**

- Database for metadata (PostgreSQL)
- Object storage (S3, MinIO) for files
- Redis for session sharing
- Load balancer for multiple instances
- Message queue (RabbitMQ, Redis) for event distribution

---

## Performance Optimization

### Backend Optimizations

1. **File Streaming:**

   ```python
   # Already implemented
   return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
   ```

2. **Async Processing:**

   ```python
   # Future: Use Celery for background tasks
   @celery.task
   def cleanup_old_files_task():
       # File cleanup logic
   ```

3. **Caching:**
   ```python
   # Future: Cache file list
   @cache.memoize(timeout=60)
   def get_files():
       return list(files_data.values())
   ```

### Frontend Optimizations

1. **Code Splitting:**

   ```javascript
   // Vite handles automatically
   const FileUpload = lazy(() => import("./components/FileUpload"));
   ```

2. **Memoization:**

   ```javascript
   const FileList = React.memo(({ files }) => {
     // Component logic
   });
   ```

3. **Virtualization:**
   ```javascript
   // Future: For large file lists
   import { FixedSizeList } from "react-window";
   ```

---

**Last Updated:** November 13, 2025

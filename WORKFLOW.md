# WifiX Connection & File Upload Workflow

## 🔄 Connection Approval Workflow

### How It Works

1. **Host Starts Server**
   - User clicks "Start Server" button
   - Backend receives `become_host` event via Socket.IO
   - Backend registers this socket as `HOST_SID`
   - Host UI shows "Hosting" status with green indicator

2. **Client Requests Connection**
   - Another user opens the host's IP address in browser
   - User clicks "Connect to Host" button
   - Optionally enters a display name (defaults to "Guest")
   - Frontend emits `request_connect` event with name to backend

3. **Backend Forwards Request to Host**
   - Backend receives `request_connect` from client
   - Backend emits `incoming_request` event to the HOST_SID socket
   - Payload includes: `{ sid: '<client-socket-id>', name: '<display-name>' }`

4. **Host Approves/Denies Connection**
   - Host sees a beautiful modal popup with requester's name
   - Host clicks "Allow Connection" or "Deny"
   - Frontend emits `approve_request` or `deny_request` with client's SID

5. **Backend Notifies Client**
   - If approved: Backend emits `request_approved` to client socket
   - If denied: Backend emits `request_denied` to client socket
   - Client UI updates accordingly

6. **Client Gets Access**
   - Approved clients can now:
     - See all uploaded files
     - Upload new files
     - Delete files (if authenticated)
     - Receive real-time updates via Socket.IO

┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────>│   Backend    │────────>│    Host     │
│  (Browser)  │ request │ (Socket.IO)  │ forward │  (Browser)  │
└─────────────┘         └──────────────┘         └─────────────┘
                                                         │
                                                         │ approve/deny
                                                         ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │<────────│   Backend    │<────────│    Host     │
│  (Access!)  │ notify  │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘

## 📁 File Upload with Timestamp

### Upload Process

1. **User Selects File**
   - Drag & drop or click to select
   - File stored in `fileInputRef`

2. **Upload to Backend**
   - Frontend sends file via FormData to `/upload` endpoint
   - Shows progress percentage during upload

3. **Backend Saves with Timestamp**
   - Backend receives file at `/upload` route
   - Generates timestamp: `YYYYMMDDHHMMSS` format (UTC)
   - Creates filename: `{timestamp}_{original_filename}`
   - Example: `20251028024500_document.pdf`
   - Saves to `uploads/` folder

4. **Backend Broadcasts Update**
   - Backend emits `file_uploaded` event via Socket.IO
   - All connected clients receive the update
   - Payload includes: `{ filename, url, size, type }`

5. **UI Updates**
   - File appears in the file list for all users
   - Shows: name, size, upload time, type, download link
   - Host and approved clients can see and download

## 🔐 Security Features

### PIN Authentication (Optional)
- Set `ACCESS_PIN` environment variable to enable
- Users must enter PIN to:
  - View files
  - Upload files
  - Delete files
- Session-based authentication

### File Access Control
- Only approved clients can see files
- Host always has full access
- Unapproved clients see nothing until host approves

## 🌐 Network Discovery

### LAN Access
- Backend detects LAN IP automatically
- Generates QR code for easy mobile access
- Shows both host URL and LAN URL

### Zeroconf/mDNS (Optional)
- Auto-discovery on local network
- Service name: `WifiX on {IP}._wifi-share._tcp.local.`
- Disable with `ENABLE_ZEROCONF=0`

## 📊 Real-time Updates

All events broadcast via Socket.IO:
- `file_uploaded` - New file added
- `file_deleted` - File removed
- `request_approved` - Connection approved
- `request_denied` - Connection denied
- `host_status` - Host availability changed

## 🗂️ File Structure

```
WifiX/
├── app.py                          # Backend Flask + Socket.IO server
├── uploads/                        # Uploaded files (timestamped)
├── frontend/react/src/
│   ├── App.jsx                     # Main app component
│   ├── components/
│   │   ├── ConnectionApprovalModal.jsx  # Host approval UI
│   │   ├── ConnectionStatus.jsx         # Status indicator
│   │   ├── ServerControl.jsx            # Start/stop server
│   │   ├── FileUploadZone.jsx           # Drag & drop upload
│   │   ├── FileList.jsx                 # File listing
│   │   └── ...
│   ├── hooks/
│   │   ├── useSocket.js            # Socket.IO management
│   │   ├── useFileUpload.js        # Upload with progress
│   │   └── useAuth.js              # PIN authentication
│   └── utils/
│       └── api.js                  # API helper functions
```

## 🚀 Usage Example

### Start the Backend
```bash
cd WifiX
python app.py
```

### Start the Frontend (Development)
```bash
cd frontend/react
npm run dev
```

### Host Workflow
1. Open browser to `http://localhost:5173`
2. Click "Start Server"
3. Share the LAN URL or QR code with others
4. Wait for connection requests
5. Approve/deny each request via modal popup

### Client Workflow
1. Scan QR code or enter host's IP
2. Click "Connect to Host"
3. Enter your name (optional)
4. Wait for host approval
5. Once approved, upload/download files

## 🎯 Key Features Implemented

✅ Connection approval workflow with modal UI
✅ Timestamped file uploads (YYYYMMDDHHMMSS format)
✅ Real-time Socket.IO updates
✅ Drag & drop file upload
✅ Upload progress tracking
✅ File download links
✅ Connection status indicators
✅ Dark mode support
✅ QR code generation
✅ LAN IP detection
✅ PIN authentication (optional)
✅ File deletion with confirmation

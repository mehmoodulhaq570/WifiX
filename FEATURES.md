# WifiX Features

This document describes all the features implemented in WifiX, a modern file-sharing application.

## Recent Features (Latest Release)

### 1. Easy Connection Methods (Room Codes & mDNS)

#### Room Codes

- **Components**: `RoomCodeGenerator.jsx`, `RoomCodeConnect.jsx`, `ConnectionHub.jsx`
- **Backend**: `room_codes.py`, API endpoints in `app.py`
- **Description**: Generate short, memorable codes that map to server IP addresses
- **Features**:
  - **Code Generation**:
    - 6-character alphanumeric codes (e.g., ABC123)
    - Excludes confusing characters (O/0, I/1)
    - Optional custom room names
    - Automatic expiration (default: 60 minutes)
  - **Code Usage**:
    - Simple input interface for clients
    - Automatic connection lookup
    - Case-insensitive code entry
  - **API Endpoints**:
    - `POST /api/room-code/generate` - Create new room code
    - `GET /api/room-code/<code>` - Lookup connection details
    - `DELETE /api/room-code/<code>` - Delete room code
    - `GET /api/room-codes` - List all active codes
- **Benefits**:
  - No need to remember IP addresses
  - Easy to share verbally or in messages
  - Automatic security through expiration
  - Perfect for quick connections in meetings

#### mDNS (Multicast DNS) Discovery

- **Component**: `MDNSDiscovery.jsx`
- **Backend**: `mdns_service.py`, enhanced Zeroconf implementation
- **Description**: Automatic network discovery using human-readable hostnames
- **Features**:
  - **Automatic Advertisement**:
    - Registers service on local network
    - Creates `.local` hostname (e.g., `mydevice.local`)
    - Service type: `_wifix._tcp.local.`
  - **Discovery Interface**:
    - Shows current hostname and URL
    - Real-time status indicator
    - Copy hostname and URL buttons
    - Service information display
  - **Configuration**:
    - Enable/disable via `ENABLE_MDNS` environment variable
    - Custom service name via `MDNS_SERVICE_NAME`
    - Works on same local network
- **Benefits**:
  - Zero configuration required
  - Human-readable names
  - Automatic discovery
  - Works across different devices and platforms
- **Compatibility**:
  - ✓ macOS (native support)
  - ✓ iOS (native support)
  - ✓ Linux (Avahi/systemd-resolved)
  - ✓ Windows (Bonjour or native support)
  - ✓ Android (via app libraries)

### 2. Onboarding Tour for First-Time Users

- **Component**: `OnboardingTour.jsx`
- **Description**: Interactive guided tour that appears on first visit
- **Features**:
  - 5-step walkthrough: Welcome → Become Host → Share Link → Upload Zone → Complete
  - Spotlight effect that highlights UI elements
  - Progress indicators showing current step
  - Skip/Back/Next navigation buttons
  - Persists completion state in localStorage (`wifix-onboarding-completed`)
  - Uses `data-tour` attributes to target specific elements
- **User Experience**:
  - Shows once per browser
  - Can be skipped at any time
  - Automatically closes when complete
  - Responsive design works on all screen sizes

### 2. Improved QR Code UX

- **Location**: `ServerControl.jsx`
- **Enhancements**:
  - **Instructions**: Step-by-step guide showing how to scan QR code
    1. Open your phone's camera app
    2. Point at the QR code
    3. Tap the notification to open
  - **Tap-to-Copy**: Click or tap the QR code to copy the link to clipboard
  - **Helpful Tips**: Network requirement reminder (same Wi-Fi)
  - **Keyboard Accessible**: Enter/Space key support for copying
  - **Toast Notifications**: Visual feedback when link is copied
- **Benefits**:
  - Reduces user confusion
  - Provides fallback for devices that can't scan QR codes
  - Clear visual feedback

### 3. Connected Devices List

- **Component**: `ConnectedDevices.jsx`
- **Backend**: Enhanced Socket.IO tracking in `app.py`
- **Features**:
  - **Real-time Display**: Shows all approved clients connected to the host
  - **Client Information**:
    - Display name (or "Anonymous User" if not provided)
    - Connection time (formatted as "Xh Ym ago", "Xm ago", "Xs ago")
    - IP address
    - Live status indicator (green pulsing dot)
  - **Host Actions**:
    - Disconnect button for each client
    - Force disconnect sends notification to client
    - Automatic list updates when clients connect/disconnect
  - **UI Features**:
    - Only visible to the host
    - Hidden when no clients are connected
    - Shows client count in header
    - Hover effects and transitions
    - ARIA labels for accessibility
- **Backend Implementation**:
  - `CONNECTED_CLIENTS` dictionary tracks all approved clients
  - Socket.IO events:
    - `request_client_list`: Host requests current list
    - `client_list_update`: Server sends updated list to host
    - `disconnect_client`: Host disconnects a specific client
    - `force_disconnect`: Server notifies client of forced disconnect
  - Automatic cleanup when clients or host disconnect

## Previous Features

### Toast Notifications + Undo

- **Library**: `react-hot-toast`
- **Features**:
  - Non-blocking notifications (top-right position)
  - Success messages for uploads, deletions, link copying
  - Error messages for failed operations
  - Undo button for file deletions (5-second window)
  - Custom styling with dark theme support
  - 4-second duration (adjustable per notification)
- **Benefits**:
  - Better UX than blocking `alert()` dialogs
  - Visual feedback without interrupting workflow
  - Ability to reverse accidental deletions

### Per-File Upload Progress + Speed

- **Implementation**: Custom XMLHttpRequest with progress tracking
- **Features**:
  - **Real-time Progress**: Shows percentage and progress bar for each file
  - **Upload Speed**: Displays speed in appropriate units (B/s, KB/s, MB/s)
  - **Data Transfer**: Shows loaded/total bytes
  - **Visual Indicators**:
    - Spinning icon during upload
    - Blue highlight for uploading files
    - Progress bar animation
  - **State Management**: Tracks multiple simultaneous uploads
- **Technical Details**:
  - Custom XHR replaces standard fetch for progress events
  - Speed calculation: `(loaded - previousLoaded) / timeDelta`
  - Unit formatting: Automatically switches between B/s, KB/s, MB/s
  - Cleans up tracking state on completion/error

### Bug Report Form

- **Component**: `BugReportModal.jsx`
- **Features**:
  - **Automatic Environment Collection**:
    - Browser and version
    - Platform (OS)
    - Screen resolution
    - Language/locale
    - Cookie status
    - Current URL
    - Timestamp
  - **Form Fields**:
    - Description (required)
    - Steps to reproduce
    - Expected behavior
    - Actual behavior
  - **Actions**:
    - Copy Report: Copies formatted markdown to clipboard
    - Copy & Open GitHub: Copies and opens GitHub issues with pre-filled title
  - **UX Features**:
    - Escape key to close
    - Focus management
    - ARIA labels for accessibility
    - Input validation
    - Toast notifications for feedback
- **Integration**: Accessible via "Report Bug/Error" in header three-dot menu

### Header Improvements

- **Three-Dot Menu**: Settings, About, Report Bug, GitHub
- **SVG Icons**: Professional icons replacing emojis
- **ARIA Accessibility**: Proper roles, labels, and keyboard navigation
- **Theme Toggle**: Dark mode switch with system preference detection
- **Config-Driven URLs**: Environment variable support (`VITE_GITHUB_REPO`)

### File Management

- **Upload Zone**: Drag-and-drop file upload with visual feedback
- **File List**: Table view with file names, sizes, timestamps
- **Delete Files**: Confirmation modal with undo capability
- **PIN Protection**: Optional PIN codes for file downloads
- **Real-time Sync**: Socket.IO updates all connected clients

### Connection Management

- **Host/Client Roles**: Users can host or connect as clients
- **Connection Approval**: Modal-based approval flow for incoming connections
- **QR Code Sharing**: Generate QR codes for easy mobile connection
- **Device Discovery**: Automatic LAN IP detection and URL generation
- **Connection Testing**: Test button to verify host reachability

### Dark Mode

- **Theme Toggle**: Switch between light and dark themes
- **Persistent**: Saves preference in localStorage
- **System Sync**: Respects system dark mode preference
- **Full Coverage**: All components support dark mode

## Technical Stack

### Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 3.4.14
- **Real-time**: Socket.IO Client
- **Notifications**: react-hot-toast
- **QR Codes**: react-qr-code

### Backend

- **Framework**: Python Flask
- **Real-time**: Flask-SocketIO
- **CORS**: Flask-CORS
- **Rate Limiting**: Flask-Limiter
- **QR Generation**: python-qrcode
- **Protocol**: HTTP + WebSocket (Socket.IO)

## Environment Configuration

Create a `.env` file in `frontend/react/`:

```env
VITE_GITHUB_REPO=your-username/your-repo
VITE_API_URL=http://localhost:5000
```

## File Structure

```
WifiX/
├── backend/
│   ├── app.py              # Flask server with Socket.IO
│   ├── uploads/            # Uploaded files storage
│   └── requirements.txt    # Python dependencies
├── frontend/
│   └── react/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Header.jsx
│       │   │   ├── ServerControl.jsx
│       │   │   ├── FileUploadZone.jsx
│       │   │   ├── FileList.jsx
│       │   │   ├── ConnectedDevices.jsx  # NEW
│       │   │   ├── OnboardingTour.jsx    # NEW
│       │   │   ├── BugReportModal.jsx
│       │   │   └── ...
│       │   ├── hooks/
│       │   │   ├── useSocket.js
│       │   │   ├── useFileUpload.js
│       │   │   └── useAuth.js
│       │   └── App.jsx
│       ├── package.json
│       └── .env.example
└── FEATURES.md             # This file
```

## Usage

### Starting the Application

1. **Backend** (Terminal 1):

   ```bash
   cd backend
   python app.py
   ```

2. **Frontend** (Terminal 2):

   ```bash
   cd frontend/react
   npm install
   npm run dev
   ```

3. Open browser to `http://localhost:5173`

### Using as Host

1. Click "Become Host" button
2. Share the link or show QR code to clients
3. Approve incoming connection requests
4. View connected clients in the devices list
5. Upload/delete files (all clients see changes in real-time)
6. Disconnect specific clients if needed

### Using as Client

1. Open the host's shared link
2. Wait for host approval
3. View and download shared files
4. Upload files (if host allows)

## Keyboard Shortcuts & Accessibility

- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals (approval, delete, bug report)
- **ARIA Labels**: All interactive elements have proper labels
- **Focus Management**: Modals trap focus, restore on close
- **Keyboard-Only Navigation**: Fully functional without mouse

## Best Practices

### For Hosts

- Use descriptive device names
- Regularly check connected devices list
- Disconnect suspicious or unknown clients
- Use PIN protection for sensitive files

### For Clients

- Provide your name when connecting for easier identification
- Don't abuse upload capabilities
- Respect the host's file management decisions

## Future Enhancements (Potential)

- File preview (images, PDFs)
- Folder upload support
- Bandwidth throttling
- File encryption for sensitive data
- User avatars
- Chat between host and clients
- Transfer history/logs
- Mobile app (React Native)
- Multi-host support (rooms)
- File expiration settings

## Security Considerations

- Files are stored temporarily in `backend/uploads/`
- Optional PIN protection for downloads
- Rate limiting on all endpoints
- CORS configured for specific origins
- Host approval required for connections
- Host can forcefully disconnect clients
- No authentication (LAN-based trust model)

## License

[Your License Here]

## Contributing

[Contributing guidelines if applicable]

## Support

For bugs or feature requests, use the "Report Bug/Error" feature in the application or visit the GitHub repository.

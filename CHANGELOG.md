# Changelog

All notable changes to WifiX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2026-06-19

- **Production Backend Entrypoint**:

  - Added a dedicated production import path for the backend server
  - Keeps Zeroconf registration available outside the development server path
  - Supports both project-root and `backend/` folder execution

- **Host/Client Connection Fallback**:

  - Added HTTP fallback endpoints for client connection requests
  - Host now polls pending requests if the live Socket.IO event is missed
  - Client now polls approval status until the host responds
  - Approval and denial can complete even when the direct socket event is delayed

- **Client Button Feedback**:
  - Added a visible connecting state for **Connect as Client**
  - Button now shows loading text and spinner while a request is being sent
  - Prevents duplicate clicks during connection attempts
  - Shows clearer success and failure messages

### Changed - 2026-06-19

- **Windows Production Server Support**:

  - Switched Windows production guidance from Gunicorn to Waitress
  - Made backend dependencies platform-aware
  - Kept Gunicorn for Linux/systemd deployments
  - Defaulted Socket.IO transport to polling for Waitress compatibility

- **LAN API URL Detection**:

  - Frontend now rewrites localhost backend URLs to the LAN page host when opened from another device
  - Prevents client devices from trying to connect to their own `localhost`
  - Uploads and API calls now use the shared API resolver

- **Host State Messaging**:
  - Clarified that the red host button means hosting is active and clicking it stops hosting
  - Added helper text telling users that clients can request access after hosting starts

### Fixed - 2026-06-19

- **Werkzeug Production Warning**:

  - Replaced production use of `python backend/app.py` with production server commands
  - Kept `backend/app.py` as the development-only entrypoint

- **Gunicorn on Windows Failure**:

  - Fixed `ModuleNotFoundError: No module named 'fcntl'` by avoiding Gunicorn on Windows
  - Added Waitress for Windows production runs

- **Waitress WebSocket Upgrade Error**:

  - Fixed `RuntimeError: Cannot obtain socket from WSGI environment`
  - Prevented the frontend from forcing WebSocket upgrades under Waitress

- **Host Button / Socket.IO Reachability**:

  - Added backend acknowledgements for host registration and client requests
  - Host registration now waits for backend confirmation before showing success
  - Better frontend errors when the backend is unreachable

- **Client Request Not Reaching Host**:

  - Added fallback request storage on the backend
  - Host can now receive pending requests through polling
  - Client no longer depends only on a single live Socket.IO event

- **Responsive Layout Issues**:
  - Improved mobile layout for connection controls, upload zone, header, and file list
  - File table now becomes mobile-friendly stacked cards on small screens
  - Removed leftover Vite demo CSS that could affect layout

### Planned

- Mobile app support (iOS/Android)
- File compression before transfer
- Bulk file operations
- User accounts and authentication
- File expiration scheduling
- Transfer history and analytics

---

## [1.1.0] - 2025-11-16

### Added

- **Full-Width Layout**: Application now uses entire viewport width

  - Removed max-width constraint from #root
  - Better space utilization on all screen sizes
  - Responsive padding (px-4 on mobile, px-6 on tablet, px-8 on desktop)
  - Max-width constraint only for ultra-wide screens (1920px)

- **Comprehensive Debug Logging**: Socket.IO connection debugging

  - Added logging to `become_host` handler
  - Added logging to `request_connect` handler
  - Host SID tracking in logs
  - Connection approval/denial logging
  - Helps troubleshoot connection issues

- **Rate Limit Exemptions**:
  - Exempted `/info` endpoint from rate limiting
  - Exempted `/auth/status` endpoint from rate limiting
  - Prevents 429 errors during normal usage
  - Allows real-time polling without restrictions

### Changed

- **CORS Configuration**: Changed to wildcard (`*`) for LAN support

  - Allows connections from any device on local network
  - Required for mobile devices with dynamic IPs
  - Configurable via `CORS_ORIGINS` environment variable
  - Zeroconf discovery makes IPs unpredictable

- **Rate Limits Increased**:

  - From 50 requests/hour to 500 requests/hour
  - From 200 requests/day to 2000 requests/day
  - Configurable via `RATE_LIMIT_HOUR` and `RATE_LIMIT_DAY` env variables
  - Better accommodation for development and active usage

- **Socket.IO Connection Handling**:

  - Replaced `autoRequested` state with `requestSentRef`
  - Improved connection request flow
  - Reset connection state on disconnect
  - Better handler setup timing

- **Mobile Responsiveness**:
  - Improved touch targets for mobile devices
  - Better responsive breakpoints (sm, md, lg, xl)
  - Full-width on mobile, constrained on desktop
  - Optimized padding and spacing

### Fixed

- **"Connect as Client" Not Working**:

  - Fixed socket connection request flow
  - Removed blocking `autoRequested` state
  - Improved handler setup before connection
  - Added wait for socket connection before emitting events

- **Rate Limit 429 Errors**:

  - Fixed frequent 429 errors on localhost
  - Exempted frequently polled endpoints
  - Increased default limits
  - Better rate limit configuration

- **Socket.IO Errors**:

  - Fixed "not an accepted origin" errors for LAN devices
  - Improved CORS configuration for Socket.IO
  - Better error messages in logs
  - Fixed connection state synchronization

- **useSocket Hook Error**:

  - Fixed undefined `autoRequested` variable
  - Removed from return statement (not needed externally)
  - Proper cleanup on component unmount

- **Layout Issues**:
  - Fixed centered layout not using full width
  - Removed `display: flex` and `place-items: center` from body
  - Proper full-width implementation with `width: 100%`

---

## [1.0.0] - 2025-11-13

### Added

- **Onboarding Tour**: Interactive first-time user guide

  - 5-step walkthrough of key features
  - Spotlight effect on UI elements
  - Progress indicators and navigation
  - Persistent completion state

- **Connected Devices List**: Real-time client monitoring

  - Shows all connected clients with names and IPs
  - Connection time tracking
  - Host can disconnect specific clients
  - Auto-updates on connect/disconnect

- **Improved QR Code UX**:

  - Step-by-step scanning instructions
  - Tap-to-copy functionality
  - Better mobile accessibility
  - Visual feedback on interactions

- **Toast Notifications with Undo**:
  - Non-blocking success/error messages
  - Undo functionality for deletions (5-second window)
  - Dark mode support
  - Custom styling

### Changed

- Migrated from plain JavaScript to React 19
- Improved dark mode implementation
- Enhanced UI with Tailwind CSS
- Better mobile responsiveness
- Optimized file upload progress tracking

### Fixed

- Duplicate file entries in upload list
- Dark mode toggle persistence
- WebSocket connection stability
- File deletion confirmation edge cases

---

## [0.9.0] - 2025-11-10

### Added

- **Per-File Upload Progress**:

  - Real-time progress bars
  - Upload speed indicators (B/s, KB/s, MB/s)
  - Data transfer tracking
  - Multiple simultaneous uploads

- **Per-File PIN Protection**:
  - Optional PIN for individual files
  - PIN verification modal
  - Session-based PIN caching
  - Visual indicators for protected files

### Changed

- Improved error handling throughout app
- Better WebSocket error recovery
- Enhanced file list UI

### Fixed

- Upload timeout issues for large files
- PIN modal edge cases
- Connection approval race conditions

---

## [0.8.0] - 2025-11-08

### Added

- **Dark Mode Support**:

  - System preference detection
  - Manual toggle with persistence
  - Smooth transitions
  - Full component coverage

- **Delete Confirmation Modal**:
  - Prevents accidental deletions
  - Shows file information
  - Keyboard shortcuts (Esc to cancel)

### Changed

- Redesigned file list with better styling
- Improved connection status indicators
- Better error messages

### Fixed

- File list refresh issues
- Connection state synchronization
- Mobile layout problems

---

## [0.7.0] - 2025-11-05

### Added

- **Host/Client Approval Flow**:

  - Host must approve client connections
  - Connection approval modal
  - Request tracking and management
  - Automatic cleanup on disconnect

- **QR Code Generation**:
  - Generate QR codes for easy mobile access
  - Configurable size and format
  - Direct link sharing

### Changed

- Enhanced security with rate limiting
- Improved file upload handling
- Better error reporting

### Fixed

- Memory leaks in WebSocket handlers
- File upload edge cases
- Cross-origin issues

---

## [0.6.0] - 2025-11-01

### Added

- **Real-time Updates with WebSockets**:

  - Live file list synchronization
  - Upload notifications
  - Deletion notifications
  - Connection status updates

- **Global PIN Authentication**:
  - Optional server-wide PIN protection
  - Session-based authentication
  - Secure session management

### Changed

- Migrated to Flask-SocketIO
- Improved error handling
- Better logging system

### Fixed

- CORS configuration issues
- Session persistence problems
- File path security vulnerabilities

---

## [0.5.0] - 2025-10-25

### Added

- **File Persistence**:

  - Files persist until explicitly deleted
  - Configurable auto-cleanup (optional)
  - Storage management

- **Rate Limiting**:
  - Protection against abuse
  - Configurable limits
  - Per-IP tracking

### Changed

- Enhanced file metadata tracking
- Improved upload performance
- Better mobile UI

### Fixed

- File size calculation errors
- Upload progress accuracy
- Duplicate file handling

---

## [0.4.0] - 2025-10-20

### Added

- **Drag-and-Drop Upload**:

  - Intuitive file upload
  - Visual feedback
  - Multiple file support

- **File Type Detection**:
  - Automatic MIME type detection
  - File extension validation
  - Size limit enforcement (1GB)

### Changed

- Redesigned upload UI
- Improved file list display
- Better error messages

### Fixed

- Upload timeout issues
- File name encoding problems
- Browser compatibility issues

---

## [0.3.0] - 2025-10-15

### Added

- **Download Functionality**:

  - Secure file downloads
  - Progress tracking
  - Resume support

- **File Management**:
  - File listing
  - Sorting by date/size
  - Search functionality

### Changed

- Improved backend API structure
- Enhanced security measures
- Better logging

### Fixed

- Path traversal vulnerabilities
- Download corruption issues
- Memory management

---

## [0.2.0] - 2025-10-10

### Added

- **Basic Upload**:

  - Single file upload
  - File validation
  - Progress indication

- **Web Interface**:
  - Simple HTML UI
  - File list display
  - Basic styling

### Changed

- Switched to Flask framework
- Improved file handling
- Better error reporting

### Fixed

- Upload reliability
- File storage issues
- Browser compatibility

---

## [0.1.0] - 2025-10-05

### Added

- Initial release
- Basic HTTP server
- Simple file sharing
- Command-line interface

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

---

## Links

- [GitHub Repository](https://github.com/yourusername/WifiX)
- [Issue Tracker](https://github.com/yourusername/WifiX/issues)
- [Documentation](https://github.com/yourusername/WifiX/tree/main/docs)

# Changelog

All notable changes to WifiX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Mobile app support (iOS/Android)
- File compression before transfer
- Bulk file operations
- User accounts and authentication
- File expiration scheduling
- Transfer history and analytics

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

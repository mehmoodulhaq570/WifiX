# WifiX Components Documentation

## Component Structure

```
components/
├── Header.jsx                      # App header with title
├── Footer.jsx                      # App footer with copyright
├── ServerControl.jsx               # Server start/stop & QR code
├── FileUploadZone.jsx              # Drag & drop upload area
├── FileList.jsx                    # File listing table
├── ConnectionStatus.jsx            # Status banner (NEW)
├── ConnectionApprovalModal.jsx     # Host approval modal (NEW)
├── UploadErrorModal.jsx            # Upload error modal (NEW)
├── DeleteModal.jsx                 # Delete confirmation
└── DarkModeToggle.jsx              # Dark/light mode toggle
```

## Component Props

### ServerControl
```javascript
<ServerControl
  isHost={boolean}              // Is this user hosting?
  deviceInfo={object}           // { lan_ip, lan_url, host_url }
  qrUrl={string}                // URL for QR code
  qrVisible={boolean}           // Show/hide QR code
  onStartServer={function}      // Start hosting
  onStopServer={function}       // Stop hosting
  onConnectToHost={function}    // Connect as client
  onToggleQR={function}         // Toggle QR visibility
/>
```

### FileUploadZone
```javascript
<FileUploadZone
  fileInputRef={ref}            // Reference to file input
  onUpload={function}           // Upload handler
  onFileSelect={function}       // Optional: file selection callback
/>
```

### FileList
```javascript
<FileList
  files={array}                 // Array of file objects
  statusMsg={string}            // Status message to display
  onDelete={function}           // Delete handler
/>
```

### ConnectionStatus
```javascript
<ConnectionStatus
  isHost={boolean}              // Hosting status
  isApproved={boolean}          // Connection approved?
  statusMsg={string}            // Current status message
/>
```

### ConnectionApprovalModal
```javascript
<ConnectionApprovalModal
  show={boolean}                // Show/hide modal
  requesterName={string}        // Name of person requesting
  onApprove={function}          // Approve handler
  onDeny={function}             // Deny handler
/>
```

### UploadErrorModal
```javascript
<UploadErrorModal
  show={boolean}                // Show/hide modal
  error={string}                // Error message
  onClose={function}            // Close handler
/>
```

### DeleteModal
```javascript
<DeleteModal
  show={boolean}                // Show/hide modal
  filename={string}             // File to delete
  onConfirm={function}          // Confirm delete
  onCancel={function}           // Cancel delete
/>
```

## File Object Structure

```javascript
{
  name: string,        // Filename (with timestamp)
  url: string,         // Download URL
  size: number,        // Size in bytes
  mtime: number,       // Modified time (timestamp)
  type: string         // File type/extension
}
```

## Device Info Structure

```javascript
{
  ip: string,          // IP address
  lan_ip: string,      // LAN IP address
  host_url: string,    // Full host URL
  lan_url: string      // Full LAN URL
}
```

## Usage Examples

### Basic App Setup
```javascript
function App() {
  const [isHost, setIsHost] = useState(false);
  const [files, setFiles] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({});
  
  return (
    <>
      <Header />
      <ConnectionStatus isHost={isHost} statusMsg="Ready" />
      <ServerControl
        isHost={isHost}
        deviceInfo={deviceInfo}
        onStartServer={() => setIsHost(true)}
      />
      <FileUploadZone onUpload={handleUpload} />
      <FileList files={files} onDelete={handleDelete} />
      <Footer />
    </>
  );
}
```

### Handling Connection Approval
```javascript
const [pendingRequest, setPendingRequest] = useState(null);
const [showApproval, setShowApproval] = useState(false);

// When request comes in
socket.on('incoming_request', (data) => {
  setPendingRequest(data);
  setShowApproval(true);
});

// In render
<ConnectionApprovalModal
  show={showApproval}
  requesterName={pendingRequest?.name}
  onApprove={() => {
    socket.emit('approve_request', { sid: pendingRequest.sid });
    setShowApproval(false);
  }}
  onDeny={() => {
    socket.emit('deny_request', { sid: pendingRequest.sid });
    setShowApproval(false);
  }}
/>
```

### Handling Upload Errors
```javascript
const [uploadError, setUploadError] = useState(null);
const [showError, setShowError] = useState(false);

const handleUpload = async (file) => {
  try {
    await uploadFile(file);
  } catch (e) {
    setUploadError(e.message);
    setShowError(true);
  }
};

// In render
<UploadErrorModal
  show={showError}
  error={uploadError}
  onClose={() => {
    setShowError(false);
    setUploadError(null);
  }}
/>
```

## Styling

All components use:
- **Tailwind CSS** for styling
- **Dark mode** support via `dark:` classes
- **Responsive** design with `sm:`, `md:`, `lg:` breakpoints
- **Transitions** for smooth animations
- **Hover effects** for better UX

## Best Practices

1. **Always validate** before operations
2. **Show loading states** during async operations
3. **Clear error messages** for users
4. **Confirm destructive actions** (delete, deny)
5. **Real-time updates** via Socket.IO
6. **Responsive design** for mobile/desktop
7. **Dark mode support** for all components

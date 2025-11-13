# API Documentation

## Base URL

```
http://<server-ip>:5000
```

## Authentication

WifiX uses optional PIN-based authentication and session management.

### Global PIN

Set via environment variable:

```bash
ACCESS_PIN=1234 python backend/app.py
```

Once authenticated, session is maintained via cookies.

---

## Endpoints

### 1. Server Information

#### `GET /info`

Get server connection information.

**Response:**

```json
{
  "host_url": "http://localhost:5000/",
  "lan_url": "http://192.168.1.5:5000/",
  "lan_ip": "192.168.1.5"
}
```

---

### 2. File Operations

#### `GET /files`

List all uploaded files.

**Response:**

```json
[
  {
    "filename": "20251113120000_document.pdf",
    "url": "http://192.168.1.5:5000/download/20251113120000_document.pdf",
    "mtime": 1699876800.0,
    "size": 1024000,
    "type": "pdf",
    "has_pin": false
  }
]
```

#### `POST /upload`

Upload a file.

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `file`: File to upload
  - `pin` (optional): PIN for file protection

**Response:**

```json
{
  "filename": "20251113120000_document.pdf",
  "url": "http://192.168.1.5:5000/download/20251113120000_document.pdf",
  "has_pin": true
}
```

**Status Codes:**

- `201`: File uploaded successfully
- `400`: Invalid file or file type not allowed
- `401`: Authentication required (if ACCESS_PIN is set)
- `500`: Upload failed

#### `GET /download/<filename>`

Download a file.

**Query Parameters:**

- `pin` (optional): PIN for protected files

**Response:**

- File content with appropriate headers

**Status Codes:**

- `200`: File downloaded successfully
- `403`: Invalid PIN
- `404`: File not found

#### `DELETE /delete/<filename>`

Delete a file.

**Response:**

```json
{
  "ok": true
}
```

**Status Codes:**

- `200`: File deleted successfully
- `401`: Authentication required
- `404`: File not found
- `500`: Deletion failed

---

### 3. QR Code

#### `GET /qr`

Generate QR code for URL.

**Query Parameters:**

- `url` (optional): URL to encode (defaults to server URL)

**Response:**

- PNG image of QR code

---

### 4. Authentication (Optional)

#### `POST /verify-pin`

Verify PIN for file download (when per-file PIN is set).

**Request:**

```json
{
  "filename": "20251113120000_document.pdf",
  "pin": "1234"
}
```

**Response:**

```json
{
  "success": true
}
```

**Status Codes:**

- `200`: PIN valid
- `403`: Invalid PIN
- `404`: File not found

---

## WebSocket Events

WifiX uses Socket.IO for real-time communication.

### Client → Server Events

#### `become_host`

Register as the host.

**Payload:** None

**Response:** `host_status` event

#### `request_connect`

Request connection to host.

**Payload:**

```json
{
  "name": "Client Name"
}
```

**Response:** `request_approved` or `request_denied`

#### `approve_request`

Host approves a connection request.

**Payload:**

```json
{
  "sid": "socket-id-to-approve"
}
```

**Response:** None (approved client receives `request_approved`)

#### `deny_request`

Host denies a connection request.

**Payload:**

```json
{
  "sid": "socket-id-to-deny"
}
```

**Response:** None (denied client receives `request_denied`)

#### `stop_host`

Stop being the host.

**Payload:** None

**Response:** `host_status` broadcast

#### `request_client_list`

Host requests list of connected clients.

**Payload:** None

**Response:** `client_list_update` event

#### `disconnect_client`

Host disconnects a specific client.

**Payload:**

```json
{
  "sid": "socket-id-to-disconnect"
}
```

**Response:** None (disconnected client receives `force_disconnect`)

---

### Server → Client Events

#### `host_status`

Host availability status.

**Payload:**

```json
{
  "available": true
}
```

#### `incoming_request`

Host receives connection request.

**Payload:**

```json
{
  "sid": "client-socket-id",
  "name": "Client Name"
}
```

#### `request_approved`

Client's connection request approved.

**Payload:**

```json
{
  "by": "host-socket-id"
}
```

#### `request_denied`

Client's connection request denied.

**Payload:**

```json
{
  "by": "host-socket-id",
  "reason": "no_host"
}
```

#### `file_uploaded`

File was uploaded (broadcast).

**Payload:**

```json
{
  "filename": "20251113120000_document.pdf",
  "url": "http://192.168.1.5:5000/download/20251113120000_document.pdf",
  "size": 1024000,
  "has_pin": false
}
```

#### `file_deleted`

File was deleted (broadcast).

**Payload:**

```json
{
  "filename": "20251113120000_document.pdf"
}
```

#### `client_list_update`

Updated list of connected clients (host only).

**Payload:**

```json
{
  "clients": [
    {
      "sid": "socket-id",
      "name": "Client Name",
      "connected_at": 1699876800.0,
      "ip": "192.168.1.10"
    }
  ]
}
```

#### `force_disconnect`

Client was disconnected by host.

**Payload:**

```json
{
  "reason": "Host disconnected you"
}
```

#### `host_disconnected`

Host has disconnected (broadcast to clients).

**Payload:**

```json
{
  "message": "Host has left"
}
```

---

## Rate Limiting

Default limits:

- **Global**: 200 requests per day, 50 per hour
- **Upload**: 20 requests per minute
- **Delete**: 20 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1699877400
```

---

## Error Responses

Standard error format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "detail": "Additional details (optional)"
}
```

### Common Error Codes

| Code                  | Status | Description             |
| --------------------- | ------ | ----------------------- |
| `unauthorized`        | 401    | Authentication required |
| `forbidden`           | 403    | Access denied           |
| `not_found`           | 404    | Resource not found      |
| `file_too_large`      | 400    | File exceeds size limit |
| `invalid_file_type`   | 400    | File type not allowed   |
| `upload_failed`       | 500    | File upload error       |
| `rate_limit_exceeded` | 429    | Too many requests       |

---

## Examples

### cURL Examples

**List files:**

```bash
curl http://192.168.1.5:5000/files
```

**Upload file:**

```bash
curl -X POST \
  -F "file=@document.pdf" \
  http://192.168.1.5:5000/upload
```

**Upload with PIN:**

```bash
curl -X POST \
  -F "file=@document.pdf" \
  -F "pin=1234" \
  http://192.168.1.5:5000/upload
```

**Download file:**

```bash
curl -O http://192.168.1.5:5000/download/20251113120000_document.pdf
```

**Download with PIN:**

```bash
curl -O "http://192.168.1.5:5000/download/20251113120000_document.pdf?pin=1234"
```

**Delete file:**

```bash
curl -X DELETE http://192.168.1.5:5000/delete/20251113120000_document.pdf
```

### JavaScript Examples

**List files:**

```javascript
const response = await fetch("http://192.168.1.5:5000/files");
const files = await response.json();
console.log(files);
```

**Upload file:**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://192.168.1.5:5000/upload", {
  method: "POST",
  body: formData,
  credentials: "include",
});

const result = await response.json();
console.log(result);
```

**WebSocket connection:**

```javascript
import io from "socket.io-client";

const socket = io("http://192.168.1.5:5000", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected");
  socket.emit("become_host");
});

socket.on("file_uploaded", (data) => {
  console.log("New file:", data);
});
```

---

## CORS Configuration

Default allowed origins:

- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`

Configure via environment variable:

```bash
CORS_ORIGINS="http://localhost:5173,http://192.168.1.5:3000" python backend/app.py
```

---

## File Storage

Files are stored in `backend/uploads/` with timestamped filenames:

Format: `YYYYMMDDHHmmss_originalname.ext`

Example: `20251113120000_document.pdf`

---

## Environment Variables

| Variable                   | Default              | Description                           |
| -------------------------- | -------------------- | ------------------------------------- |
| `PORT`                     | `5000`               | Server port                           |
| `ACCESS_PIN`               | None                 | Global authentication PIN             |
| `CORS_ORIGINS`             | `localhost:5173,...` | Allowed CORS origins                  |
| `FILE_TTL_SECONDS`         | `0`                  | File auto-cleanup time (0 = disabled) |
| `CLEANUP_INTERVAL_SECONDS` | `60`                 | Cleanup check interval                |
| `SECRET_KEY`               | Random               | Session encryption key                |

---

## Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

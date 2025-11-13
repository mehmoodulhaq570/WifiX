# Easy Connection Methods - Usage Guide

This guide explains how to use Room Codes and mDNS Discovery to connect to WifiX servers easily, without memorizing IP addresses.

## Table of Contents

- [Room Codes](#room-codes)
- [mDNS Discovery](#mdns-discovery)
- [Traditional Connection](#traditional-connection)
- [Which Method Should I Use?](#which-method-should-i-use)

---

## Room Codes

Room codes provide a simple way to share access to your WifiX server using short, memorable codes instead of IP addresses.

### For Hosts (Generating a Room Code)

1. **Start the WifiX Server**

   ```bash
   cd backend
   python app.py
   ```

2. **Access the Server**

   - Open your browser and go to the server URL (displayed in the terminal)
   - Click on "Become Host" to enable hosting features

3. **Generate a Room Code**

   - Navigate to the "Connection Hub" or "Easy Connection" section
   - Click on the "Generate Code" tab
   - (Optional) Enter a room name for easy identification
   - Click "Generate Room Code"

4. **Share the Code**
   - Copy the generated code (e.g., `ABC123`)
   - Share it with people you want to grant access to
   - The code is valid for 60 minutes by default

### For Clients (Connecting with a Room Code)

1. **Get the Room Code**

   - Obtain the room code from the host (e.g., via message, email, or verbally)

2. **Enter the Code**

   - Open your WifiX client interface
   - Navigate to the "Connection Hub" section
   - Click on the "Connect with Code" tab
   - Enter the room code (case-insensitive)
   - Click "Connect"

3. **Access the Server**
   - The system will automatically look up the server details
   - You'll be redirected to the server

### API Usage (For Developers)

#### Generate a Room Code

```bash
curl -X POST http://localhost:5000/api/room-code/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "My Meeting Room"}'
```

Response:

```json
{
  "success": true,
  "code": "ABC123",
  "url": "http://192.168.1.100:5000",
  "name": "My Meeting Room"
}
```

#### Lookup a Room Code

```bash
curl http://localhost:5000/api/room-code/ABC123
```

Response:

```json
{
  "success": true,
  "ip": "192.168.1.100",
  "port": 5000,
  "url": "http://192.168.1.100:5000",
  "name": "My Meeting Room"
}
```

#### List All Active Codes

```bash
curl http://localhost:5000/api/room-codes
```

#### Delete a Room Code

```bash
curl -X DELETE http://localhost:5000/api/room-code/ABC123
```

---

## mDNS Discovery

mDNS (Multicast DNS) allows devices on the same local network to discover and connect to the WifiX server using a friendly hostname instead of an IP address.

### How It Works

When mDNS is enabled, the WifiX server:

1. Registers itself on the local network
2. Creates a `.local` hostname (e.g., `mycomputer.local`)
3. Advertises its availability to other devices

### Enabling mDNS

mDNS is **enabled by default**. To configure it:

#### Via Environment Variables

```bash
# Enable/disable mDNS (default: enabled)
export ENABLE_MDNS=1

# Set custom service name (default: hostname)
export MDNS_SERVICE_NAME="My-WifiX-Server"

# Start the server
cd backend
python app.py
```

#### Via Code Configuration

Edit `backend/app.py` or set environment variables before running.

### Connecting via mDNS

#### Method 1: Browser

Simply type the hostname in your browser:

```
http://mycomputer.local:5000
```

#### Method 2: WifiX UI

1. Open the WifiX connection interface
2. Navigate to the "mDNS Discovery" tab
3. View the server's mDNS information
4. Copy the hostname or URL
5. Access the server using the provided link

### Platform Compatibility

| Platform    | Support          | Notes                                             |
| ----------- | ---------------- | ------------------------------------------------- |
| **macOS**   | ✓ Native         | Works out of the box                              |
| **iOS**     | ✓ Native         | Works out of the box                              |
| **Linux**   | ✓ Requires setup | Install Avahi: `sudo apt install avahi-daemon`    |
| **Windows** | ✓ Requires setup | Install Bonjour or use Windows 10+ native support |
| **Android** | ✓ Via apps       | Some browsers support it natively                 |

### Troubleshooting mDNS

#### Server Side

**Check if mDNS is running:**

```bash
# The server will display mDNS status on startup
# Look for lines like:
# ✓ Accessible at: http://mydevice.local:5000
# ✓ Service Name: mydevice._wifix._tcp.local.
```

**Check mDNS service status:**

```python
# Via API
curl http://localhost:5000/info
```

Response includes mDNS status:

```json
{
  "host_url": "http://localhost:5000/",
  "lan_url": "http://192.168.1.100:5000/",
  "lan_ip": "192.168.1.100",
  "mdns": {
    "running": true,
    "service_name": "mydevice._wifix._tcp.local.",
    "hostname": "mydevice.local.",
    "url": "http://mydevice.local:5000",
    "port": 5000
  }
}
```

#### Client Side

**Linux:**

```bash
# Install Avahi
sudo apt install avahi-daemon avahi-utils

# Test mDNS resolution
avahi-browse -a

# Test specific hostname
ping mydevice.local
```

**macOS:**

```bash
# mDNS works natively, test with:
dns-sd -B _wifix._tcp

# Or simply ping
ping mydevice.local
```

**Windows:**

```powershell
# Test with ping
ping mydevice.local

# If it doesn't work, install Bonjour:
# Download from Apple or use iTunes installer
```

---

## Traditional Connection

If you prefer the traditional method or if the easy connection methods aren't available:

### Using IP Address

1. **Find the Server IP**

   - The server displays its IP on startup
   - Or check the `/info` endpoint

2. **Connect**
   ```
   http://192.168.1.100:5000
   ```

### Using QR Code

1. **Generate QR Code**

   - The server can generate a QR code for the URL
   - Access it at: `http://localhost:5000/qr`

2. **Scan with Mobile**
   - Open your phone's camera
   - Point at the QR code
   - Tap the notification to open

---

## Which Method Should I Use?

### Room Codes

**Best for:**

- ✓ Quick, temporary access
- ✓ Sharing in meetings or conversations
- ✓ When devices are on different networks (with proper routing)
- ✓ When you want expiring access codes

**Limitations:**

- ✗ Codes expire after 60 minutes
- ✗ Requires manual code entry
- ✗ Needs the server to be accessible

### mDNS Discovery

**Best for:**

- ✓ Permanent local network setups
- ✓ Home or office environments
- ✓ When you want automatic discovery
- ✓ No manual configuration needed

**Limitations:**

- ✗ Only works on the same local network
- ✗ Requires mDNS support on client devices
- ✗ May not work on some corporate networks (security restrictions)

### Traditional IP Address

**Best for:**

- ✓ Direct, reliable connections
- ✓ When other methods fail
- ✓ Scripting and automation

**Limitations:**

- ✗ Hard to remember
- ✗ Changes if network/DHCP changes
- ✗ Less user-friendly

---

## Configuration Reference

### Environment Variables

```bash
# Room Codes
# (Configuration in room_codes.py)
# - Default code length: 6 characters
# - Default TTL: 60 minutes

# mDNS
ENABLE_MDNS=1                    # Enable mDNS (default: 1)
MDNS_SERVICE_NAME="My-Server"    # Custom service name (default: hostname)

# Server
PORT=5000                        # Server port (default: 5000)
```

### Python Configuration

Edit `backend/room_codes.py`:

```python
manager = RoomCodeManager(
    code_length=6,      # Length of generated codes
    ttl_minutes=60      # Time-to-live in minutes
)
```

---

## Security Considerations

### Room Codes

- Codes expire automatically after 60 minutes
- Use custom room names to identify connections
- Delete codes when no longer needed
- Monitor active codes via `/api/room-codes`

### mDNS

- Only advertises on local network
- Does not expose server to internet
- Consider disabling on public networks
- Use in combination with PIN protection

---

## Examples

### Example 1: Meeting Room Setup

**Scenario:** You're in a meeting room and want to share files with attendees.

1. Start WifiX server on your laptop
2. Generate a room code: "MEET42"
3. Write the code on the whiteboard
4. Attendees enter the code and connect
5. Share files freely during the meeting
6. Code automatically expires after the meeting

### Example 2: Home Office Setup

**Scenario:** You have multiple devices at home that frequently access your WifiX server.

1. Start WifiX server on your desktop
2. Enable mDNS (enabled by default)
3. Set a friendly name: `MDNS_SERVICE_NAME="Home-Files"`
4. On any device at home, access: `http://Home-Files.local:5000`
5. No need to remember IP addresses
6. Works automatically whenever server is running

### Example 3: Quick File Transfer

**Scenario:** You need to quickly transfer a file to a colleague's phone.

1. Start WifiX server
2. Generate QR code at `/qr`
3. Colleague scans QR code with phone
4. Request approval (if required)
5. Upload/download files
6. Done!

---

## Support

For issues or questions:

- Check the [FEATURES.md](FEATURES.md) for complete feature list
- Review server logs for error messages
- Ensure devices are on the same network (for mDNS)
- Verify firewall settings allow the port (default: 5000)

---

## Future Enhancements

Planned improvements:

- [ ] QR code generation for room codes
- [ ] Browser-based mDNS discovery (via WebRTC)
- [ ] Room code history and analytics
- [ ] Custom code patterns (e.g., memorable words)
- [ ] Multi-server discovery and comparison

# Quick Start: Easy Connection Methods

Get started with Room Codes and mDNS Discovery in 5 minutes!

## Prerequisites

✅ WifiX server installed and running  
✅ Devices on the same local network (for mDNS)  
✅ Modern browser (Chrome, Firefox, Safari, Edge)

---

## Option 1: Room Codes (Fastest)

### For the Host (Sharing Files)

1. **Start the server**:

   ```bash
   cd backend
   python app.py
   ```

2. **Open in browser**:

   ```
   http://localhost:5000
   ```

3. **Generate a room code**:

   - Click "Connection Hub" or navigate to the connection section
   - Click "Generate Code" tab
   - (Optional) Enter a room name
   - Click "Generate Room Code"
   - **Copy the code** (e.g., `ABC123`)

4. **Share the code**:
   - Tell people: "Connect using code ABC123"
   - Or send via chat/email

### For the Client (Connecting)

1. **Get the code** from the host

2. **Open WifiX connection page** or use the API

3. **Enter the code**:
   - Type the code (case-insensitive)
   - Click "Connect"
   - You'll be redirected to the server!

### Quick API Test

```bash
# Generate a code
curl -X POST http://localhost:5000/api/room-code/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room"}'

# Output: {"success": true, "code": "ABC123", "url": "http://192.168.1.100:5000"}

# Lookup the code
curl http://localhost:5000/api/room-code/ABC123
```

---

## Option 2: mDNS Discovery (Automatic)

### Setup (One-time)

mDNS is **enabled by default**! Just start the server.

### Usage

1. **Start the server**:

   ```bash
   cd backend
   python app.py
   ```

2. **Look for the mDNS info** in startup output:

   ```
   🌐 mDNS Service:
      ✓ Accessible at: http://mydevice.local:5000
      ✓ Service Name: mydevice._wifix._tcp.local.
   ```

3. **Connect from any device on the same network**:
   ```
   http://mydevice.local:5000
   ```

That's it! No IP addresses needed.

### Platform Setup (if needed)

**Linux**:

```bash
sudo apt install avahi-daemon
sudo systemctl start avahi-daemon
```

**Windows**: Install Bonjour or use Windows 10+ native support  
**macOS/iOS**: Works out of the box ✓

---

## Integration with React Frontend

### Add to Your App

```jsx
import ConnectionHub from "./components/ConnectionHub";

function App() {
  return (
    <ConnectionHub
      serverUrl="http://localhost:5000"
      isHost={true} // Set to true for hosts, false for clients
    />
  );
}
```

### Or Use Individual Components

```jsx
// Room code generator (for hosts)
import RoomCodeGenerator from "./components/RoomCodeGenerator";
<RoomCodeGenerator serverUrl="http://localhost:5000" />;

// Room code connect (for clients)
import RoomCodeConnect from "./components/RoomCodeConnect";
<RoomCodeConnect onConnect={(details) => console.log(details)} />;

// mDNS display
import MDNSDiscovery from "./components/MDNSDiscovery";
<MDNSDiscovery serverInfo={serverInfo} />;
```

---

## Testing Checklist

### Room Codes

- [ ] Start server
- [ ] Generate a room code via UI or API
- [ ] Code is displayed (6 characters)
- [ ] Copy code to clipboard works
- [ ] Lookup code from different browser/device
- [ ] Code redirects to correct server
- [ ] Code expires after 60 minutes

### mDNS

- [ ] Start server
- [ ] mDNS message appears in startup log
- [ ] Access via `hostname.local` URL
- [ ] Connection succeeds from same network
- [ ] mDNS info visible in `/info` endpoint

---

## Troubleshooting

### Room Codes

**Problem**: "Code not found"  
**Solution**: Code may have expired (60 min TTL) - generate a new one

**Problem**: Can't reach server after entering code  
**Solution**: Ensure devices can communicate (firewall, network routing)

### mDNS

**Problem**: `hostname.local` doesn't resolve  
**Solution**:

- Linux: `sudo apt install avahi-daemon && sudo systemctl start avahi-daemon`
- Windows: Install Bonjour or check Windows native support
- Check if devices are on same network

**Problem**: mDNS service not starting  
**Solution**: Check server logs for errors. Set `ENABLE_MDNS=0` to disable if not needed

**Problem**: Hostname conflicts  
**Solution**: Set custom name: `export MDNS_SERVICE_NAME="My-Unique-Name"`

---

## Configuration

### Environment Variables

```bash
# Room codes (configured in room_codes.py)
# Default: 6 characters, 60-minute TTL

# mDNS
export ENABLE_MDNS=1                      # Enable mDNS (default: 1)
export MDNS_SERVICE_NAME="My-WifiX"       # Custom service name (default: hostname)

# Server
export PORT=5000                          # Server port (default: 5000)
```

### Customize Room Code Settings

Edit `backend/room_codes.py`:

```python
manager = RoomCodeManager(
    code_length=6,      # Change code length
    ttl_minutes=120     # Change expiration time (2 hours)
)
```

---

## Examples

### Example 1: Team Meeting

**Scenario**: Share files with 10 people in a meeting

```bash
# Host
python backend/app.py
# Generate code: "MEET42"
# Write on whiteboard

# Attendees
# Enter "MEET42" in connection form
# Instant access!
```

### Example 2: Home Network

**Scenario**: Permanent setup for family devices

```bash
# Host
export MDNS_SERVICE_NAME="Family-Files"
python backend/app.py

# All devices at home
# Access: http://Family-Files.local:5000
# No codes, no IPs to remember!
```

### Example 3: Quick File Transfer

**Scenario**: Send file to colleague's phone

```bash
# Generate code
curl -X POST http://localhost:5000/api/room-code/generate \
  -d '{"name": "Quick Share"}'

# Share code verbally
# Colleague enters code on phone
# Done in 30 seconds!
```

---

## Next Steps

- 📖 Read the [Complete Guide](EASY_CONNECTION_GUIDE.md)
- 🎨 Customize components for your UI
- 🔧 Configure settings via environment variables
- 📊 Monitor usage via `/api/room-codes` endpoint
- 🎯 Integrate with your existing authentication

---

## Resources

- [Full Documentation](EASY_CONNECTION_GUIDE.md) - Complete guide with API reference
- [Feature Summary](EASY_CONNECTION_SUMMARY.md) - Implementation details
- [Main README](../README.md) - Project overview
- [Features List](../FEATURES.md) - All WifiX features

---

## Support

Questions? Issues?

1. Check server startup logs
2. Review [Troubleshooting Guide](EASY_CONNECTION_GUIDE.md#troubleshooting)
3. Verify network connectivity
4. Check firewall settings

**Quick Checks**:

```bash
# Test server is running
curl http://localhost:5000/info

# Test room code API
curl http://localhost:5000/api/room-codes

# Test mDNS (Linux)
avahi-browse -a
```

---

**Ready to start?** Run `python backend/app.py` and look for the connection info! 🚀

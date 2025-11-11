# WifiX Usage Guide

## 🚀 Quick Start

### 1. Start the Server

Run the Flask backend:

```bash
python backend/app.py
```

You'll see a banner like this:

```
============================================================
🚀 WifiX Server Started Successfully!
============================================================

📡 Server is running on:
   Local:   http://127.0.0.1:5000
   Network: http://192.168.1.5:5000

🔗 Share this link with others:
   👉 http://192.168.1.5:5000

📱 Scan QR code at: http://192.168.1.5:5000/qr

💡 Instructions:
   1. Open the link above in your browser to become the HOST
   2. Share the link with others to let them connect as CLIENTS
   3. As HOST, you'll approve/deny incoming connections

============================================================
```

### 2. Become the Host

1. **Copy the Network URL** from the terminal (e.g., `http://192.168.1.5:5000`)
2. **Open it in your browser**
3. Click **"🏠 Become Host"** button
4. You're now the host! You can upload/delete files and approve client connections

### 3. Connect as Client

1. **Share the same URL** with others on your network
2. They open it in their browser
3. They click **"👥 Connect as Client"** button
4. **You (the host) will see a popup** asking to approve/deny their connection
5. Once approved, they can see and download files

## 🔑 Key Concepts

### Server vs Host vs Client

- **Server**: The Flask backend running on your machine (started with `python backend/app.py`)
- **Host**: The first person who clicks "Become Host" - controls file sharing and approves connections
- **Client**: Anyone else who connects - can view/download files after host approval

### Roles

| Role   | Can Upload | Can Delete | Can Approve Connections | Needs Approval |
| ------ | ---------- | ---------- | ----------------------- | -------------- |
| Host   | ✅ Yes     | ✅ Yes     | ✅ Yes                  | ❌ No          |
| Client | ❌ No      | ❌ No      | ❌ No                   | ✅ Yes         |

## 📱 Sharing Methods

### Method 1: Copy Link

Use the **"📋 Copy"** button in the UI to copy the shareable link

### Method 2: QR Code

Click **"Show QR Code"** and let others scan it with their phone camera

### Method 3: Manual

Share the IP address shown in the terminal (e.g., `192.168.1.5:5000`)

## 🔒 Security Features

### PIN Protection (Optional)

Set `ACCESS_PIN` environment variable to require authentication:

```bash
# Windows PowerShell
$env:ACCESS_PIN="1234"
python backend/app.py

# Linux/Mac
ACCESS_PIN=1234 python backend/app.py
```

### Per-File PIN Protection

When uploading a file, you can enable "PIN Protection" to require a PIN for downloading that specific file.

## 🛠️ Advanced Configuration

### Change Port

```bash
# Windows PowerShell
$env:PORT="8080"
python backend/app.py

# Linux/Mac
PORT=8080 python backend/app.py
```

### Auto-Delete Old Files

```bash
# Delete files older than 1 hour (3600 seconds)
FILE_TTL_SECONDS=3600 python backend/app.py
```

### Disable Zeroconf/mDNS

```bash
ENABLE_ZEROCONF=0 python backend/app.py
```

## 🐛 Troubleshooting

### Can't connect from other devices?

1. **Check firewall**: Allow port 5000 (or your custom port)
2. **Same network**: Ensure all devices are on the same WiFi/LAN
3. **Correct IP**: Use the Network IP shown in the terminal, not 127.0.0.1

### "Connection denied by host"?

The host needs to approve your connection request. Ask them to check for the approval popup.

### Files not syncing?

The app auto-syncs every 3 seconds. If issues persist, refresh the browser.

## 📝 Example Workflow

1. **Alice** starts the server on her laptop: `python backend/app.py`
2. **Alice** opens `http://192.168.1.5:5000` and clicks "Become Host"
3. **Alice** uploads some photos
4. **Bob** opens the same URL on his phone
5. **Bob** clicks "Connect as Client"
6. **Alice** sees a popup: "Bob wants to connect" → clicks "Approve"
7. **Bob** can now see and download Alice's photos
8. **Alice** can stop hosting anytime by clicking "Stop Hosting"

## 🎯 Tips

- **Host should start first**: The person who starts the server should become the host
- **One host at a time**: Only one person can be the host
- **Host controls everything**: Only the host can upload, delete, and approve connections
- **Clients are read-only**: Clients can only view and download files
- **Network only**: This works on local network (WiFi/LAN), not over the internet

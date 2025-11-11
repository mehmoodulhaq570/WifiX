import os
import threading
import time
import io
import logging
import importlib.util
import pkgutil
import atexit
import socket
import ssl as _ssl
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse, urlunparse

# Third-party imports
import qrcode
from werkzeug.utils import secure_filename
from flask import Flask, request, redirect, url_for, send_from_directory, render_template, jsonify, send_file, session
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from jinja2 import TemplateNotFound

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Backfill ssl.wrap_socket if missing (some stdlib shuffles in newer Pythons)
if not hasattr(_ssl, 'wrap_socket'):
    def _wrap_socket(sock, server_side=False, **kwargs):
        ctx = _ssl.create_default_context(purpose=_ssl.Purpose.SERVER_AUTH if not server_side else _ssl.Purpose.CLIENT_AUTH)
        return ctx.wrap_socket(sock, server_side=server_side, **kwargs)
    _ssl.wrap_socket = _wrap_socket

# Backfill for Python versions that removed pkgutil.get_loader (e.g. Python 3.14+)
if not hasattr(pkgutil, 'get_loader'):
    def _get_loader(name):
        # Avoid calling find_spec on special __main__ specs which can raise
        # ValueError on some importlib implementations when __spec__ is None.
        try:
            if isinstance(name, str) and name.startswith('__main__'):
                return None
            spec = importlib.util.find_spec(name)
            return spec.loader if spec else None
        except Exception:
            return None
    pkgutil.get_loader = _get_loader

# Configuration
UPLOAD_FOLDER = Path(__file__).parent / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = None  # allow all for Phase 1; restrict later if needed
# By default keep uploaded files until user explicitly deletes them.
# Set FILE_TTL_SECONDS in the environment to a positive integer to enable automatic cleanup.
FILE_TTL_SECONDS = int(os.environ.get("FILE_TTL_SECONDS", 0))  # 0 = disabled by default
CLEANUP_INTERVAL_SECONDS = int(os.environ.get("CLEANUP_INTERVAL_SECONDS", 60))

ROOT_DIR = Path(__file__).parent.parent
# Look for templates at the repository root `templates/` if present so the
# app can still render a legacy Jinja UI when run from the backend/ folder.
app = Flask(__name__, template_folder=str(ROOT_DIR / "templates"))
app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024 * 1024  # 1 GiB guard (adjust)
# Session secret for optional PIN flow
app.secret_key = os.environ.get('SECRET_KEY') or os.urandom(24)

# Allow cross-origin Socket.IO connections from the frontend dev server (Vite)
# In production, restrict to specific origins via CORS_ORIGINS environment variable
ALLOWED_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173').split(',')

# Enable CORS for all HTTP routes with credentials support
CORS(app, resources={r"/*": {
    "origins": ALLOWED_ORIGINS,
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}})

socketio = SocketIO(app, cors_allowed_origins=ALLOWED_ORIGINS, async_mode='threading')

# Rate limiting configuration
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Runtime state: which connected socket is the current "host" (UI that started the server)
HOST_SID = None

# Per-file PIN storage: {filename: pin_code}
FILE_PINS = {}


@socketio.on('become_host')
def handle_become_host(data):
    """Mark the calling socket as the host that can approve incoming connection requests."""
    global HOST_SID
    HOST_SID = request.sid
    try:
        socketio.emit('host_status', {'available': True}, to=HOST_SID)
    except Exception:
        pass


@socketio.on('request_connect')
def handle_request_connect(data):
    """A client requests to connect to the host. Forward this to the host if present.
    Payload can include a display name: { name: 'Alice' }
    """
    global HOST_SID
    payload = {'sid': request.sid, 'name': data.get('name') if isinstance(data, dict) else None}
    if HOST_SID:
        try:
            socketio.emit('incoming_request', payload, to=HOST_SID)
        except Exception:
            pass
    else:
        # no host: notify requester immediately
        try:
            socketio.emit('request_denied', {'reason': 'no_host'}, to=request.sid)
        except Exception:
            pass


@socketio.on('approve_request')
def handle_approve_request(data):
    """Host approves a request. Expects { sid: '<requester-sid>' }"""
    target = None
    if isinstance(data, dict):
        target = data.get('sid')
    if target:
        try:
            socketio.emit('request_approved', {'by': request.sid}, to=target)
        except Exception:
            pass


@socketio.on('deny_request')
def handle_deny_request(data):
    target = None
    if isinstance(data, dict):
        target = data.get('sid')
    if target:
        try:
            socketio.emit('request_denied', {'by': request.sid}, to=target)
        except Exception:
            pass


@socketio.on('disconnect')
def _on_disconnect():
    """Cleanup host SID if the host disconnects."""
    global HOST_SID
    sid = request.sid
    if HOST_SID == sid:
        HOST_SID = None
        # broadcast to clients that host is gone
        try:
            socketio.emit('host_status', {'available': False})
        except Exception:
            pass


@socketio.on('stop_host')
def handle_stop_host(data):
    """Host requests to stop being the host (from frontend). If the calling socket is the registered host,
    clear HOST_SID and notify clients that host is no longer available.
    """
    global HOST_SID
    sid = request.sid
    if HOST_SID == sid:
        HOST_SID = None
        try:
            socketio.emit('host_status', {'available': False})
        except Exception:
            pass

def allowed_file(filename: str) -> bool:
    if ALLOWED_EXTENSIONS is None:
        return True
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Basic page with a small upload form for Phase 1.

    If a Jinja `index.html` template is present in `templates/` this will render
    it (legacy behavior). When using the React frontend during development the
    template may not exist; in that case we fall back to one of:
      1. Serve the built React app if `frontend/react/dist/index.html` exists.
      2. Redirect to the Vite dev server at http://localhost:5173 (default).

    This makes it easy to develop with the React frontend without a templates
    folder while preserving the original template-based UI as an option.
    """
    try:
        return render_template('index.html')
    except TemplateNotFound:
        # If frontend React build exists, serve it directly (resolve from repo root)
        built = ROOT_DIR / 'frontend' / 'react' / 'dist' / 'index.html'
        if built.exists():
            return send_file(str(built))
        # Otherwise redirect to the Vite dev server (adjust via env if needed)
        vite_url = os.environ.get('VITE_DEV_SERVER', 'http://localhost:5173')
        return redirect(vite_url)


def _detect_lan_ip():
    """Try to determine the primary LAN IPv4 address for this host.
    Returns a string IPv4 address (or '127.0.0.1' on failure).
    """
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # doesn't need to be reachable; used to pick the outbound interface
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'


@app.route('/info', methods=['GET'])
def info():
    """Return JSON with connection URLs (host_url and lan_url) for device discovery/UI."""
    host_url = request.host_url  # includes scheme and trailing slash
    lan_ip = _detect_lan_ip()
    parsed = urlparse(host_url)
    # build lan_url by replacing the netloc host with lan_ip (keep port if present)
    netloc = lan_ip
    if parsed.port:
        netloc = f"{lan_ip}:{parsed.port}"
    lan_url = urlunparse((parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
    return jsonify({'host_url': host_url, 'lan_url': lan_url, 'lan_ip': lan_ip})


@app.route('/files', methods=['GET'])
@limiter.exempt
def list_files():
    """Return list of available uploaded files as JSON.
    Each item: { filename, url, mtime, has_pin }
    """
    # Enforce PIN if enabled: listing requires auth to see files in the UI
    if PIN_ENABLED and not session.get('authed'):
        return jsonify({'error': 'unauthorized'}), 401

    uploads = Path(app.config['UPLOAD_FOLDER'])
    items = []
    for p in uploads.iterdir():
        if p.is_file():
            items.append({
                'filename': p.name,
                'url': url_for('download_file', filename=p.name, _external=True),
                'mtime': p.stat().st_mtime,
                'size': p.stat().st_size,
                'type': p.suffix.lower().lstrip('.') if p.suffix else '',
                'has_pin': p.name in FILE_PINS,
            })
    # sort newest first
    items.sort(key=lambda x: x['mtime'], reverse=True)
    return jsonify(items)


# Simple PIN-based access control (optional)
PIN_ENABLED = os.environ.get('ACCESS_PIN') is not None
PIN_VALUE = os.environ.get('ACCESS_PIN')


@app.route('/auth/status', methods=['GET'])
def auth_status():
    return jsonify({'pin_required': PIN_ENABLED, 'authed': bool(session.get('authed'))})


@app.route('/auth', methods=['POST'])
def auth():
    if not PIN_ENABLED:
        return jsonify({'ok': True, 'authed': True})
    data = request.get_json() or {}
    pin = data.get('pin')
    if pin and PIN_VALUE and pin == PIN_VALUE:
        session['authed'] = True
        return jsonify({'ok': True, 'authed': True})
    return jsonify({'ok': False, 'authed': False}), 401


@app.route('/auth/logout', methods=['POST'])
def auth_logout():
    session.pop('authed', None)
    return jsonify({'ok': True})

@app.route('/upload', methods=['POST'])
@limiter.limit("10 per minute")
def upload_file():
    # expects form field named 'file' and optional 'pin' field
    # enforce auth when PIN is enabled
    if PIN_ENABLED and not session.get('authed'):
        logger.warning(f"Unauthorized upload attempt from {request.remote_addr}")
        return jsonify({'error': 'unauthorized'}), 401
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400
    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    
    # Get optional PIN from form data
    file_pin = request.form.get('pin', '').strip()
    
    if f and allowed_file(f.filename):
        filename = secure_filename(f.filename)
        # Limit filename length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
        saved_name = f"{timestamp}_{filename}"
        dest = Path(app.config['UPLOAD_FOLDER']) / saved_name
        try:
            f.save(dest)
            
            # Store PIN if provided
            if file_pin:
                FILE_PINS[saved_name] = file_pin
                logger.info(f"PIN set for file: {saved_name}")
            
            download_url = url_for('download_file', filename=saved_name, _external=True)
            logger.info(f"File uploaded successfully: {saved_name} ({dest.stat().st_size} bytes)")
            # notify via socketio (if clients connected)
            try:
                socketio.emit('file_uploaded', {
                    'filename': saved_name, 
                    'url': download_url, 
                    'size': dest.stat().st_size,
                    'has_pin': bool(file_pin)
                }, broadcast=True)
            except Exception as e:
                logger.error(f"Failed to emit file_uploaded event: {e}")
            return jsonify({
                'filename': saved_name, 
                'url': download_url,
                'has_pin': bool(file_pin)
            }), 201
        except Exception as e:
            logger.error(f"Upload failed for {filename}: {e}")
            return jsonify({'error': 'upload failed', 'detail': str(e)}), 500
    return jsonify({'error': 'file type not allowed'}), 400

@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    uploads = Path(app.config['UPLOAD_FOLDER'])
    # Security: ensure path is within uploads
    candidate = (uploads / filename).resolve()
    if not str(candidate).startswith(str(uploads.resolve())) or not candidate.exists():
        return jsonify({'error': 'file not found'}), 404
    
    # Check if file has PIN protection
    if filename in FILE_PINS:
        # Verify PIN from session or query parameter
        provided_pin = request.args.get('pin', '').strip()
        session_key = f'file_pin_{filename}'
        
        # Check if PIN was already verified in this session
        if not session.get(session_key):
            # Verify provided PIN
            if provided_pin != FILE_PINS[filename]:
                return jsonify({'error': 'invalid_pin', 'message': 'Invalid PIN'}), 403
            # Store verification in session
            session[session_key] = True
    
    return send_from_directory(directory=str(uploads), path=filename, as_attachment=True)


@app.route('/delete/<path:filename>', methods=['DELETE'])
@limiter.limit("20 per minute")
def delete_file(filename):
    """Delete an uploaded file from the uploads folder. Returns 200 on success.
    This endpoint enforces PIN auth if enabled.
    """
    # Enforce PIN if enabled
    if PIN_ENABLED and not session.get('authed'):
        logger.warning(f"Unauthorized delete attempt from {request.remote_addr}")
        return jsonify({'error': 'unauthorized'}), 401

    uploads = Path(app.config['UPLOAD_FOLDER'])
    candidate = (uploads / filename).resolve()
    if not str(candidate).startswith(str(uploads.resolve())) or not candidate.exists():
        return jsonify({'error': 'file not found'}), 404
    try:
        candidate.unlink()
        # Remove PIN if exists
        if filename in FILE_PINS:
            del FILE_PINS[filename]
        logger.info(f"File deleted: {filename}")
        try:
            socketio.emit('file_deleted', {'filename': filename}, broadcast=True)
        except Exception as e:
            logger.error(f"Failed to emit file_deleted event: {e}")
        return jsonify({'ok': True}), 200
    except Exception as e:
        logger.error(f"Delete failed for {filename}: {e}")
        return jsonify({'error': 'failed to delete', 'detail': str(e)}), 500



@app.route('/qr')
def qr():
    """Return a PNG QR code for the provided URL (query param `url`) or the server base URL by default."""
    target = request.args.get('url')
    if not target:
        # use host_url which usually contains scheme and host
        target = request.host_url
    try:
        buf = io.BytesIO()
        img = qrcode.make(target)
        img.save(buf, format='PNG')
        buf.seek(0)
        return send_file(buf, mimetype='image/png')
    except Exception:
        return jsonify({'error': 'failed to generate qr code'}), 500

def cleanup_worker():
    """Background thread to delete files older than FILE_TTL_SECONDS"""
    uploads = Path(app.config['UPLOAD_FOLDER'])
    while True:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=FILE_TTL_SECONDS)
        for p in uploads.iterdir():
            try:
                mtime = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc)
                if mtime < cutoff:
                    p.unlink()
                    # Remove PIN if exists
                    if p.name in FILE_PINS:
                        del FILE_PINS[p.name]
                    socketio.emit('file_deleted', {'filename': p.name})
            except Exception:
                # ignore errors for now (permissions, race conditions)
                pass
        time.sleep(CLEANUP_INTERVAL_SECONDS)

# start cleanup thread only if FILE_TTL_SECONDS is enabled (> 0)
if FILE_TTL_SECONDS and FILE_TTL_SECONDS > 0:
    cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
    cleanup_thread.start()

if __name__ == '__main__':
    # run with socketio so real-time features can be added later
    # eventlet is recommended for production/local LAN tests
    # allow_unsafe_werkzeug=True is intentional for local development/testing

    # Get LAN IP and port
    lan_ip = _detect_lan_ip()
    port = int(os.environ.get('PORT', 5000))
    
    # Display startup banner with shareable link
    print("\n" + "="*60)
    print("🚀 WifiX Server Started Successfully!")
    print("="*60)
    print("\n📡 Server is running on:")
    print(f"   Local:   http://127.0.0.1:{port}")
    print(f"   Network: http://{lan_ip}:{port}")
    print("\n🔗 Share this link with others:")
    print(f"   👉 http://{lan_ip}:{port}")
    print(f"\n📱 Scan QR code at: http://{lan_ip}:{port}/qr")
    print("\n💡 Instructions:")
    print("   1. Open the link above in your browser to become the HOST")
    print("   2. Share the link with others to let them connect as CLIENTS")
    print("   3. As HOST, you'll approve/deny incoming connections")
    print("\n" + "="*60 + "\n")

    # Optionally advertise via Zeroconf/mDNS on the LAN for auto-discovery
    zeroconf = None
    info = None
    if os.environ.get('ENABLE_ZEROCONF', '1') == '1':
        try:
            from zeroconf import ServiceInfo, Zeroconf
            svc_name = f"WifiX on {lan_ip}._wifi-share._tcp.local."  # visible name in mDNS browsers
            # simple text record
            desc = {'path': '/'}
            info = ServiceInfo(
                "_wifi-share._tcp.local.",
                svc_name,
                addresses=[socket.inet_aton(lan_ip)],
                port=port,
                properties=desc,
                server=(socket.gethostname() + '.local.')
            )
            zeroconf = Zeroconf()
            zeroconf.register_service(info)
            logger.info(f"Zeroconf: registered service {svc_name}")
        except Exception as e:
            logger.warning(f"Zeroconf registration failed: {e}")

    def _cleanup_zeroconf():
        try:
            if zeroconf and info:
                zeroconf.unregister_service(info)
                zeroconf.close()
                logger.info('Zeroconf: service unregistered')
        except Exception:
            pass

    atexit.register(_cleanup_zeroconf)

    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)

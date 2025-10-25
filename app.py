import os
import threading
import time
import io
import qrcode
import importlib.util
import pkgutil
from datetime import datetime, timedelta, timezone
from pathlib import Path
import socket
from urllib.parse import urlparse, urlunparse
from werkzeug.utils import secure_filename
from flask import Flask, request, redirect, url_for, send_from_directory, render_template, jsonify, send_file
import ssl as _ssl

# Backfill ssl.wrap_socket if missing (some stdlib shuffles in newer Pythons)
if not hasattr(_ssl, 'wrap_socket'):
    def _wrap_socket(sock, server_side=False, **kwargs):
        ctx = _ssl.create_default_context(purpose=_ssl.Purpose.SERVER_AUTH if not server_side else _ssl.Purpose.CLIENT_AUTH)
        return ctx.wrap_socket(sock, server_side=server_side, **kwargs)
    _ssl.wrap_socket = _wrap_socket

from flask_socketio import SocketIO

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
FILE_TTL_SECONDS = int(os.environ.get("FILE_TTL_SECONDS", 600))  # default 10 minutes
CLEANUP_INTERVAL_SECONDS = int(os.environ.get("CLEANUP_INTERVAL_SECONDS", 60))

app = Flask(__name__, template_folder="templates")
app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024 * 1024  # 1 GiB guard (adjust)

socketio = SocketIO(app, async_mode='threading')

def allowed_file(filename: str) -> bool:
    if ALLOWED_EXTENSIONS is None:
        return True
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Basic page with a small upload form for Phase 1"""
    return render_template('index.html')


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

@app.route('/upload', methods=['POST'])
def upload_file():
    # expects form field named 'file'
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400
    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    if f and allowed_file(f.filename):
        filename = secure_filename(f.filename)
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
        saved_name = f"{timestamp}_{filename}"
        dest = Path(app.config['UPLOAD_FOLDER']) / saved_name
        f.save(dest)
        download_url = url_for('download_file', filename=saved_name, _external=True)
        # notify via socketio (if clients connected)
        try:
            socketio.emit('file_uploaded', {'filename': saved_name, 'url': download_url})
        except Exception:
            pass
        return jsonify({'filename': saved_name, 'url': download_url}), 201
    return jsonify({'error': 'file type not allowed'}), 400

@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    uploads = Path(app.config['UPLOAD_FOLDER'])
    # Security: ensure path is within uploads
    candidate = (uploads / filename).resolve()
    if not str(candidate).startswith(str(uploads.resolve())) or not candidate.exists():
        return jsonify({'error': 'file not found'}), 404
    return send_from_directory(directory=str(uploads), path=filename, as_attachment=True)


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
                    socketio.emit('file_deleted', {'filename': p.name})
            except Exception:
                # ignore errors for now (permissions, race conditions)
                pass
        time.sleep(CLEANUP_INTERVAL_SECONDS)

# start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
cleanup_thread.start()

if __name__ == '__main__':
    # run with socketio so real-time features can be added later
    # eventlet is recommended for production/local LAN tests
    # allow_unsafe_werkzeug=True is intentional for local development/testing
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

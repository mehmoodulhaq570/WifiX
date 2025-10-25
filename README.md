# WifiX — Phase 1 (Flask backend)

This repository contains the Phase 1 scaffold for WifiX: a small Flask backend that accepts file uploads, stores them in a temporary directory, and exposes download links. A background cleanup thread deletes files older than a configurable TTL (default: 600 seconds).

Quick start (PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt
# then run
python app.py
```

Open http://localhost:5000/ in your browser and try uploading a file via the form.

Notes:

- Uploaded files are saved to `uploads/` and auto-deleted after the TTL.
- Next steps: add QR generation, zeroconf advertising, SocketIO features, and a React + Tailwind frontend.

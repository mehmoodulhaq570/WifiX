# Backend: Running & Notes

This file documents how to run and configure the backend (`backend/app.py`) and notes about the recent migration of the uploads folder.

## Run the backend (recommended)

1. Create & activate a Python virtual environment (PowerShell):

```powershell
cd D:\Projects\WifiX
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Run the backend:

```powershell
python backend/app.py
```

The server will start on `http://localhost:5000` by default.

## Important environment variables

- `ACCESS_PIN` - (optional) set to a PIN string to require PIN auth for uploads/downloads
- `CORS_ORIGINS` - comma-separated allowed frontend origins (default includes localhost:5173)
- `FILE_TTL_SECONDS` - seconds before a file is considered expired (0 = disabled)
- `CLEANUP_INTERVAL_SECONDS` - how often the cleanup worker runs
- `SECRET_KEY` - Flask session secret
- `ENABLE_ZEROCONF` - set to `0` to disable mDNS/zeroconf (optional)

## Uploads location and migration note

- The backend stores uploaded files under `backend/uploads/`.
- During the migration to put the server code in `backend/`, the original top-level `uploads/` directory was copied into `backend/uploads/` and the original directory was renamed to:

```
uploads_backup_20251111154617/
```

(If your workspace has a different timestamp, check the repo root for `uploads_backup_*`.)

Do NOT delete that backup folder until you have verified that all needed files are present in `backend/uploads/` and the application works as expected.

### Remove the backup (manual, optional)

If you confirm everything is okay and want to delete the backup (PowerShell):

```powershell
# remove backup directory (replace with exact name if different)
Remove-Item -LiteralPath .\uploads_backup_20251111154617 -Recurse -Force
```

## Troubleshooting

- If you see an import error for `zeroconf`, it's optional — install it with:

```powershell
pip install zeroconf
```

- If the server fails to start, check the Python terminal output for the missing dependency name and `pip install` that package inside the activated virtualenv.

## Notes

- I did not run the smoke test in your environment (you said not to); I can run it if you change your mind.
- If you want the backup removed, tell me and I'll either remove it or prepare a PR to delete it after confirming with you.

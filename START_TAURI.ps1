# WifiX Tauri Desktop App - Quick Start Script

Write-Host "🚀 Starting WifiX Tauri Desktop App..." -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust not found in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please restart your terminal for Rust to be available." -ForegroundColor Yellow
    Write-Host "Rust was just installed, but environment variables need to reload." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After restarting terminal, run this script again:" -ForegroundColor Cyan
    Write-Host "  .\START_TAURI.ps1" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or manually run:" -ForegroundColor Cyan
    Write-Host "  cd frontend\react" -ForegroundColor Green
    Write-Host "  npm run tauri:dev" -ForegroundColor Green
    pause
    exit 1
}

Write-Host "✅ Rust installed: $(cargo --version)" -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python installed: $(python --version)" -ForegroundColor Green

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js installed: $(node --version)" -ForegroundColor Green
Write-Host ""

# Navigate to frontend/react
Set-Location -Path "$PSScriptRoot\frontend\react"

Write-Host "📦 Installing dependencies (if needed)..." -ForegroundColor Yellow
npm install --silent

Write-Host ""
Write-Host "🎯 Starting Tauri development mode..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Start Vite dev server (React frontend)" -ForegroundColor Gray
Write-Host "  2. Start Python backend (Flask server)" -ForegroundColor Gray
Write-Host "  3. Open Tauri desktop window" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the app" -ForegroundColor Yellow
Write-Host ""

# Start Tauri
npm run tauri:dev

@echo off
REM Quick build script for WifiX documentation

echo 🚀 Building WifiX Documentation...
echo.

REM Check if sphinx is installed
sphinx-build --version >nul 2>&1
if errorlevel 1 (
    echo ❌ sphinx-build not found!
    echo 📦 Installing dependencies...
    pip install -r requirements.txt
)

REM Clean previous build
echo 🧹 Cleaning previous build...
make.bat clean

REM Build HTML documentation
echo 📚 Building HTML documentation...
make.bat html

REM Check if build succeeded
if errorlevel 0 (
    echo.
    echo ✅ Documentation built successfully!
    echo 📂 Output: _build\html\index.html
    echo.
    echo 🌐 To view locally:
    echo    Open: %CD%\_build\html\index.html
    echo.
    echo 📤 To publish to Read the Docs:
    echo    1. Commit and push to GitHub
    echo    2. Read the Docs will auto-build
    echo.
) else (
    echo.
    echo ❌ Build failed! Check errors above.
    exit /b 1
)

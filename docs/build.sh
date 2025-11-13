#!/bin/bash
# Quick build script for WifiX documentation

echo "🚀 Building WifiX Documentation..."
echo ""

# Check if sphinx is installed
if ! command -v sphinx-build &> /dev/null; then
    echo "❌ sphinx-build not found!"
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
make clean

# Build HTML documentation
echo "📚 Building HTML documentation..."
make html

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Documentation built successfully!"
    echo "📂 Output: _build/html/index.html"
    echo ""
    echo "🌐 To view locally:"
    echo "   Open: file://$(pwd)/_build/html/index.html"
    echo ""
    echo "📤 To publish to Read the Docs:"
    echo "   1. Commit and push to GitHub"
    echo "   2. Read the Docs will auto-build"
    echo ""
else
    echo ""
    echo "❌ Build failed! Check errors above."
    exit 1
fi

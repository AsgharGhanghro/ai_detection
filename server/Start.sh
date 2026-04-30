#!/bin/bash

echo ""
echo "============================================"
echo "TextGuard AI - Quick Start Script"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed or not in PATH"
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

echo "✅ Python found"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment exists"
fi

echo ""
echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo ""
echo "📥 Installing dependencies..."
pip install -q flask flask-cors python-dotenv requests
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

echo ""
echo "✅ Checking for .env file..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create a .env file with the following content:"
    echo ""
    echo "GOOGLE_CLIENT_ID=your-client-id"
    echo "GOOGLE_CLIENT_SECRET=your-client-secret"
    echo "FRONTEND_URL=http://localhost:3000"
    echo "BACKEND_URL=http://127.0.0.1:5000"
    echo "SECRET_KEY=your-secret-key"
    echo "ENVIRONMENT=development"
    echo ""
    exit 1
else
    echo "✅ .env file found"
fi

echo ""
echo "============================================"
echo "🚀 Starting TextGuard AI Backend"
echo "============================================"
echo ""
echo "📡 Backend running at: http://127.0.0.1:5000"
echo "🌐 Frontend should be at: http://localhost:3000"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

python3 app.py
@echo off
echo.
echo ============================================
echo TextGuard AI - Quick Start Script
echo ============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Python found
echo.

:: Check if venv exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment exists
)

echo.
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo 📥 Installing dependencies...
pip install -q flask flask-cors python-dotenv requests
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo ✅ Checking for .env file...
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo.
    echo Please create a .env file with the following content:
    echo.
    echo GOOGLE_CLIENT_ID=your-client-id
    echo GOOGLE_CLIENT_SECRET=your-client-secret
    echo FRONTEND_URL=http://localhost:3000
    echo BACKEND_URL=http://127.0.0.1:5000
    echo SECRET_KEY=your-secret-key
    echo ENVIRONMENT=development
    echo.
    pause
    exit /b 1
) else (
    echo ✅ .env file found
)

echo.
echo ============================================
echo 🚀 Starting TextGuard AI Backend
echo ============================================
echo.
echo 📡 Backend running at: http://127.0.0.1:5000
echo 🌐 Frontend should be at: http://localhost:3000
echo.
echo Press CTRL+C to stop the server
echo.

python app.py
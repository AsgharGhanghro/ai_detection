@echo off
echo ========================================
echo TextGuard AI Server Startup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo [1/4] Checking Python installation...
python --version

REM Check if virtual environment exists
if not exist "venv" (
    echo.
    echo [2/4] Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
) else (
    echo.
    echo [2/4] Virtual environment already exists
)

REM Activate virtual environment
echo.
echo [3/4] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/Update dependencies
echo.
echo [4/4] Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check requirements.txt and your internet connection
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Flask Server...
echo ========================================
echo.
echo Server will be available at:
echo   http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the Flask application
python app.py

REM Deactivate virtual environment on exit
deactivate


@echo off
echo ========================================
echo WINDOWS LOCALHOST FIX
echo ========================================
echo.

REM Create a custom hosts entry
echo 127.100.100.100    mydev.local >> C:\Windows\System32\drivers\etc\hosts

REM Start Python server
python -m http.server 5000 --bind 127.100.100.100 --directory .

echo.
echo ========================================
echo OPEN: http://127.100.100.100:5000
echo ========================================
echo.
pause

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
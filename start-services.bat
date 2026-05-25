@echo off
REM Drishya Full Stack Startup Script (Windows)
REM Run both backend and AI service

cls
echo.
echo ===============================================
echo   Drishya Full Stack Startup (Windows)
echo ===============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.9+
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo Python found:
python --version
echo.

echo Starting Node.js Backend...
start cmd /k "npm run dev"
echo.
timeout /t 3 /nobreak

echo Starting FastAPI AI Service...
cd ai-service

if exist venv (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo Virtual environment not found. Creating...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
)

echo.
start cmd /k "python main.py"

cd ..

echo.
echo ===============================================
echo   Drishya Full Stack is Running!
echo ===============================================
echo.
echo Backend Service:
echo   URL: http://localhost:8000
echo   Endpoints: /api/v1/*
echo.
echo AI Service:
echo   URL: http://localhost:8001
echo   Docs: http://localhost:8001/api/docs
echo   Endpoints: /api/v1/generate/*
echo.
echo Press any key to close this window...
pause

@echo off
echo 🚀 Starting Photo Equalizer Application...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

echo ✅ Python and Node.js found!

REM Start backend
echo 🔧 Starting Backend Server...
cd backend
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
echo 🚀 Starting FastAPI server on http://localhost:8000
start "Backend Server" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting Frontend Server...
cd frontend
echo 📦 Installing Node.js dependencies...
npm install
echo 🚀 Starting Next.js server on http://localhost:3000
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 Photo Equalizer is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo ⏳ Please wait for both servers to fully start...
echo 🛑 Close the terminal windows to stop the servers
echo.
pause

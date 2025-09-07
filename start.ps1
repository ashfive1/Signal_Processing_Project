# Photo Equalizer Startup Script
# This script starts both the frontend and backend servers

Write-Host "🚀 Starting Photo Equalizer Application..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}

# Function to start backend
function Start-Backend {
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
    Set-Location backend
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "🚀 Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
    Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -WindowStyle Normal
    Set-Location ..
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
    Set-Location frontend
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "🚀 Starting Next.js server on http://localhost:3000" -ForegroundColor Green
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
    Set-Location ..
}

# Start both servers
Start-Backend
Start-Sleep -Seconds 3
Start-Frontend

Write-Host ""
Write-Host "🎉 Photo Equalizer is starting up!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Please wait for both servers to fully start..." -ForegroundColor Yellow
Write-Host "🛑 Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
Write-Host ""

# Keep script running
Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
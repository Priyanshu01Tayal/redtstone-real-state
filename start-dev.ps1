# RedStone Platform Powershell Launcher
Write-Host "========================================================" -ForegroundColor Red
Write-Host "  STARTING REDSTONE REAL ESTATE BROKERAGE PLATFORM" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Red

# 1. Start MongoDB
Write-Host "[1/3] Starting MongoDB Daemon..." -ForegroundColor Yellow
Start-Process "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath `"$PSScriptRoot\backend\data\db`" --port 27017 --bind_ip 127.0.0.1" -WindowStyle Minimized
Start-Sleep -Seconds 3

# 2. Start Backend
Write-Host "[2/3] Starting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\backend`"; npm start"

# 3. Start Frontend
Write-Host "[3/3] Starting Frontend Dev Server..." -ForegroundColor Yellow
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\frontend`"; npm run dev"

Write-Host "`nAll platform services launched!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Health: http://localhost:5000/api/health" -ForegroundColor Cyan

@echo off
echo ========================================================
echo   STARTING REDSTONE REAL ESTATE BROKERAGE PLATFORM
echo ========================================================
echo.

echo 1. Starting MongoDB Daemon...
start "RedStone MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%~dp0backend\data\db" --port 27017 --bind_ip 127.0.0.1
timeout /t 3 /nobreak >nul

echo 2. Starting Backend Server on port 5000...
start "RedStone Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 3 /nobreak >nul

echo 3. Starting Frontend Server (Vite)...
start "RedStone Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo   PLATFORM SERVICES RUNNING!
echo   Frontend: http://localhost:5173 (or 5174)
echo   Backend:  http://localhost:5000/api/health
echo ========================================================
pause

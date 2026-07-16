@echo off
cd /d "%~dp0"

echo Starting Interview Prep Tracker...
echo PocketBase + Vite will start. Press Ctrl+C to stop.
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

call npm run dev:app

pause

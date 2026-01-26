@echo off
echo ===================================================
echo   DISTORTION CORP // SECURE TERMINAL LAUNCHER
echo ===================================================
echo.
echo   [!] initializing local server environment...
echo   [!] bypassing CORS strictions for file:// protocol...
echo.

:: Check if npx is available
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo   [ERROR] Node.js is not installed or not in PATH.
    echo   Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit
)

echo   [SUCCESS] Node.js detected. Starting Server on port 8083...
echo   The browser will open automatically.
echo.
echo   [NOTE] Keep this window open while using the site!
echo.

:: Start http-server and open browser
start "" "http://localhost:8083/index.html"
call npx http-server . -p 8083 -c-1 --silent

pause

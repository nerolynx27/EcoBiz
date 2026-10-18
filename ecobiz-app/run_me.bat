@echo off
setlocal
title EcoBiz
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js is required. Install Node.js, then run this file again.
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo npm is required. Reinstall Node.js, then run this file again.
    pause
    exit /b 1
)

echo LAN addresses for other devices on the same network:
powershell -NoProfile -Command "Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } | ForEach-Object { foreach ($address in $_.IPv4Address) { Write-Host ('  http://' + $address.IPAddress + ':3001') } }"
echo.
rem Reuse the server when EcoBiz is already running.
powershell -NoProfile -Command "try { $response = Invoke-WebRequest 'http://127.0.0.1:3001' -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -eq 200 -and $response.Content -match 'EcoBiz') { exit 0 } } catch {}; exit 1" >nul 2>&1
if not errorlevel 1 (
    start "" "http://127.0.0.1:3001"
    exit /b 0
)

if not exist "node_modules\next\dist\bin\next" (
    echo Installing EcoBiz dependencies...
    call npm ci
    if errorlevel 1 goto failed
)
if not exist ".next\BUILD_ID" (
    echo Building EcoBiz...
    call npm run build
    if errorlevel 1 goto failed
)

echo Starting EcoBiz at http://127.0.0.1:3001
echo Keep this window open while using EcoBiz. Press Ctrl+C to stop.
rem Open the browser once the server is ready, for up to 60 seconds.
start "" /b powershell -NoProfile -Command "for ($attempt = 0; $attempt -lt 30; $attempt++) { try { $response = Invoke-WebRequest 'http://127.0.0.1:3001' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200 -and $response.Content -match 'EcoBiz') { Start-Process 'http://127.0.0.1:3001'; exit } } catch {}; Start-Sleep -Seconds 2 }" >nul 2>&1
call npm run start -- --port 3001
if errorlevel 1 goto failed
exit /b 0

:failed
echo.
echo EcoBiz could not start. See the error above.
pause
exit /b 1

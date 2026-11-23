@echo off
setlocal
cd /d "%~dp0"
echo ==========================================================
echo       EduPulse ERP Desktop Edition Setup Launcher         
echo ==========================================================
echo Starting installation...

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-EduPulse.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation encountered an error.
    pause
)
endlocal

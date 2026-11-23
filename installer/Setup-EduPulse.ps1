# ==============================================================================
# EduPulse ERP Desktop Edition - Zero-Prerequisite Setup Wizard
# ==============================================================================
param (
    [string]$InstallPath = "$env:LOCALAPPDATA\EduPulseERP",
    [switch]$Silent = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         EduPulse ERP Desktop Edition Setup Wizard         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$SourceDir = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$SourceDir\EduPulse-ERP-Desktop-v2.exe")) {
    $SourceDir = $PSScriptRoot
}

Write-Host "[1/5] Verifying installation payload in: $SourceDir" -ForegroundColor Yellow

$ExePath = Join-Path $SourceDir "EduPulse-ERP-Desktop-v2.exe"
$BackendDir = Join-Path $SourceDir "backend"
$JreDir = Join-Path $SourceDir "jre"

if (-not (Test-Path $ExePath)) {
    Write-Error "Could not find EduPulse-ERP-Desktop-v2.exe in $SourceDir"
    exit 1
}

if (-not (Test-Path "$BackendDir\institutional-erp-backend.jar")) {
    Write-Error "Could not find backend JAR in $BackendDir"
    exit 1
}

if (-not (Test-Path "$JreDir\bin\java.exe")) {
    Write-Error "Could not find bundled JRE runtime in $JreDir"
    exit 1
}

Write-Host "[OK] All components found: Desktop Shell, Backend JAR, Bundled JRE 21 LTS." -ForegroundColor Green
Write-Host ""
Write-Host "[2/5] Target installation directory: $InstallPath" -ForegroundColor Yellow

if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
}

Write-Host "[3/5] Installing application files..." -ForegroundColor Yellow

# Copy Desktop Executable
Copy-Item -Force $ExePath (Join-Path $InstallPath "EduPulse-ERP-Desktop-v2.exe")

# Copy Backend
$TargetBackend = Join-Path $InstallPath "backend"
if (-not (Test-Path $TargetBackend)) {
    New-Item -ItemType Directory -Force -Path $TargetBackend | Out-Null
}
Copy-Item -Recurse -Force "$BackendDir\*" $TargetBackend

# Copy Bundled JRE
$TargetJre = Join-Path $InstallPath "jre"
if (-not (Test-Path $TargetJre)) {
    New-Item -ItemType Directory -Force -Path $TargetJre | Out-Null
}
Copy-Item -Recurse -Force "$JreDir\*" $TargetJre

# Copy Icon if present
$IconPath = Join-Path $SourceDir "src-tauri\icons\icon.ico"
$TargetIcon = Join-Path $InstallPath "icon.ico"
if (Test-Path $IconPath) {
    Copy-Item -Force $IconPath $TargetIcon
} else {
    $TargetIcon = Join-Path $InstallPath "EduPulse-ERP-Desktop-v2.exe"
}

Write-Host "[OK] Application files successfully installed." -ForegroundColor Green
Write-Host ""
Write-Host "[4/5] Creating Windows Desktop and Start Menu shortcuts..." -ForegroundColor Yellow

$WScriptShell = New-Object -ComObject WScript.Shell

# Desktop Shortcut
$DesktopShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "EduPulse ERP.lnk"
$Shortcut = $WScriptShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = Join-Path $InstallPath "EduPulse-ERP-Desktop-v2.exe"
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.Description = "EduPulse ERP Windows Desktop Edition"
if (Test-Path $TargetIcon) {
    $Shortcut.IconLocation = "$TargetIcon, 0"
}
$Shortcut.Save()

# Start Menu Group
$StartMenuPath = Join-Path ([Environment]::GetFolderPath("Programs")) "EduPulse ERP"
if (-not (Test-Path $StartMenuPath)) {
    New-Item -ItemType Directory -Force -Path $StartMenuPath | Out-Null
}
$StartMenuShortcutPath = Join-Path $StartMenuPath "EduPulse ERP.lnk"
$SMShortcut = $WScriptShell.CreateShortcut($StartMenuShortcutPath)
$SMShortcut.TargetPath = Join-Path $InstallPath "EduPulse-ERP-Desktop-v2.exe"
$SMShortcut.WorkingDirectory = $InstallPath
$SMShortcut.Description = "EduPulse ERP Windows Desktop Edition"
if (Test-Path $TargetIcon) {
    $SMShortcut.IconLocation = "$TargetIcon, 0"
}
$SMShortcut.Save()

# Create Uninstaller Script
$UninstallScript = @"
@echo off
echo Uninstalling EduPulse ERP...
del "$DesktopShortcutPath" 2>nul
rmdir /s /q "$StartMenuPath" 2>nul
rmdir /s /q "$InstallPath" 2>nul
echo EduPulse ERP has been uninstalled successfully.
pause
"@
Set-Content -Path (Join-Path $InstallPath "Uninstall.bat") -Value $UninstallScript

Write-Host "[OK] Shortcuts registered on Desktop and Start Menu." -ForegroundColor Green
Write-Host ""
Write-Host "[5/5] Installation Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " EduPulse ERP is now installed at: $InstallPath" -ForegroundColor White
Write-Host " Zero external dependencies needed: Java 21 LTS is bundled." -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $Silent) {
    $launch = Read-Host "Would you like to launch EduPulse ERP now? (Y/n)"
    if ($launch -ne 'n' -and $launch -ne 'N') {
        Start-Process (Join-Path $InstallPath "EduPulse-ERP-Desktop-v2.exe") -WorkingDirectory $InstallPath
    }
}

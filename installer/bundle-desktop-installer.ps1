# ==============================================================================
# EduPulse ERP Desktop Edition - Master Release Packaging Pipeline
# ==============================================================================
param (
    [switch]$SkipCargo = $false,
    [switch]$SkipZip = $false
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      EduPulse ERP Desktop Release Packaging Pipeline      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Root Directory: $RootDir" -ForegroundColor White
Write-Host ""

# 1. Verify / Generate Minimal JRE 21 via jlink
Write-Host "[1/6] Verifying Bundled Java Runtime..." -ForegroundColor Yellow
$JrePath = Join-Path $RootDir "jre"
if (-not (Test-Path "$JrePath\bin\java.exe")) {
    Write-Host "  Bundled JRE not found. Generating via jlink..." -ForegroundColor Yellow
    $JlinkArgs = @(
        "--add-modules", "java.se,jdk.unsupported,jdk.crypto.ec,jdk.localedata,jdk.zipfs",
        "--strip-debug",
        "--no-man-pages",
        "--no-header-files",
        "--compress=zip-6",
        "--output", $JrePath
    )
    Start-Process -FilePath "jlink" -ArgumentList $JlinkArgs -NoNewWindow -Wait
    if (-not (Test-Path "$JrePath\bin\java.exe")) {
        Write-Error "Failed to generate bundled JRE via jlink."
        exit 1
    }
}
$JreSize = (Get-ChildItem -Recurse $JrePath | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  [OK] Bundled JRE verified ($([Math]::Round($JreSize, 2)) MB)." -ForegroundColor Green

# 2. Verify Backend JAR
Write-Host "[2/6] Verifying Backend Service JAR..." -ForegroundColor Yellow
$BackendJar = Join-Path $RootDir "backend\institutional-erp-backend.jar"
if (-not (Test-Path $BackendJar)) {
    Write-Error "Backend JAR not found at: $BackendJar"
    exit 1
}
$JarSize = (Get-Item $BackendJar).Length / 1MB
Write-Host "  [OK] Backend JAR verified ($([Math]::Round($JarSize, 2)) MB)." -ForegroundColor Green

# 3. Build Tauri Desktop Release
Write-Host "[3/6] Building Tauri Native Desktop Executable..." -ForegroundColor Yellow
if (-not $SkipCargo) {
    Set-Location (Join-Path $RootDir "src-tauri")
    cargo build --release
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Cargo release build failed."
        exit 1
    }
    Set-Location $RootDir
}
$CargoOutExe = Join-Path $RootDir "src-tauri\target\release\edupulse-desktop.exe"
if (-not (Test-Path $CargoOutExe)) {
    Write-Error "Release executable not found at: $CargoOutExe"
    exit 1
}
Copy-Item -Force $CargoOutExe (Join-Path $RootDir "EduPulse-ERP-Desktop-v2.exe")
Write-Host "  [OK] Desktop executable updated: EduPulse-ERP-Desktop-v2.exe" -ForegroundColor Green

# 4. Prepare Staging Directory
Write-Host "[4/6] Assembling Staging Release Tree..." -ForegroundColor Yellow
$DistInstaller = Join-Path $RootDir "dist-installer"
if (-not (Test-Path $DistInstaller)) {
    New-Item -ItemType Directory -Force -Path $DistInstaller | Out-Null
}

$StageDir = Join-Path $DistInstaller "EduPulse-ERP-v2.1.0-Windows-x64"
if (Test-Path $StageDir) {
    Remove-Item -Recurse -Force $StageDir
}
New-Item -ItemType Directory -Force -Path $StageDir | Out-Null

Copy-Item -Force (Join-Path $RootDir "EduPulse-ERP-Desktop-v2.exe") (Join-Path $StageDir "EduPulse-ERP-Desktop-v2.exe")
Copy-Item -Recurse -Force (Join-Path $RootDir "backend") (Join-Path $StageDir "backend")
Copy-Item -Recurse -Force (Join-Path $RootDir "jre") (Join-Path $StageDir "jre")
Copy-Item -Force (Join-Path $RootDir "installer\Setup-EduPulse.bat") (Join-Path $StageDir "Setup-EduPulse.bat")
Copy-Item -Force (Join-Path $RootDir "installer\Setup-EduPulse.ps1") (Join-Path $StageDir "Setup-EduPulse.ps1")
Copy-Item -Force (Join-Path $RootDir "start-desktop.bat") (Join-Path $StageDir "start-desktop.bat")

$ReadmeContent = @"
======================================================================
 EduPulse ERP Desktop Edition - Version 2.1.0 (Windows x64)
======================================================================

ZERO-DEPENDENCY DEPLOYMENT:
This package bundles its own high-performance, modular Java 21 LTS
runtime. You do NOT need to install Java, set JAVA_HOME, or configure
environment variables.

HOW TO INSTALL:
1. Double-click "Setup-EduPulse.bat"
2. The setup wizard will install EduPulse ERP to your user profile
   and create shortcuts on your Desktop and Start Menu.

HOW TO RUN PORTABLY (WITHOUT INSTALLING):
1. Double-click "EduPulse-ERP-Desktop-v2.exe"
2. The native shell will automatically boot the backend sidecar and
   present the institutional ERP dashboard.

SUPPORT & DOCUMENTATION:
Website: https://edupulse.cloud
Docs: https://github.com/CodeTillEternity/Edupulse_ERP_desktop_v1.0
======================================================================
"@
Set-Content -Path (Join-Path $StageDir "README.txt") -Value $ReadmeContent

Write-Host "  [OK] Staging directory assembled at: $StageDir" -ForegroundColor Green

# 5. Check for NSIS Compiler and Build Setup Executable
Write-Host "[5/6] Checking NSIS Compiler..." -ForegroundColor Yellow
$NsisCandidates = @(
    "makensis.exe",
    "$env:ProgramFiles\NSIS\makensis.exe",
    "${env:ProgramFiles(x86)}\NSIS\makensis.exe",
    "$env:LOCALAPPDATA\Programs\NSIS\makensis.exe"
)
$NsisExe = $null
foreach ($cand in $NsisCandidates) {
    if (Get-Command $cand -ErrorAction SilentlyContinue) {
        $NsisExe = $cand
        break
    }
    if (Test-Path $cand) {
        $NsisExe = $cand
        break
    }
}

if ($NsisExe) {
    Write-Host "  Compiling NSIS Single-Click Installer with: $NsisExe..." -ForegroundColor Yellow
    $NsiScript = Join-Path $RootDir "installer\edupulse_installer.nsi"
    Start-Process -FilePath $NsisExe -ArgumentList @("/V2", $NsiScript) -NoNewWindow -Wait
    $NsisOutput = Join-Path $DistInstaller "EduPulse_Setup_v2.1.0.exe"
    if (Test-Path $NsisOutput) {
        $NsisSize = (Get-Item $NsisOutput).Length / 1MB
        Write-Host "  [SUCCESS] NSIS Installer generated: $NsisOutput ($([Math]::Round($NsisSize, 2)) MB)" -ForegroundColor Green
    }
} else {
    Write-Host "  [NOTE] NSIS (makensis.exe) not found on host. Pre-configured script is ready at installer\edupulse_installer.nsi for CI/CD." -ForegroundColor Cyan
}

# 6. Create Distribution Archive (ZIP)
Write-Host "[6/6] Generating Portable Zero-Dependency Archive..." -ForegroundColor Yellow
if (-not $SkipZip) {
    $ZipPath = Join-Path $DistInstaller "EduPulse-ERP-Desktop-v2.1.0-Windows-x64.zip"
    if (Test-Path $ZipPath) {
        Remove-Item -Force $ZipPath
    }
    Compress-Archive -Path "$StageDir\*" -DestinationPath $ZipPath -CompressionLevel Optimal
    $ZipSize = (Get-Item $ZipPath).Length / 1MB
    Write-Host "  [SUCCESS] Portable Zero-Dependency Archive created: $ZipPath ($([Math]::Round($ZipSize, 2)) MB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         RELEASE PACKAGING COMPLETED SUCCESSFULLY          " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Output Directory: $DistInstaller" -ForegroundColor White
Write-Host " Ready for distribution to colleges and enterprise staff!" -ForegroundColor White

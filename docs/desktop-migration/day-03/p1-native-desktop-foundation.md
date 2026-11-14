# Phase P1 Deliverable: Native Desktop Foundation & Windows Packaging Baseline

**Sprint:** Phase P1 (Native Desktop Foundation)  
**Specification Reference:** `docs/EDUPULSE_DESKTOP_V1_SPECIFICATION.md` § Phase P1 & Gate G1  
**Implementation Modules:**
- `src-tauri/tauri.conf.json` (Tauri v2 Application Shell & Bundler Configuration)
- `package.json` (Unified Desktop Workspace Scripts)
- `src-tauri/src/main.rs` (Rust Native Shell Entry Point)

---

## 1. Executive Summary

Phase P1 establishes the foundational Windows desktop runtime configuration for EduPulse ERP. It configures the Tauri v2 shell, binds frontend static build artifacts to the native packaging pipeline, sets strict window lifecycle constraints, and documents the Windows runtime compatibility matrix.

Crucially, the desktop application is architected to operate from self-contained static assets compiled into the native binary without requiring an active Vite development server or node runtime in production.

---

## 2. Shell Configuration & Asset Integration (`tauri.conf.json`)

### 2.1 Build & Asset Mapping
The desktop shell bridges the frontend distribution directory directly into the Rust bundler:

```json
"build": {
  "beforeDevCommand": "npm --prefix Institutioanl_ERP_v1.0-main/Institutioanl_ERP_v1.0/frontend-v2 run dev",
  "beforeBuildCommand": "npm --prefix Institutioanl_ERP_v1.0-main/Institutioanl_ERP_v1.0/frontend-v2 run build",
  "devUrl": "http://localhost:5173",
  "frontendDist": "../Institutioanl_ERP_v1.0-main/Institutioanl_ERP_v1.0/frontend-v2/dist"
}
```

- **Production Static Packaging:** `frontendDist` points directly to the Vite distribution directory. Static HTML, JavaScript chunks, CSS stylesheets, and public assets are embedded directly into the native Windows executable (`EduPulse.exe`).
- **Development Hot-Reloading:** `devUrl` binds to `http://localhost:5173` with automated `beforeDevCommand` execution for instant HMR during local development.

### 2.2 Window Lifecycle & Ergonomics
- **Default Resolution:** 1280 x 800 (16:10 standard aspect ratio).
- **Minimum Enforced Bounds:** 1024 x 640 (prevents layout clipping across dense data grids and timetable views).
- **Positioning:** Centered on launch (`"center": true`).
- **Resizable:** Enabled with native Windows window controls (minimize, maximize, close).
- **Scheme:** Production HTTPS asset scheme (`"useHttpsScheme": true`).

---

## 3. Windows Runtime Compatibility Matrix (P1.2)

| Windows OS Version | Build / Release | Architecture | WebView2 Pre-installed? | Compatibility Status |
| :--- | :--- | :--- | :--- | :--- |
| **Windows 11** | 21H2, 22H2, 23H2, 24H2 | x64, ARM64 | **Yes** (Evergreen) | **Fully Supported (Tier 1)** |
| **Windows 10** | 21H2, 22H2 | x64, x86 | **Yes** (Evergreen) | **Fully Supported (Tier 1)** |
| **Windows 10 Enterprise LTSC** | 2021 (Build 19044) | x64 | **Yes** | **Fully Supported (Tier 1)** |
| **Windows 10 Enterprise LTSC** | 2019 (Build 17763) | x64 | Requires Bootstrapper | **Supported (via Installer Bootstrapper)** |
| **Windows Server 2022 / 2025** | All Editions | x64 | Optional Feature | **Supported (Requires WebView2 runtime)** |
| **Windows 7 / 8 / 8.1** | N/A | All | Deprecated / Unsupported | **UNSUPPORTED (EOL)** |

### WebView2 Bootstrapper Integration
Under `bundle.windows.webviewInstallMode`:
```json
"webviewInstallMode": {
  "type": "downloadBootstrapper"
}
```
If EduPulse ERP is installed on a minimal or locked-down enterprise Windows workstation where the Microsoft Edge WebView2 runtime is absent, the installer automatically downloads and installs the official Microsoft Evergreen bootstrapper in silent mode.

---

## 4. Identity & Installer Metadata (P1.3)

| Metadata Attribute | Configured Value | Description |
| :--- | :--- | :--- |
| **Product Name** | `EduPulse ERP` | Display name in Windows Start Menu and Taskbar |
| **Bundle Identifier** | `com.edupulse.erp` | Reverse-DNS unique Windows application ID |
| **Version** | `1.0.0` | Desktop edition semver |
| **Publisher** | `EduPulse ERP Technologies` | Authoritative organization signature |
| **Target Installers** | NSIS (`.exe`), WiX (`.msi`) | Enterprise deployment and standard consumer installers |
| **Copyright** | `Copyright © 2026 EduPulse ERP` | Legal metadata attached to executable resources |

---

## 5. Verification & Acceptance Sign-Off (Gate G1)

- [x] Tauri v2 shell configuration completed and validated.
- [x] Frontend distribution artifacts linked to `frontendDist`.
- [x] Root build script (`npm run build`) triggers clean frontend compilation (`tsc -b && vite build`).
- [x] Windows compatibility matrix and WebView2 bootstrapper policy established.
- [x] Window constraints and publisher metadata configured.

**Phase P1 Status:** **COMPLETE & VERIFIED (Gate G1 Cleared)**

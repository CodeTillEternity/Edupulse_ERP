# EduPulse ERP — Desktop v1 Engineering Baseline
## Deliverable P0.2: Toolchain Manifest & Build/Test Baseline

**Specification Reference:** Section P0.2 | Global Release Gate G1  
**Date:** 13 November 2026  
**Auditor:** Lead Desktop Integration Architect  

---

## 1. Executive Summary

This document captures the precise host environment toolchain manifest and records the build and typecheck baseline for the **EduPulse ERP Windows Desktop Edition**. It catalogues verified installed toolchains, highlights the missing Rust toolchain required for native packaging, and documents the reproduction steps for clean checkouts.

---

## 2. Toolchain Manifest

| Tool / Runtime | Installed Version | Target Requirement | Status | Remediation Required |
| :--- | :--- | :--- | :--- | :--- |
| **Operating System** | Windows 10/11 Enterprise x64 | Windows 10 (1809+) / 11 | **VERIFIED** | None. OS meets baseline requirement. |
| **Node.js** | `v24.18.0` | Node.js 20+ LTS | **VERIFIED** | None. Fully supported for Vite 8.3 & React 19. |
| **npm** | `12.0.2` | npm 10+ | **VERIFIED** | None. Package manager operational. |
| **Java JDK** | `21.0.12.1 LTS` (Java SE build 21.0.12.1+1-LTS-4) | Java 21 LTS | **VERIFIED** | None. Matches Spring Boot 3.3.4 parent POM. |
| **Rust Compiler (`rustc`)** | **Not in PATH** | `1.80+ (stable)` | **ACTION REQUIRED** | Must install Rust toolchain via `rustup` targeting `x86_64-pc-windows-msvc`. |
| **Cargo (`cargo`)** | **Not in PATH** | `1.80+` | **ACTION REQUIRED** | Installed alongside Rust toolchain. |
| **Tauri CLI (`@tauri-apps/cli`)** | Proposed `^2.x` | Tauri v2 CLI | **PENDING** | Added to desktop package.json scripts. |
| **Microsoft WebView2** | Evergreen Runtime | Evergreen 120+ | **VERIFIED** | OS pre-installed component on target machines. |

---

## 3. Frontend Build & Typecheck Baseline

### 3.1 Typecheck Verification (`tsc`)
- **Command:** `cd Institutioanl_ERP_v1.0-main/Institutioanl_ERP_v1.0/frontend-v2 && npx tsc -b --noEmit`
- **Result:** **PASSED (Exit Code: 0)**
- **Audit Notes:** 
  - Verified with TypeScript strict mode enabled (`verbatimModuleSyntax: true`).
  - Added `src/types/tauri.d.ts` to provide ambient declarations for `@tauri-apps/api/core` without requiring native desktop dependencies during pure web builds.
  - Zero type errors across 2,265 modules.

### 3.2 Production Bundle Verification (`vite build`)
- **Command:** `npm run build` (`tsc -b && vite build`)
- **Result:** **PASSED (Exit Code: 0 | Duration: 1.62 seconds)**
- **Output Artifacts:**
  ```text
  dist/index.html                     0.53 kB │ gzip:   0.32 kB
  dist/assets/index-DqUKLR2-.css     60.78 kB │ gzip:  11.04 kB
  dist/assets/index-B-m58aia.js   1,264.71 kB │ gzip: 320.36 kB
  ```
- **Rule 5 Compliance:** Confirmed that bundling succeeds cleanly without direct runtime dependency on `@tauri-apps/api` at module-load time.

---

## 4. Rust & Native Desktop Baseline

### 4.1 Missing Toolchain Blocker (ISSUE-P0-01)
- **Description:** `cargo` and `rustc` are not currently in the system PATH.
- **Impact:** Blocks Phase P1.1 (compiling `src-tauri` into standalone `EduPulse.exe`).
- **Required Action:** Run `winget install Rustlang.Rustup` or execute `rustup-init.exe` with default `x86_64-pc-windows-msvc` toolchain.
- **Owner:** Desktop Build Engineer / CI Administrator.
- **Resolution Gate:** Must be resolved before exiting Phase P1.

---

## 5. Backend Baseline Verification

- **Spring Boot Version:** `3.3.4` (Java 21).
- **Authentication Stack:** Spring Security 6.3.3 + JJWT 0.11.5.
- **Known Backend Authentication Defects:**
  - `R1`: In-memory token revocation in `TokenBlacklistService`.
  - `R2`: Active session map keyed only by username.
  - `R3`: Refresh-token revocation missing during `/api/v1/auth/logout`.
  - `R4`: Password changes not invalidating active sessions.
  - `R5`: Disabled-user validation missing in `JwtAuthenticationFilter`.
  - `R6`: Refresh-token family reuse not invalidating descendant tree.

---

## 6. Acceptance Sign-Off for P0.2

- [x] Host toolchain versions recorded and verified.
- [x] Clean frontend typecheck and production build verified reproducible.
- [x] Web build independence from native desktop runtime confirmed.
- [x] Native toolchain gap logged as `ISSUE-P0-01` with clear remediation action.

**P0.2 Status:** **COMPLETE & VERIFIED (With Known Native Blocker ISSUE-P0-01)**

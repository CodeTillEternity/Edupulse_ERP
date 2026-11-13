# EduPulse ERP — Desktop v1 Engineering Baseline
## Deliverable P0.1: Repository and Git Safety Report

**Specification Reference:** Section P0.1 | Global Release Gate G1  
**Date:** 13 November 2026  
**Auditor:** Lead Desktop Integration Architect  

---

## 1. Executive Summary

This document establishes the official repository and version control baseline for the **EduPulse ERP Windows Desktop Edition**. It inventories all repository boundaries, maps tracking relationships, verifies recent commits (including the sprint Commits 51–53), audits untracked and modified artifacts, and confirms zero secret leakage.

---

## 2. Repository Inventory & Boundaries

The project workspace consists of a parent desktop migration repository containing a nested reference bundle of the original SaaS web and backend services:

```text
C:\Users\digit\Desktop\Edupulse_ERP_desktop_v1.0-main\ (PARENT REPOSITORY)
├── .git/                                            (Authoritative Git Root)
├── .gitignore                                       (Enforces boundary isolation)
├── README.md
├── docs/                                            (Architecture and migration specs)
│   ├── EDUPULSE_DESKTOP_V1_SPECIFICATION.md        (Master 14-phase engineering spec)
│   ├── desktop-migration/
│   │   ├── day-01/                                  (Reconnaissance reports)
│   │   ├── day-02/                                  (WP01–WP10 architecture blueprints)
│   │   └── day-03/                                  (Phase P0 baseline reports)
│   └── week_00_docs/                                (Daily journal logs)
├── src-tauri/                                       (Tauri v2 Rust desktop shell)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       └── auth.rs
├── src/                                             (Desktop frontend code)
│   ├── api/
│   │   └── axiosClient.ts
│   └── pages/
│       └── Login.tsx
└── Institutioanl_ERP_v1.0-main/                     (IGNORED VIA .gitignore)
    └── Institutioanl_ERP_v1.0/
        ├── .git/                                    (Separate nested Git repository)
        ├── backend/                                 (Authoritative Spring Boot 3.3.4 service)
        └── frontend-v2/                             (Authoritative React 19.2 web application)
```

### Boundary Isolation Verification
1. **Parent Repository Tracking:** The parent repository (`Edupulse_ERP_desktop_v1.0-main`) tracks desktop-specific native code (`src-tauri/`), desktop adaptation adapters (`src/`), and documentation (`docs/`).
2. **Ignored Reference Bundle:** `.gitignore` explicitly ignores `Institutioanl_ERP_v1.0-main/` and `Institutioanl_ERP_v1.0/`. No commit in the parent repository touches or modifies the nested Git history.
3. **Remote Configuration:**
   - **Remote Name:** `origin`
   - **Fetch/Push URL:** `https://github.com/CodeTillEternity/Edupulse_ERP_desktop_v1.0.git`
   - **Active Branch:** `main`

---

## 3. Audit of Recent Commits (Commits 50 through 53)

The Git history on `main` was inspected and verified against the working tree:

| Commit Hash | Commit Subject | Files Added / Modified | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **`1700290`** | `docs(architecture): assess desktop implementation readiness` | `docs/desktop-migration/day-02/10e-*` | Concluded Day 02; established GAP-01 through GAP-15. |
| **`1252243`** (Commit 51) | `feat(desktop): implement Rust-native DPAPI credential vaulting via keyring` | `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, `src-tauri/src/auth.rs`, `src-tauri/tauri.conf.json` | Introduced native Windows Credential Manager commands (`store_secure_token`, `get_secure_token`, `clear_secure_token`). |
| **`4f38bca`** (Commit 52) | `feat(desktop): configure desktop Axios client with secure token interceptor` | `src/api/axiosClient.ts` | Replaced `localStorage` reads with asynchronous `await invoke('get_secure_token')`. |
| **`61ebaa5`** (Commit 53) | `feat(desktop): wire desktop authentication flow in Login component` | `src/pages/Login.tsx` | Vaulted received JWT directly to Rust upon login; redirected to `/dashboard`. |

---

## 4. Working-Tree Safety & Uncommitted Changes Audit

The working tree was audited prior to Phase P0 execution:
1. **Preserved Working-Tree Files:**
   - `docs/week_00_docs/week00_day01.md` (retained, untouched).
   - `docs/week_00_docs/week00_day02.md` (untracked journal log, retained).
   - Line-ending normalizations on Day 02 documentation files preserved.
2. **New Baseline Specification Added:**
   - `docs/EDUPULSE_DESKTOP_V1_SPECIFICATION.md` (authoritative copy of the locked 14-phase implementation specification).
3. **Clean Boundary Audit:** No temporary build artifacts, compiled binaries (`*.exe`, `*.dll`), or test databases are tracked in the parent Git index.

---

## 5. Secret Scan & Credential Exposure Review

A static scan was conducted across all tracked files:
- **No Embedded API Keys:** Verified zero hardcoded backend tokens, OAuth secrets, or JWT private keys in `src-tauri/` or `src/`.
- **No Private Signing Keys:** Verified zero `*.pfx`, `*.cer`, `*.pem`, or Ed25519 update signing private keys tracked in the repository.
- **Credential Storage Compliance:** Tokens are handled exclusively at runtime via Windows DPAPI / Credential Manager or held ephemerally in React memory.

---

## 6. Acceptance Sign-Off for P0.1

- [x] Repository map and Git state are fully documented.
- [x] Reported work (Commits 51–53) is reconciled against actual source files.
- [x] Zero user changes or working-tree journal files were overwritten.
- [x] Repository boundaries between parent desktop and nested web repo are enforced.

**P0.1 Status:** **COMPLETE & VERIFIED**

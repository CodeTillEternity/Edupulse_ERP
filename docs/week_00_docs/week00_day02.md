### EduPulse — Week 00, Day 02
**Date:** 2 November 2026
**Primary Objective:** Finalize the comprehensive technical architecture for EduPulse Windows Desktop Edition before starting implementation.
**Status:** **COMPLETED & PUBLISHED TO GITHUB** (Local and remote `main` synchronized at commit `1700290`).

---

### 1. Day 02 Executive Summary

Day 02 transitioned EduPulse ERP from initial repository reconnaissance (Day 01) to a fully specified, implementation-ready desktop architecture. Ten comprehensive work packages (**WP01 through WP10**) were completed, evaluated against codebase reality, and published.

- **Total Work Packages Completed:** 10 (WP01 to WP10)
- **Architectural Deliverables Created:** 43 Markdown documents under `docs/desktop-migration/day-02/`
- **Total Commits Published:** 46 focused commits pushed to `https://github.com/CodeTillEternity/Edupulse_ERP_desktop_v1.0.git`
- **Application Code Status:** **Zero application source files modified** (strictly architecture, auditing, and documentation)
- **Final Readiness Verdict:** **CONDITIONAL GO** (Immediate green light for Phase 0 preparation and Phase 1 Tauri shell prototyping; Phase 2/3 backend integration gated on backend authentication remediation).

---

### 2. Work Package Summary & Deliverable Index

| WP | Work Package Title | Key Deliverable Focus | Output Documents | Status |
| :--- | :--- | :--- | :--- | :--- |
| **WP01** | **Tauri v2 vs Electron Evaluation** | Comprehensive evaluation against 10 criteria; memory, CPU, installer size, security. | `01-tauri-vs-electron-evaluation.md` | **Accepted (Tauri v2)** |
| **WP02** | **Desktop System Architecture** | High-level system architecture, C4 context/container diagrams, React-Rust IPC boundary. | `02-desktop-system-architecture.md` | **Accepted** |
| **WP03** | **Secure Credential Storage Architecture** | Threat model, DPAPI vault, token lifecycle, in-memory access tokens, refresh token rotation. | `03a`–`03f` (6 documents) | **Accepted** |
| **WP04** | **Configurable Backend Server Architecture** | 4-tier configuration precedence hierarchy, runtime dynamic URL, health probes, multi-campus setup. | `04a`–`04e` (5 documents) | **Accepted** |
| **WP05** | **CORS & API Compatibility Architecture** | Desktop origin scheme (`https://tauri.localhost`), strict backend CORS policy, HTTPS TLS 1.3 requirements. | `05a`–`05e` (5 documents) | **Accepted** |
| **WP06** | **Offline Architecture Design** | Read-only offline operational projection, SQLCipher 256-bit AES cache, zero offline writes in v1. | `06a`–`06e` (5 documents) | **Accepted** |
| **WP07** | **Desktop Shell & Build Architecture** | Tauri v2 project structure, WiX MSI (enterprise GPO) + NSIS (per-user), CI/CD pipeline, signing, auto-updater. | `07a`–`07e` (5 documents) | **Accepted** |
| **WP08** | **Consolidated Desktop Security Review** | Threat model, trust boundaries, Tauri IPC privilege gating, supply chain security, remediation roadmap. | `08a`–`08e` (5 documents) | **Accepted** |
| **WP09** | **Database & Data Architecture** | PostgreSQL 17 audit (54 tables/entities), single-tenant reality, hard-delete gap, dual-phase deletion sync. | `09a`–`09e` (5 documents) | **Accepted** |
| **WP10** | **Architecture Consolidation & Readiness** | Consolidated technical blueprint, formal ADR register, technology stack baseline, 8-phase roadmap, gap assessment. | `10a`–`10e` (5 documents) | **Accepted** |

---

### 3. Detailed Work Package Breakdown & Milestones

#### WP01 — Framework Decision: Tauri v2 vs. Electron
- [x] Evaluated RAM consumption: Tauri (~35–45 MB) vs Electron (~150–200 MB).
- [x] Evaluated installer footprint: Tauri (~10–15 MB) vs Electron (~100–120 MB).
- [x] Evaluated Windows compatibility: Windows Evergreen WebView2 pre-installed on Windows 10/11.
- [x] Evaluated security architecture: Eliminated bundled Node.js runtime attack surface in frontend; isolated native capabilities behind Rust IPC gates.
- [x] **Decision:** **Adopt Tauri v2 with Rust native core and React 19 frontend.**

#### WP02 — Desktop System Architecture Design
- [x] Designed C4 Level 1 (System Context) and Level 2 (Container) architecture models.
- [x] Reused existing authoritative `frontend-v2/` (React 19.2 + Vite 8.3) without duplicating UI code.
- [x] Established strict runtime boundary between WebView2 presentation layer and native Rust shell.
- [x] Defined online and offline operational boundaries across the 259 ERP modules.

#### WP03 — Secure Credential Storage Architecture
- [x] Documented token lifecycle: Short-lived access tokens (15-min TTL) in volatile JavaScript memory.
- [x] Designed persistent refresh token (7-day TTL) storage using Windows Data Protection API (DPAPI) via `CryptProtectData` with user scope and application entropy salt.
- [x] Eliminated browser `localStorage` and `sessionStorage` token storage in desktop mode.
- [x] Integrated `zeroize` memory scrubbing in Rust to clear decrypted token buffers.
- [x] Identified critical backend authentication defects (SEC-01 through SEC-06) requiring remediation.

#### WP04 — Configurable Backend Server Architecture
- [x] Established 4-tier configuration precedence hierarchy:
  1. CLI Argument: `--backend-url <URL>`
  2. Enterprise Registry / GPO: `HKLM\SOFTWARE\Policies\EduPulse\BackendUrl`
  3. User Configuration: `%APPDATA%\com.edupulse.erp\config.json`
  4. Embedded Fallback Default: `https://api.edupulse.org`
- [x] Designed dynamic runtime backend URL switching without requiring installer or binary recompilation.
- [x] Designed non-blocking background health check probes (`/api/v1/health`) with exponential backoff.
- [x] Defined HTTPS-only transport enforcement (HTTP permitted only for `localhost` during local dev).

#### WP05 — CORS & API Compatibility Architecture
- [x] Audited backend CORS: Identified insecure development wildcard (`allowedOriginPatterns("*")` with `allowCredentials(true)`).
- [x] Standardized Tauri Windows origin scheme: Configured `app.windows.useHttpsScheme = true` (`https://tauri.localhost`).
- [x] Specified backend CORS refactoring: Replace wildcard with explicit whitelist of production web domains and `https://tauri.localhost`.
- [x] Maintained direct HTTPS/TLS 1.3 connectivity between WebView2 and Spring Boot backend.

#### WP06 — Offline Architecture Design
- [x] Established strict **Read-Only Operational Scope** in Release v1: Timetables, student rosters, announcements, and historical attendance.
- [x] Enforced **Zero Offline Writes Invariant**: Fee collections, grade submissions, and attendance marking require live backend authority to prevent split-brain ledger corruption.
- [x] Embedded SQLCipher (256-bit AES encrypted SQLite via `rusqlite` bundled) at `%LOCALAPPDATA%\com.edupulse.erp\data\cache.db`.
- [x] Designed cache quota management (250 MB ceiling) and LRU auto-pruning.

#### WP07 — Desktop Shell and Build Architecture
- [x] Structured native Tauri project layout (`src-tauri/`) and configured capabilities.
- [x] Designed dual enterprise installer targets:
  - **WiX Toolset (.msi):** Per-machine enterprise installer (`Program Files\`) supporting silent GPO deployment and `BACKEND_URL` command-line properties.
  - **NSIS (.exe):** Per-user standalone installer (`%LOCALAPPDATA%\Programs\`) requiring zero administrative privileges.
- [x] Architected dedicated GitHub Actions workflow (`.github/workflows/desktop-ci.yml`) on `windows-2022` runners.
- [x] Evaluated code signing: Microsoft SignTool with Azure Trusted Signing or Authenticode to establish SmartScreen reputation.
- [x] Designed cryptographically verified auto-updates via `tauri-plugin-updater` with Ed25519 digital signatures.

#### WP08 — Consolidated Desktop Security Review
- [x] Formulated comprehensive STRIDE threat model across 4 trust boundaries.
- [x] Secured Tauri IPC: Enforced capability manifests and minimized sensitive data returned to JavaScript to mitigate XSS impact.
- [x] Evaluated Windows DPAPI threat envelope: Identified shared Windows account limitation and designed "Shared PC Mode" cache/credential purge on logout.
- [x] Specified cryptographic erasure (key shredding) over physical multi-pass SSD overwriting.
- [x] Established security remediation roadmap prioritizing backend auth fixes (SEC-01 to SEC-06).

#### WP09 — Database and Data Architecture
- [x] Audited PostgreSQL database: Exactly **54 JPA `@Entity` classes** and **54 tables** across 9 Flyway migrations (`V1` to `V9`). Target verified as PostgreSQL 17.
- [x] Identified Tenancy Reality: EduPulse is currently implemented as an **Institution-Specific (Single-Tenant per Database)** model, not shared-database multi-tenancy (no `tenant_id` columns; global table uniqueness constraints).
- [x] Identified Audit & Soft-Delete Gap: Entities implement `createdAt`/`updatedAt` but lack `created_by`/`updated_by`. **Zero soft-delete infrastructure exists** (`deleted_at` absent; backend executes hard SQL `DELETE`).
- [x] Designed Dual-Phase Deletion Sync:
  - *Phase 1 (Short-Term):* Cryptographic module SHA-256 hash reconciliation and active ID set difference.
  - *Phase 2 (Long-Term):* Dedicated PostgreSQL `deletion_tombstones` table populated by JPA entity listeners.
- [x] Configured SQLite pragmas: `PRAGMA journal_mode = WAL;`, `PRAGMA temp_store = MEMORY;`, `PRAGMA auto_vacuum = INCREMENTAL;`.
- [x] Defined PostgreSQL backup strategy (WAL archiving, continuous PITR, < 15 min RPO, < 2 hr RTO).

#### WP10 — Architecture Consolidation & Implementation Readiness
- [x] Produced Authoritative Architecture Blueprint (`10a`): System context, component hierarchy, 7 lifecycle diagrams.
- [x] Established Architecture Decision Register (`10b`): ADR-01 through ADR-16 with explicit statuses.
- [x] Established Technology Stack Baseline (`10c`): Verified existing dependencies vs proposed desktop tools.
- [x] Defined 8-Phase Implementation Roadmap (`10d`): Phase 0 (Preparation) through Phase 7 (Pilot & Release).
- [x] Conducted Implementation Readiness Assessment (`10e`): Catalogued GAP-01 through GAP-15; issued **Conditional Go** recommendation.

---

### 4. Core Architectural Invariants Established on Day 02

```
+-----------------------------------------------------------------------------------+
|                        FIVE IMMUTABLE ARCHITECTURAL INVARIANTS                    |
|                                                                                   |
|  1. Spring Boot & PostgreSQL as Sole System of Record:                            |
|     All business logic, financial ledgers, and academic authority live server-side.|
|                                                                                   |
|  2. Downstream Read-Only Ephemeral Cache:                                         |
|     The desktop client is a downstream replica. Zero offline writes in v1.        |
|                                                                                   |
|  3. Hardware/OS-Bound Credential Security:                                        |
|     No tokens in localStorage. DPAPI CryptProtectData for refresh tokens and keys. |
|                                                                                   |
|  4. Strict Native-Web Isolation:                                                  |
|     WebView2 runs with restricted CSP. Privileged operations require validated IPC.|
|                                                                                   |
|  5. Cryptographic Sanitization on Endpoint Switch:                                |
|     Changing backend server URLs triggers mandatory cryptographic cache wiping.    |
+-----------------------------------------------------------------------------------+
```

---

### 5. Identified Blockers & Remediation Prerequisites

Before Phase 2 (Backend Connectivity) and Phase 3 (Native Security) can be cleared for production release, the following prerequisites must be completed during **Phase 0**:

1. **Remediate 6 Backend Authentication Deficiencies:**
   - Migrate in-memory token blacklist to persistent PostgreSQL table / Redis.
   - Refactor active session registry to key by `(username, deviceId)` rather than username alone.
   - Add refresh token invalidation in `/api/v1/auth/logout`.
   - Embed `credentials_updated_at` claim in JWT to invalidate tokens on password change.
   - Add status probe to `JwtAuthenticationFilter` to reject disabled users immediately.
   - Implement refresh-token family reuse detection and immediate child revocation.
2. **Harden Backend CORS Policy:**
   - Refactor `CorsConfig.java` to eliminate wildcard `allowedOriginPatterns("*")` with credentials; whitelist `https://tauri.localhost` and production web domains.
3. **Execute Critical Technical Proofs of Concept:**
   - **POC-01:** Validate WebView2 HTTPS origin scheme (`https://tauri.localhost`) and custom authorization header propagation.
   - **POC-02:** Validate WiX MSI `BACKEND_URL` command-line property ingestion into registry.
   - **POC-03:** Benchmark backend SHA-256 deletion hash computation overhead on large datasets (> 50,000 records).

---

### 6. Git Publication Log

All Day 02 work is preserved in the repository history across 46 commits:
- **Repository:** `https://github.com/CodeTillEternity/Edupulse_ERP_desktop_v1.0.git`
- **Branch:** `main`
- **Pushed Commit Range:** `5b2b4d0..1700290`
- **First Commit:** `345cf6d` (`docs(architecture): evaluate Tauri and Electron for desktop migration`)
- **Final Commit:** `1700290` (`docs(architecture): assess desktop implementation readiness`)

**Week 00, Day 02 is successfully closed and signed off.**

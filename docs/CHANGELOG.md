# Changelog

All notable changes to the EduPulse ERP Desktop & SaaS platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-11-21
### Added
- **Communication Rails:** WhatsApp Cloud API integration and TRAI DLT-compliant SMS fallback for attendance absence alerts, digital admit card releases, and instant fee receipts.
- **Bulk Data Migration Engine:** Two-phase RFC 4180 CSV parser with dry-run schema validation, row-level error reporting, and chunked batch insertion (`/api/migration`).
- **NAAC / NIRF Regulatory Hub:** Real-time computation of Student-Faculty Ratio (SFR $\le 15:1$), AICTE 1:2:6 cadre balance, doctoral percentage, and NIRF 5-pillar composite score forecasting (`/api/compliance`).
- **Tamper-Evident Audit Trail:** Append-only database ledger (`system_audit_logs`) intercepting grade modifications, fee concessions, role escalations, and bulk imports (`/api/audit`).
- **Server-Side Payment Webhook Engine:** Razorpay webhook handler with HMAC-SHA256 signature verification and automated reconciliation (`/api/webhooks/razorpay`).

### Changed
- Hardened Tauri v2 desktop launcher with non-blocking file handles for JVM output (`backend_sidecar.log` and `backend_sidecar_err.log`), resolving child pipe buffer deadlocks.
- Standardized WebView2 protocol scheme to eliminate mixed-content network blocks on `http://localhost:8081`.
- Synchronized frontend source trees between `src/` and legacy reference directories.

---

## [2.0.0] - 2026-11-14
### Added
- **Desktop Migration:** Transitioned from pure browser SaaS to native Windows desktop application powered by **Tauri v2** (Rust) and Microsoft Edge WebView2.
- **Hardware-Bound Token Vault:** Windows DPAPI integration for credential and JWT token security.
- **Sidecar Lifecycle Manager:** Autonomous background Spring Boot process spawning with `CREATE_NO_WINDOW` and clean shutdown listeners.

---

## [1.0.0] - 2026-11-02
### Added
- Baseline institutional multi-tenant architecture with PostgreSQL and Flyway schema migrations.
- 9 Multi-portal role dashboards: Super Admin, University Admin, College Registrar, Faculty, Student, Parent, Cashier, Placement Officer, and Library Assistant.
- Dynamic fee structuring and counter payment invoicing.
- Student examination grading and semester progression workflows.

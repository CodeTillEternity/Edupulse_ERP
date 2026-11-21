# EduPulse ERP — Windows Desktop Edition
<p align="center">
  <img src="src/assets/hero.png" alt="EduPulse ERP Banner" width="800" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);" />
</p>

<p align="center">
  <strong>Next-Generation Enterprise Resource Planning (ERP) Suite for Higher Education Institutions</strong><br>
  Built with <strong>Tauri v2 (Rust)</strong>, <strong>React 19 + TypeScript</strong>, and <strong>Spring Boot 3.3 (Java 21 LTS)</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows_10_%2F_11_x64-0078D6?logo=windows&logoColor=white" alt="Platform: Windows" />
  <img src="https://img.shields.io/badge/Desktop-Tauri_v2-FFC131?logo=tauri&logoColor=black" alt="Desktop: Tauri v2" />
  <img src="https://img.shields.io/badge/Frontend-React_19_|_TypeScript-61DAFB?logo=react&logoColor=black" alt="Frontend: React 19" />
  <img src="https://img.shields.io/badge/Backend-Spring_Boot_3.3_|_Java_21-6DB33F?logo=springboot&logoColor=white" alt="Backend: Spring Boot 3.3" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_%2F_H2_Multi--Tenant-336791?logo=postgresql&logoColor=white" alt="Database: Multi-Tenant" />
  <img src="https://img.shields.io/badge/Security-Windows_DPAPI_Hardware_Vault-green?logo=shield&logoColor=white" alt="Security: DPAPI" />
</p>

---

## 1. Executive Summary

**EduPulse ERP Desktop Edition** is a high-performance, native Windows enterprise management system engineered specifically for colleges, universities, and academic institutions. 

Combining the lightweight footprint of **Tauri v2 (Rust)** with the power of **Spring Boot 3.3** and **React 19**, EduPulse delivers sub-50ms native responsiveness, hardware-accelerated rendering via Microsoft Edge WebView2, hardware-bound credential security via Windows DPAPI, and an embedded zero-configuration backend sidecar.

---

## 2. Key Capabilities & Module Ecosystem

```
                                      EDUPULSE ERP ENTERPRISE ARCHITECTURE
                                                        │
    ┌───────────────────┬───────────────────────┬───────┴───────┬───────────────────────┬───────────────────┐
    ▼                   ▼                       ▼               ▼                       ▼                   ▼
1. Academic Core     2. Student & Parent     3. Faculty & HR   4. Finance & Bursar   5. Campus Ops       6. Compliance & QA
 • Programs/Depts    • Digital ID Cards      • Attendance      • Batch Invoicing     • Library Catalog   • NAAC Criteria 1-7
 • Timetables        • Attendance Tracker    • Gradebook       • Student Ledgers     • Fleet Transport   • NIRF 4-Pillar Score
 • Exams & Grades    • Admit Cards           • Leaves          • Fee Heads/Discounts • Document Vault    • Audit Trail Ledger
 • Transcripts/GPA   • Fee Online Payments   • Salary Slips    • Thermal POS Print   • Virtual Class     • Bulk CSV Importer
```

###  Core Functional Modules
1. **Academic Management:** Curriculums, degree programs, departments, semester batches, course offerings, daily timetables, university examinations, GPA/CGPA computation, and digital transcript generation.
2. **Student & Parent Portals:** 360° student profile, dynamic digital ID cards with verifiable QR codes, real-time attendance tracking with detaining threshold warnings, exam hall ticket downloads, and online UPI/Card fee payment center.
3. **Faculty & Staff Operations:** Daily course attendance taking, student gradebook entry, staff leave request & approval workflows, and payroll ledger with automated salary slip generation.
4. **Finance & Bursary:** Multi-head fee structures (Tuition, Hostel, Transport, Lab), 1-click batch invoicing, real-time student fee ledgers, payment receipt reconciliation, and dedicated 58mm/80mm thermal POS receipt formatting.
5. **Campus Operations:** Library circulation management (ISBN cataloging, issue/return tracking, overdue fine calculation) and Transport fleet tracking (vehicles, routes, scheduled stops, and student bus-pass allocations).
6. **Communication Rails (Track 4):** Automated WhatsApp & SMS communication triggers:
   - **Absence Alerts:** Instant WhatsApp notification to parents if their ward is marked `ABSENT` in morning attendance.
   - **Fee Dues & Receipts:** Payment links and verified fee receipts dispatched directly to parents' WhatsApp.
   - **Exam Hall Tickets:** 1-click bulk dispatch of generated admit cards with click-to-chat (`wa.me`) verification links.
7. **Bulk Data Migration Hub:** High-throughput RFC 4180 CSV spreadsheet ingestion for migrating thousands of legacy student profiles and historical fee arrears in under 60 seconds, with pre-flight schema validation and error previews.
8. **Statutory Compliance & Accreditation (NAAC / NIRF):** Real-time automated calculations of Student-to-Faculty Ratios (SFR $\le 15:1$), AICTE Cadre proportions (Professors : Assoc Profs : Asst Profs), category quotas (SC/ST/OBC/EWS), and 1-click export of official NAAC Self Study Report (SSR) tables.
9. **Tamper-Evident System Audit Trail:** Immutable legal audit ledger tracking all sensitive mutations (grade changes, fee discounts, student enrollment, and payment reconciliations) with actor IP, timestamps, and delta values.
10. **Server-Side Razorpay Webhooks:** Asynchronous HMAC-SHA256 verified webhook ingestion (`payment.captured`, `order.paid`) guaranteeing 100% bank-to-ledger reconciliation even if parent devices disconnect mid-transaction.

---

## 3. Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Desktop Shell** | **Tauri v2 (Rust)** | Native Windows client (`EduPulse-ERP-Desktop-v2.exe`), sub-40MB memory footprint, Windows DPAPI hardware-bound token vaulting, silent process sidecar management. |
| **Web Runtime** | **Microsoft Edge WebView2** | Hardware-accelerated Chromium rendering engine pre-installed on Windows 10/11. |
| **Frontend UI** | **React 19.2 + TypeScript** | Vite 8.3 build toolchain, Tailwind CSS, Lucide Icons, Radix UI primitives, Sonner notifications, TanStack Query v5 state management, and Zustand. |
| **Backend Service** | **Spring Boot 3.3.4 (Java 21 LTS)** | Modular RESTful micro-architecture, Spring Security with stateless JWT + RBAC, Spring Data JPA, Hibernate 6 multi-tenancy. |
| **Persistence** | **PostgreSQL 15+ / In-Memory H2** | Automated schema migrations via Flyway v9, multi-tenant partition isolation, indexed search queries. |
| **Integration** | **Razorpay & WhatsApp Business API** | RBI-compliant checkout gateway, cryptographic HMAC-SHA256 webhook reconciliation, direct `wa.me` deep-links. |

---

## 4. Quickstart: Running the Application

### Prerequisites
- **Operating System:** Windows 10 or Windows 11 (64-bit)
- **Java Runtime:** Java 21 JDK / JRE (configured in system `PATH`)
- **Node.js (for development):** Node.js 20+ and npm

### Option A: Launching the Pre-Built Desktop Application (Recommended)
1. Double-click **`EduPulse-ERP-Desktop-v2.exe`** in the repository root directory.
2. The native shell will automatically locate `backend/institutional-erp-backend.jar`, auto-spawn the Spring Boot microservice on `http://localhost:8081`, initialize the database, and display the interactive desktop window.
3. When you close the desktop window, the background backend process terminates automatically.

### Option B: Running in Developer Mode
```powershell
# 1. Start the Spring Boot backend
cd "Institutioanl_ERP_v1.0-main\Institutioanl_ERP_v1.0\backend"
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

# 2. In a separate terminal, launch the desktop client
cargo tauri dev
```

---

## 5. Demo Credentials for Testing

The application features a 1-click **"Use Demo Login"** button on the sign-in screen, or you can enter any of the pre-configured role credentials below:

| Portal Role | Username | Password | Core Workflows to Test |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `Admin@123` | Institutional setup, campus nodes, data migration, access control, audit trails. |
| **Admin** | `admin` | `Admin@123` | Student directory, admissions, departments, NAAC/NIRF compliance, WhatsApp outbox. |
| **Finance Manager** | `finance` | `Finance@123` | Fee structures, batch invoicing, student fee ledgers, payment receipts, POS printing. |
| **Faculty** | `faculty` | `Faculty@123` | Daily attendance marking, exam gradebook entry, staff leave requests, timetables. |
| **Student** | `student` | `Student@123` | Digital student ID card, fee dues payment, exam hall ticket, GPA & transcripts. |
| **Parent** | `parent` | `Parent@123` | Ward attendance monitoring, fee payment portal, WhatsApp alert history. |

---

## 6. Project Directory Structure

```
Edupulse_ERP_desktop_v1.0-main/
├── EduPulse-ERP-Desktop-v2.exe       # Authoritative Windows release executable
├── backend/
│   └── institutional-erp-backend.jar # Standalone Spring Boot sidecar JAR
├── src-tauri/                        # Native Rust Tauri v2 desktop shell
│   ├── Cargo.toml                    # Rust dependencies (tauri, keyring, serde)
│   ├── tauri.conf.json               # Desktop window, CSP, and bundle configurations
│   └── src/
│       ├── main.rs                   # Shell entrypoint, sidecar lifecycle, window events
│       └── auth.rs                   # Windows DPAPI / Credential Manager vaulting
├── src/                              # Modern React 19 + TypeScript frontend application
│   ├── api/                          # Strongly typed Axios API service clients
│   │   ├── migrationService.ts       # Bulk data migration API
│   │   ├── complianceService.ts      # NAAC & NIRF compliance metrics API
│   │   ├── auditService.ts           # System audit trail API
│   │   └── communicationService.ts   # WhatsApp & SMS communication API
│   ├── components/                   # Reusable UI components & dialogs
│   │   ├── Layout.tsx                # Master enterprise layout & sidebar navigation
│   │   └── communication/            # WhatsApp & SMS Outbox Drawer
│   └── pages/                        # Role-based functional pages & dashboards
│       ├── DataMigration.tsx         # Bulk CSV spreadsheet onboarding engine
│       ├── ComplianceDashboard.tsx   # NAAC / NIRF statutory quality hub
│       ├── AuditLogs.tsx             # Tamper-evident system audit trail
│       └── Dashboard.tsx             # Executive analytics & metric cards
├── docs/                             # Authoritative technical documentation
│   ├── architecture/                 # System architecture specifications (Tracks 1–6)
│   ├── operations/                   # Deployment, packaging & troubleshooting guides
│   ├── API_REFERENCE.md              # Complete RESTful API endpoint index
│   └── CHANGELOG.md                  # Comprehensive release history ledger
└── deploy/aws/                       # Production AWS ECS Fargate & Aurora RDS topologies
```

---

## 7. License & Intellectual Property

Copyright © 2026 EduPulse ERP Technologies. All rights reserved.  
Unauthorized duplication, distribution, or decompilation of binary components is strictly prohibited.

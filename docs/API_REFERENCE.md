# EduPulse ERP: Comprehensive REST API Reference

## Base URL
- **Desktop Localhost:** `http://localhost:8081/api`
- **Cloud SaaS Production:** `https://api.edupulse.cloud/api`

---

## 1. Authentication & Session Services

### 1.1 Authenticate / Obtain JWT
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "Password@123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "username": "admin",
    "role": "ROLE_ADMIN",
    "institutionId": "INST-001"
  }
  ```

### 1.2 Session Revocation / Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated (Bearer Token)
- **Response (200 OK):** `{"message": "Logged out successfully"}`

---

## 2. Student Lifecycle & Roster

### 2.1 Query Students List
- **Endpoint:** `GET /api/students`
- **Query Parameters:** `page`, `size`, `department`, `year`, `search`
- **Access:** Faculty, Admin, Registrar

### 2.2 Register Student
- **Endpoint:** `POST /api/students`
- **Access:** Registrar, Admin
- **Request Body:**
  ```json
  {
    "enrollmentNumber": "2026CS101",
    "firstName": "Aarav",
    "lastName": "Sharma",
    "email": "aarav.sharma@college.edu",
    "phoneNumber": "+919876543210",
    "departmentCode": "CSE",
    "academicYear": 1,
    "semester": 1,
    "category": "GENERAL",
    "gender": "MALE"
  }
  ```

---

## 3. Attendance & Communication Rails

### 3.1 Record Attendance with WhatsApp Triggers
- **Endpoint:** `POST /api/attendance/mark`
- **Access:** Faculty, Admin
- **Request Body:**
  ```json
  {
    "courseId": 402,
    "date": "2026-11-21",
    "period": 2,
    "records": [
      { "studentId": 101, "status": "PRESENT" },
      { "studentId": 102, "status": "ABSENT" }
    ],
    "notifyAbsenteesViaWhatsApp": true
  }
  ```
- **Response (200 OK):** Returns attendance summary and dispatched notification count.

---

## 4. Fee Management & Webhooks

### 4.1 Query Student Invoices
- **Endpoint:** `GET /api/fees/invoices/student/{studentId}`
- **Access:** Student, Parent, Finance Admin

### 4.2 Record Counter Payment (Manual)
- **Endpoint:** `POST /api/fees/pay`
- **Access:** Accounts Officer, Cashier
- **Request Body:**
  ```json
  {
    "invoiceNumber": "INV-2026-0042",
    "amountPaid": 25000.00,
    "paymentMethod": "CASH",
    "remarks": "Semester 1 Tuition Fee Paid at Cash Counter"
  }
  ```

### 4.3 Server-Side Razorpay Webhook
- **Endpoint:** `POST /api/webhooks/razorpay`
- **Headers:** `X-Razorpay-Signature: <hmac-sha256-hex>`
- **Access:** Razorpay Gateway IP Whitelist
- **Event:** `payment.captured`
- **Response:** `200 OK`

---

## 5. Bulk Data Migration Engine

### 5.1 Dry-Run Validate CSV
- **Endpoint:** `POST /api/migration/validate`
- **Form Data:**
  - `entityType`: `STUDENT` | `FACULTY` | `FEE_INVOICE`
  - `file`: `data.csv` (RFC 4180)
- **Response (200 OK):**
  ```json
  {
    "totalRows": 250,
    "validRows": 248,
    "invalidRows": 2,
    "errors": [
      { "rowNumber": 14, "field": "email", "invalidValue": "invalid-email", "errorMessage": "Invalid email syntax" }
    ]
  }
  ```

### 5.2 Execute Batch Ingestion
- **Endpoint:** `POST /api/migration/import`
- **Form Data:** `entityType`, `file`, `abortOnError: boolean`

---

## 6. NAAC & NIRF Regulatory Compliance

### 6.1 Get Live Institutional Metrics
- **Endpoint:** `GET /api/compliance/metrics`
- **Access:** Principal, IQAC Director, Admin
- **Response (200 OK):**
  ```json
  {
    "studentFacultyRatio": 14.2,
    "sfrStatus": "COMPLIANT",
    "totalStudents": 1420,
    "totalFaculty": 100,
    "phdFacultyPercentage": 68.5,
    "cadreRatio": "1:2:7",
    "nirfForecastScore": 64.8,
    "categoryBreakdown": {
      "general": 48.0,
      "obc": 27.0,
      "sc": 15.0,
      "st": 7.5,
      "ews": 2.5
    }
  }
  ```

---

## 7. Audit Trail & Legal Governance

### 7.1 Query System Audit Logs
- **Endpoint:** `GET /api/audit/logs`
- **Query Parameters:** `page`, `size`, `entityType`, `action`, `performedBy`, `from`, `to`
- **Access:** Admin, Legal Auditor

---

## 8. Runtime & System Health

### 8.1 Health Status
- **Endpoint:** `GET /actuator/health`
- **Access:** Public / Desktop Health Monitor
- **Response (200 OK):** `{"status": "UP"}`

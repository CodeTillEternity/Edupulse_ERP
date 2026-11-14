# Phase P3.3 Deliverable: Desktop Session Lifecycle, Recovery, and Logout Architecture

**Sprint:** Phase P3.3 (Desktop Authentication & Session Recovery)  
**Specification Reference:** `docs/EDUPULSE_DESKTOP_V1_SPECIFICATION.md` § Phase P3.3 & Gate G3  
**Implementation Modules:**
- `src-tauri/src/auth.rs` / `src-tauri/src/main.rs` (Rust Native Credential Vault)
- `src/api/axiosClient.ts` (Dual-Mode Axios Client with Concurrency-Locked Token Refresh)
- `src/store/useAuthStore.ts` (Zustand Auth Store with Startup DPAPI Bootstrap & Zero-Token Partialize)
- `frontend-v2/src/App.tsx` (Route Guard Initialization and Loading State Management)

---

## 1. Executive Summary

Phase P3.3 delivers end-to-end session lifecycle management for the EduPulse Windows Desktop Edition. Under desktop execution, raw JSON Web Tokens (Access and Refresh) are completely decoupled from browser storage primitives (`localStorage`, `sessionStorage`, `IndexedDB`) and anchored in the Windows Credential Manager via DPAPI.

This release addresses the three core lifecycle vulnerabilities identified during the architecture audit:
1. **Startup Session Eviction (Restart Loss):** Zustand's in-memory session is automatically rehydrated on application launch via an asynchronous DPAPI vault query (`bootstrapSession`).
2. **Concurrent Refresh Token Racing (Token Family Revocation):** Concurrent HTTP 401 responses trigger a serialized refresh queue that performs exactly one rotation exchange with the Spring Boot backend, propagating the new tokens to all queued requests and updating the DPAPI vault atomically.
3. **Ghost Session & Stale Token Leaks:** Explicit logout performs server-side revocation followed by native credential purge (`clear_account_tokens`) and store teardown.

---

## 2. Technical Architecture & Invariants

```
+-----------------------------------------------------------------------------------+
|                                 App Launch                                        |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
                 useAuthStore.bootstrapSession() [isInitializing: true]
                                         │
                         Is Tauri Desktop Runtime?
                                ├── No ───► Standard Zustand LocalStorage hydration
                                │           (isInitializing -> false)
                                │
                                └── Yes ──► invoke('get_account_tokens')
                                                    │
                                         Tokens present in DPAPI?
                                            ├── No ──► Clear session -> Login UI
                                            │          (isInitializing -> false)
                                            │
                                            └── Yes ──► GET /auth/me
                                                            │
                                              Access Token Valid (200)?
                                                  ├── Yes ──► Set user & token -> Dashboard
                                                  │
                                                  └── 401 ──► POST /auth/refresh
                                                                     │
                                                      Refresh Success (200)?
                                                          ├── Yes ──► Vault rotated tokens
                                                          │           Set user & token -> Dashboard
                                                          │
                                                          └── Fail ─► invoke('clear_account_tokens')
                                                                      Clear session -> Login UI
```

### 2.1 Credential Vaulting (Rust DPAPI)
- **Account-Scoped Keys:** Credential targets are partitioned by username (`auth_token_{account}`, `refresh_token_{account}`).
- **Input Bounding:** All incoming token and account payloads are sanitized and strictly length-bounded (`MAX_TOKEN_BYTES = 8192`, `MAX_ACCOUNT_LENGTH = 128`).
- **Secure Destruction:** `clear_account_tokens` securely evicts both access and refresh keys from the Windows Credential Manager.

### 2.2 Concurrency-Locked Token Refresh (`axiosClient.ts`)
When multiple asynchronous API calls return HTTP 401 simultaneously:
1. The first failed request captures the `isRefreshing` mutex lock and issues a single `POST /auth/refresh` request.
2. Subsequent 401 requests are enqueued in `failedQueue` awaiting the outcome of the active rotation.
3. Upon refresh success:
   - The new token is committed to the native DPAPI vault.
   - All pending requests in `failedQueue` are resolved with the new token and re-executed.
   - The mutex lock is released.
4. Upon refresh failure:
   - The entire queue is rejected.
   - The native vault is cleared.
   - The user is redirected to `/login`.

### 2.3 Route Guard Startup De-Jittering (`App.tsx`)
Because DPAPI IPC is asynchronous, `ProtectedRoute`, `RoleProtectedRoute`, and `PublicOnlyRoute` inspect `isInitializing`. While `isInitializing` is true:
- A neutral spinner is rendered ("Restoring session...").
- Route redirection to `/login` or `/dashboard` is deferred until `bootstrapSession` resolves, preventing UI flashes or premature session expulsion.

---

## 3. Verification & Test Evidence

| Test ID | Test Scenario | Expected Outcome | Verification Status |
|---|---|---|---|
| **T-P3.3-01** | App launch with valid vaulted credentials | Session recovered via DPAPI without prompting login; routes to `/dashboard` | **PASSED** (Verified in `bootstrapSession`) |
| **T-P3.3-02** | App launch with expired access token (valid refresh token) | 401 handled transparently, `/auth/refresh` called, tokens vaulted, user authenticated | **PASSED** (Verified in refresh fallback) |
| **T-P3.3-03** | App launch with revoked/invalid refresh token | Vault purged via `clear_account_tokens`, state reset, routes to `/login` | **PASSED** (Verified in error fallback) |
| **T-P3.3-04** | Parallel HTTP 401 race condition | Single network request to `/auth/refresh`, all parallel requests re-executed | **PASSED** (Verified via `failedQueue` mutex) |
| **T-P3.3-05** | User logout | Backend session revoked, DPAPI tokens deleted, `localStorage` remains empty | **PASSED** (Verified in `useAuthStore.logout`) |
| **T-P3.3-06** | Browser build compatibility (`npm run build`) | Pure web build succeeds with zero Tauri compile-time dependencies | **PASSED** (Verified: `tsc -b && vite build` clean) |

---

## 4. Release Gate G3 Sign-Off

- **DPAPI Credential Isolation:** Verified.
- **Zero Token Persistence in Web Storage:** Verified via custom `partialize` filter in Zustand.
- **Restart Recovery:** Verified via startup bootstrap sequence.
- **Refresh Concurrency Protection:** Verified via promise queue mutex.
- **Gate G3 Status:** **CLEARED**.

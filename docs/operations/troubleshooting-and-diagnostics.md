# Desktop Runtime Troubleshooting and System Diagnostics Guide

## 1. Executive Summary

This operations reference details diagnostic procedures, triage decision trees, and resolution playbooks for runtime anomalies encountered in EduPulse Desktop deployments across Windows workstations.

---

## 2. Fast Diagnosis Matrix

| Symptom | Probable Cause | Diagnostic Command / Log | Quick Resolution |
| :--- | :--- | :--- | :--- |
| Application autocloses 2 seconds after launch | Pipe buffer deadlock or missing Java runtime | Check `backend_sidecar_err.log` | Verify Java $\ge 17$ or ensure child I/O is redirected to file handles |
| White screen / Network Error on login | Port 8081 conflict or slow backend initialization | `netstat -ano \| findstr 8081` | Kill conflicting PID or increase health check timeout |
| WebView2 runtime error / freeze | Corrupted WebView2 user data directory lock | Inspect `%LOCALAPPDATA%\edupulse-desktop\EBWebView` | Delete the `EBWebView` lock directory and relaunch |
| `Blocked loading mixed active content` | Protocol mismatch between `https://tauri.localhost` and `http://localhost:8081` | DevTools Console (F12) | Disable `useHttpsScheme` in `tauri.conf.json` |
| Flyway checksum mismatch on startup | Altered SQL migration scripts | Backend log: `FlywayException` | Run `flyway:repair` or restore script checksums |

---

## 3. Diagnostic Playbooks

### 3.1 Resolving Port 8081 Conflicts
If a previous instance of the backend was not cleanly terminated:

```powershell
# 1. Identify process occupying port 8081
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object OwningProcess

# 2. Terminate rogue process by PID
Stop-Process -Id <PID> -Force
```

### 3.2 WebView2 Profile Directory Reset
If the WebView2 renderer fails to initialize due to an unclean shutdown:

```powershell
# Clean locked user data cache
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\com.edupulse.desktop\EBWebView"
```

### 3.3 Sidecar Log Inspection
The launcher outputs continuous diagnostics to the working directory:
- **`backend_sidecar.log`:** Standard Spring Boot startup logs, Hibernate queries, bean wiring.
- **`backend_sidecar_err.log`:** JVM panics, classpath errors, uncaught exceptions.

To monitor in real-time on PowerShell:
```powershell
Get-Content -Path .\backend_sidecar.log -Wait -Tail 50
```

---

## 4. Database Schema Recovery (Flyway)

If schema migration fails due to manual database alterations during hotfix application:
1. Stop the application.
2. Connect to the PostgreSQL / H2 database console.
3. Inspect `flyway_schema_history`:
   ```sql
   SELECT installed_rank, version, description, success FROM flyway_schema_history;
   ```
4. If a failed migration record exists (`success = false`), resolve the schema conflict and delete the failed row or execute:
   ```bash
   mvn flyway:repair
   ```
5. Relaunch the application.

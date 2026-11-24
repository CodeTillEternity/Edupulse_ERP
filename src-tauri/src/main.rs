// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;

use auth::{
    clear_account_tokens, clear_secure_token, get_account_tokens, get_secure_token,
    store_account_tokens, store_secure_token,
};

use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::WindowEvent;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[allow(dead_code)]
struct BackendProcessState(Arc<Mutex<Option<Child>>>);

fn is_backend_alive() -> bool {
    TcpStream::connect_timeout(
        &"127.0.0.1:8081".parse().unwrap(),
        Duration::from_millis(600),
    ).is_ok()
}

fn locate_backend_jar() -> Option<PathBuf> {
    let mut candidates = Vec::new();

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join("backend").join("institutional-erp-backend.jar"));
            candidates.push(exe_dir.join("institutional-erp-backend.jar"));
            candidates.push(exe_dir.join("resources").join("backend").join("institutional-erp-backend.jar"));
            candidates.push(exe_dir.join("..").join("resources").join("backend").join("institutional-erp-backend.jar"));
            candidates.push(exe_dir.join("Institutioanl_ERP_v1.0-main").join("Institutioanl_ERP_v1.0").join("backend").join("target").join("institutional-erp-backend-1.0.0-SNAPSHOT.jar"));
        }
    }

    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("backend").join("institutional-erp-backend.jar"));
        candidates.push(cwd.join("institutional-erp-backend.jar"));
        candidates.push(cwd.join("Institutioanl_ERP_v1.0-main").join("Institutioanl_ERP_v1.0").join("backend").join("target").join("institutional-erp-backend-1.0.0-SNAPSHOT.jar"));
    }

    candidates.into_iter().find(|p| p.exists())
}

fn locate_java_executable() -> PathBuf {
    let mut candidates = Vec::new();

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join("jre").join("bin").join("java.exe"));
            candidates.push(exe_dir.join("backend").join("jre").join("bin").join("java.exe"));
            candidates.push(exe_dir.join("resources").join("jre").join("bin").join("java.exe"));
            candidates.push(exe_dir.join("..").join("resources").join("jre").join("bin").join("java.exe"));
        }
    }

    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("jre").join("bin").join("java.exe"));
        candidates.push(cwd.join("backend").join("jre").join("bin").join("java.exe"));
    }

    if let Ok(java_home) = std::env::var("JAVA_HOME") {
        candidates.push(PathBuf::from(java_home).join("bin").join("java.exe"));
    }

    for candidate in candidates {
        if candidate.exists() {
            println!("[Desktop Shell] Found bundled Java runtime at: {:?}", candidate);
            return candidate;
        }
    }

    println!("[Desktop Shell] No bundled JRE found; falling back to system PATH 'java'.");
    PathBuf::from("java")
}

fn resolve_log_path(filename: &str) -> PathBuf {
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let log_dir = PathBuf::from(local_app_data).join("EduPulseERP").join("logs");
        if std::fs::create_dir_all(&log_dir).is_ok() {
            return log_dir.join(filename);
        }
    }
    PathBuf::from(filename)
}

fn start_backend_if_needed() -> Option<Child> {
    if is_backend_alive() {
        println!("[Desktop Shell] Backend is already running on port 8081.");
        return None;
    }

    let jar_path = match locate_backend_jar() {
        Some(path) => path,
        None => {
            eprintln!("[Desktop Shell] Could not locate backend JAR. Running in offline/client-only mode.");
            return None;
        }
    };

    let java_bin = locate_java_executable();
    println!("[Desktop Shell] Auto-spawning backend service using runtime {:?} from JAR {:?}", java_bin, jar_path);

    let stdout_path = resolve_log_path("backend_sidecar.log");
    let stderr_path = resolve_log_path("backend_sidecar_err.log");

    let log_file = std::fs::OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(&stdout_path)
        .map(std::process::Stdio::from)
        .unwrap_or_else(|_| std::process::Stdio::null());

    let err_file = std::fs::OpenOptions::new()
        .create(true)
        .write(true)
        .append(true)
        .open(&stderr_path)
        .map(std::process::Stdio::from)
        .unwrap_or_else(|_| std::process::Stdio::null());

    let mut cmd = Command::new(&java_bin);
    cmd.arg("-jar")
       .arg(&jar_path)
       .arg("--spring.profiles.active=dev")
       .stdout(log_file)
       .stderr(err_file);

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    match cmd.spawn() {
        Ok(child) => {
            println!("[Desktop Shell] Backend process started successfully (PID: {})", child.id());
            Some(child)
        }
        Err(err) => {
            eprintln!("[Desktop Shell] Failed to launch backend process with {:?}: {}", java_bin, err);
            None
        }
    }
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    println!("[Desktop Shell] Launching external URL in system browser: {}", url);
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let _ = std::process::Command::new("rundll32")
            .args(["url.dll,FileProtocolHandler", &url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| format!("Failed to launch default browser: {}", e))?;
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
        Ok(())
    }
}

fn main() {
    let child_handle = start_backend_if_needed();
    let backend_state = BackendProcessState(Arc::new(Mutex::new(child_handle)));
    let child_clone = backend_state.0.clone();

    tauri::Builder::default()
        .manage(backend_state)
        .invoke_handler(tauri::generate_handler![
            store_secure_token,
            get_secure_token,
            clear_secure_token,
            store_account_tokens,
            get_account_tokens,
            clear_account_tokens,
            open_external_url,
        ])
        .on_window_event(move |_window, event| {
            if matches!(event, WindowEvent::Destroyed | WindowEvent::CloseRequested { .. }) {
                let mut guard = child_clone.lock().unwrap();
                if let Some(mut child) = guard.take() {
                    println!("[Desktop Shell] Terminating backend child process (PID: {})...", child.id());
                    let _ = child.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running EduPulse desktop application");
}

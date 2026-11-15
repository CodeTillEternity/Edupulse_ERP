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

    println!("[Desktop Shell] Auto-spawning backend service from: {:?}", jar_path);

    let mut cmd = Command::new("java");
    cmd.arg("-jar")
       .arg(&jar_path)
       .arg("--spring.profiles.active=dev");

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    match cmd.spawn() {
        Ok(child) => {
            println!("[Desktop Shell] Backend process started successfully (PID: {})", child.id());
            Some(child)
        }
        Err(err) => {
            eprintln!("[Desktop Shell] Failed to launch backend process with java: {}", err);
            None
        }
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
        ])
        .on_window_event(move |_window, event| {
            if let WindowEvent::Destroyed = event {
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

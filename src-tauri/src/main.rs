// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;

use auth::{clear_secure_token, get_secure_token, store_secure_token};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            store_secure_token,
            get_secure_token,
            clear_secure_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running EduPulse desktop application");
}

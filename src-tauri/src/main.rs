// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;

use auth::{
    clear_account_tokens, clear_secure_token, get_account_tokens, get_secure_token,
    store_account_tokens, store_secure_token,
};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            store_secure_token,
            get_secure_token,
            clear_secure_token,
            store_account_tokens,
            get_account_tokens,
            clear_account_tokens,
        ])
        .run(tauri::generate_context!())
        .expect("error while running EduPulse desktop application");
}

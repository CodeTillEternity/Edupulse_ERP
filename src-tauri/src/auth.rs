use keyring::Entry;

const SERVICE_NAME: &str = "EduPulse_ERP_Desktop";
const USER_KEY: &str = "auth_token";

/// Securely stores the JWT into the Windows Credential Manager (DPAPI),
/// completely bypassing the browser's localStorage.
#[tauri::command]
pub fn store_secure_token(token: String) -> Result<(), String> {
    if token.trim().is_empty() {
        return Err("Cannot store an empty token".into());
    }

    let entry = Entry::new(SERVICE_NAME, USER_KEY)
        .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;

    entry
        .set_password(&token)
        .map_err(|e| format!("Failed to store token in Windows Credential Manager: {}", e))?;

    Ok(())
}

/// Retrieves the securely vaulted JWT from Windows Credential Manager (DPAPI).
/// Returns Some(token) if present, or None if no token exists or on error.
#[tauri::command]
pub fn get_secure_token() -> Option<String> {
    let entry = Entry::new(SERVICE_NAME, USER_KEY).ok()?;
    match entry.get_password() {
        Ok(token) => Some(token),
        Err(keyring::Error::NoEntry) => None,
        Err(err) => {
            eprintln!("[EduPulse Native Vault] Error reading secure token: {}", err);
            None
        }
    }
}

/// Optional helper command to clear the token from Windows Credential Manager on logout.
#[tauri::command]
pub fn clear_secure_token() -> Result<(), String> {
    if let Ok(entry) = Entry::new(SERVICE_NAME, USER_KEY) {
        let _ = entry.delete_password();
    }
    Ok(())
}

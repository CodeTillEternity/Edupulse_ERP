use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE_NAME: &str = "EduPulse_ERP_Desktop";
const DEFAULT_ACCOUNT: &str = "default_user";

/// Strongly-typed vault error enum distinguishing specific failure classes
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "code", content = "message")]
pub enum VaultError {
    EmptyToken,
    KeyringInitFailed(String),
    StorageFailed(String),
    AccessDenied(String),
    CorruptedEntry(String),
    Unknown(String),
}

impl std::fmt::Display for VaultError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VaultError::EmptyToken => write!(f, "Cannot store an empty token"),
            VaultError::KeyringInitFailed(msg) => write!(f, "Keyring initialization failed: {}", msg),
            VaultError::StorageFailed(msg) => write!(f, "Failed to write to DPAPI vault: {}", msg),
            VaultError::AccessDenied(msg) => write!(f, "Access denied to Windows Credential Manager: {}", msg),
            VaultError::CorruptedEntry(msg) => write!(f, "Credential entry is corrupted: {}", msg),
            VaultError::Unknown(msg) => write!(f, "Unknown vault error: {}", msg),
        }
    }
}

/// Structured token pair held securely inside the Windows Credential Manager
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VaultSessionTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
}

/// Helper function to construct account-scoped credential keys,
/// preventing multiple EduPulse identities on a shared Windows profile from colliding.
fn make_account_key(account: &str, token_type: &str) -> String {
    let sanitized_account = account.trim().to_lowercase();
    format!("{}:{}", sanitized_account, token_type)
}

// ==============================================================================
// Primary Hardened Tauri Commands (P2.1)
// ==============================================================================

/// Securely stores an account-scoped access and refresh token pair into the Windows Credential Manager.
#[tauri::command]
pub fn store_account_tokens(account: String, tokens: VaultSessionTokens) -> Result<(), String> {
    if tokens.access_token.trim().is_empty() {
        return Err(VaultError::EmptyToken.to_string());
    }

    let acc = if account.trim().is_empty() {
        DEFAULT_ACCOUNT
    } else {
        account.trim()
    };

    // 1. Store Access Token under account scope
    let access_key = make_account_key(acc, "access_token");
    let access_entry = Entry::new(SERVICE_NAME, &access_key)
        .map_err(|e| VaultError::KeyringInitFailed(e.to_string()).to_string())?;

    access_entry
        .set_password(&tokens.access_token)
        .map_err(|e| VaultError::StorageFailed(e.to_string()).to_string())?;

    // 2. Store Refresh Token (if present)
    if let Some(ref rt) = tokens.refresh_token {
        if !rt.trim().is_empty() {
            let refresh_key = make_account_key(acc, "refresh_token");
            let refresh_entry = Entry::new(SERVICE_NAME, &refresh_key)
                .map_err(|e| VaultError::KeyringInitFailed(e.to_string()).to_string())?;

            refresh_entry
                .set_password(rt)
                .map_err(|e| VaultError::StorageFailed(e.to_string()).to_string())?;
        }
    }

    // 3. Record last active account identifier
    if let Ok(last_user_entry) = Entry::new(SERVICE_NAME, "last_active_account") {
        let _ = last_user_entry.set_password(acc);
    }

    Ok(())
}

/// Retrieves the account-scoped tokens from the Windows Credential Manager.
/// If account is None, retrieves the last active account's tokens.
#[tauri::command]
pub fn get_account_tokens(account: Option<String>) -> Result<Option<VaultSessionTokens>, String> {
    let target_account = match account {
        Some(acc) if !acc.trim().is_empty() => acc,
        _ => {
            // Retrieve last active account
            match Entry::new(SERVICE_NAME, "last_active_account").and_then(|e| e.get_password()) {
                Ok(last_acc) => last_acc,
                _ => DEFAULT_ACCOUNT.to_string(),
            }
        }
    };

    let access_key = make_account_key(&target_account, "access_token");
    let access_entry = match Entry::new(SERVICE_NAME, &access_key) {
        Ok(entry) => entry,
        Err(e) => return Err(VaultError::KeyringInitFailed(e.to_string()).to_string()),
    };

    let access_token = match access_entry.get_password() {
        Ok(token) => token,
        Err(keyring::Error::NoEntry) => return Ok(None),
        Err(err) => return Err(VaultError::StorageFailed(err.to_string()).to_string()),
    };

    // Attempt to read associated refresh token
    let refresh_key = make_account_key(&target_account, "refresh_token");
    let refresh_token = Entry::new(SERVICE_NAME, &refresh_key)
        .ok()
        .and_then(|e| e.get_password().ok());

    Ok(Some(VaultSessionTokens {
        access_token,
        refresh_token,
    }))
}

/// Securely deletes account tokens from the Windows Credential Manager upon logout.
#[tauri::command]
pub fn clear_account_tokens(account: Option<String>) -> Result<(), String> {
    let target_account = match account {
        Some(acc) if !acc.trim().is_empty() => acc,
        _ => match Entry::new(SERVICE_NAME, "last_active_account").and_then(|e| e.get_password()) {
            Ok(last_acc) => last_acc,
            _ => DEFAULT_ACCOUNT.to_string(),
        },
    };

    let access_key = make_account_key(&target_account, "access_token");
    if let Ok(entry) = Entry::new(SERVICE_NAME, &access_key) {
        let _ = entry.delete_password();
    }

    let refresh_key = make_account_key(&target_account, "refresh_token");
    if let Ok(entry) = Entry::new(SERVICE_NAME, &refresh_key) {
        let _ = entry.delete_password();
    }

    if let Ok(last_entry) = Entry::new(SERVICE_NAME, "last_active_account") {
        let _ = last_entry.delete_password();
    }

    Ok(())
}

// ==============================================================================
// Backward-Compatible Shims (For Initial Commits 51–53)
// ==============================================================================

/// Backward-compatible shim for single-token store command.
#[tauri::command]
pub fn store_secure_token(token: String) -> Result<(), String> {
    store_account_tokens(
        DEFAULT_ACCOUNT.to_string(),
        VaultSessionTokens {
            access_token: token,
            refresh_token: None,
        },
    )
}

/// Backward-compatible shim for single-token get command.
#[tauri::command]
pub fn get_secure_token() -> Option<String> {
    match get_account_tokens(None) {
        Ok(Some(tokens)) => Some(tokens.access_token),
        _ => None,
    }
}

/// Backward-compatible shim for single-token clear command.
#[tauri::command]
pub fn clear_secure_token() -> Result<(), String> {
    clear_account_tokens(None)
}

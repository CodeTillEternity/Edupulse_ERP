use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE_NAME: &str = "EduPulse_ERP_Desktop";
const DEFAULT_ACCOUNT: &str = "default_user";

/// Maximum permitted size for JWT tokens (8 KB) to prevent memory exhaustion & vault overflow (P2.2)
pub const MAX_TOKEN_BYTES: usize = 8192;

/// Maximum permitted length for account identifiers / usernames (128 chars)
pub const MAX_ACCOUNT_LENGTH: usize = 128;

/// Strongly-typed vault error enum distinguishing specific failure classes (P2.1 / P2.2)
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(tag = "code", content = "message")]
pub enum VaultError {
    EmptyToken,
    OversizedToken { field: String, size: usize, max: usize },
    InvalidAccountIdentifier(String),
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
            VaultError::OversizedToken { field, size, max } => {
                write!(f, "Token payload for '{}' exceeds maximum allowed size ({} > {} bytes)", field, size, max)
            }
            VaultError::InvalidAccountIdentifier(msg) => {
                write!(f, "Invalid account identifier: {}", msg)
            }
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

/// Validates and sanitizes account identifiers to prevent path traversal or null-byte injection (P2.2)
pub fn sanitize_account_identifier(account: &str) -> Result<String, VaultError> {
    let trimmed = account.trim();
    if trimmed.is_empty() {
        return Ok(DEFAULT_ACCOUNT.to_string());
    }

    if trimmed.len() > MAX_ACCOUNT_LENGTH {
        return Err(VaultError::InvalidAccountIdentifier(format!(
            "Account name exceeds maximum length ({} > {})",
            trimmed.len(),
            MAX_ACCOUNT_LENGTH
        )));
    }

    // Permitted characters: alphanumeric, hyphen, underscore, period, at-sign (for emails)
    let is_valid = trimmed.chars().all(|c| {
        c.is_alphanumeric() || c == '-' || c == '_' || c == '.' || c == '@'
    });

    if !is_valid {
        return Err(VaultError::InvalidAccountIdentifier(
            "Account name contains invalid characters. Only alphanumeric, '-', '_', '.', and '@' are permitted.".to_string()
        ));
    }

    Ok(trimmed.to_lowercase())
}

/// Validates token payload size and non-emptiness (P2.2)
pub fn validate_token_bytes(token: &str, field_name: &str) -> Result<(), VaultError> {
    let trimmed = token.trim();
    if trimmed.is_empty() {
        return Err(VaultError::EmptyToken);
    }

    if trimmed.len() > MAX_TOKEN_BYTES {
        return Err(VaultError::OversizedToken {
            field: field_name.to_string(),
            size: trimmed.len(),
            max: MAX_TOKEN_BYTES,
        });
    }

    Ok(())
}

/// Helper function to construct account-scoped credential keys,
/// preventing multiple EduPulse identities on a shared Windows profile from colliding (P2.1)
fn make_account_key(account: &str, token_type: &str) -> String {
    format!("{}:{}", account, token_type)
}

// ==============================================================================
// Primary Hardened Tauri Commands (P2.1 / P2.2)
// ==============================================================================

/// Securely stores an account-scoped access and refresh token pair into the Windows Credential Manager.
/// Validates input lengths and sanitizes account identifiers.
#[tauri::command]
pub fn store_account_tokens(account: String, tokens: VaultSessionTokens) -> Result<(), String> {
    // 1. Validate Access Token input boundaries (P2.2)
    validate_token_bytes(&tokens.access_token, "access_token")
        .map_err(|e| e.to_string())?;

    // 2. Validate Refresh Token input boundaries if present (P2.2)
    if let Some(ref rt) = tokens.refresh_token {
        if !rt.trim().is_empty() {
            validate_token_bytes(rt, "refresh_token").map_err(|e| e.to_string())?;
        }
    }

    // 3. Sanitize account identifier (P2.2)
    let sanitized_account = sanitize_account_identifier(&account)
        .map_err(|e| e.to_string())?;

    // 4. Store Access Token under account scope
    let access_key = make_account_key(&sanitized_account, "access_token");
    let access_entry = Entry::new(SERVICE_NAME, &access_key)
        .map_err(|e| VaultError::KeyringInitFailed(e.to_string()).to_string())?;

    access_entry
        .set_password(tokens.access_token.trim())
        .map_err(|e| VaultError::StorageFailed(e.to_string()).to_string())?;

    // 5. Store Refresh Token if provided
    if let Some(ref rt) = tokens.refresh_token {
        if !rt.trim().is_empty() {
            let refresh_key = make_account_key(&sanitized_account, "refresh_token");
            let refresh_entry = Entry::new(SERVICE_NAME, &refresh_key)
                .map_err(|e| VaultError::KeyringInitFailed(e.to_string()).to_string())?;

            refresh_entry
                .set_password(rt.trim())
                .map_err(|e| VaultError::StorageFailed(e.to_string()).to_string())?;
        }
    }

    // 6. Record last active account identifier for seamless startup hydration
    if let Ok(last_user_entry) = Entry::new(SERVICE_NAME, "last_active_account") {
        let _ = last_user_entry.set_password(&sanitized_account);
    }

    Ok(())
}

/// Retrieves the account-scoped tokens from the Windows Credential Manager.
/// If account is None, retrieves the last active account's tokens.
#[tauri::command]
pub fn get_account_tokens(account: Option<String>) -> Result<Option<VaultSessionTokens>, String> {
    let target_account = match account {
        Some(ref acc) if !acc.trim().is_empty() => {
            sanitize_account_identifier(acc).map_err(|e| e.to_string())?
        }
        _ => {
            // Retrieve last active account
            match Entry::new(SERVICE_NAME, "last_active_account").and_then(|e| e.get_password()) {
                Ok(last_acc) => sanitize_account_identifier(&last_acc).unwrap_or_else(|_| DEFAULT_ACCOUNT.to_string()),
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
        Some(ref acc) if !acc.trim().is_empty() => {
            sanitize_account_identifier(acc).map_err(|e| e.to_string())?
        }
        _ => match Entry::new(SERVICE_NAME, "last_active_account").and_then(|e| e.get_password()) {
            Ok(last_acc) => sanitize_account_identifier(&last_acc).unwrap_or_else(|_| DEFAULT_ACCOUNT.to_string()),
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_token_within_bounds() {
        let valid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M";
        assert!(validate_token_bytes(valid_token, "access_token").is_ok());
    }

    #[test]
    fn test_empty_token_rejected() {
        assert_eq!(
            validate_token_bytes("", "access_token"),
            Err(VaultError::EmptyToken)
        );
        assert_eq!(
            validate_token_bytes("   ", "access_token"),
            Err(VaultError::EmptyToken)
        );
    }

    #[test]
    fn test_oversized_token_rejected() {
        let huge_token = "a".repeat(MAX_TOKEN_BYTES + 1);
        let result = validate_token_bytes(&huge_token, "access_token");
        assert!(matches!(result, Err(VaultError::OversizedToken { .. })));
    }

    #[test]
    fn test_sanitize_account_valid() {
        assert_eq!(sanitize_account_identifier("alice.smith").unwrap(), "alice.smith");
        assert_eq!(sanitize_account_identifier("Teacher_123").unwrap(), "teacher_123");
        assert_eq!(sanitize_account_identifier("admin@edupulse.org").unwrap(), "admin@edupulse.org");
        assert_eq!(sanitize_account_identifier("").unwrap(), DEFAULT_ACCOUNT);
    }

    #[test]
    fn test_sanitize_account_invalid_chars() {
        assert!(sanitize_account_identifier("../../etc/passwd").is_err());
        assert!(sanitize_account_identifier("user; DROP TABLE students;").is_err());
        assert!(sanitize_account_identifier("user\0null").is_err());
    }

    #[test]
    fn test_sanitize_account_oversized() {
        let long_account = "a".repeat(MAX_ACCOUNT_LENGTH + 1);
        assert!(matches!(
            sanitize_account_identifier(&long_account),
            Err(VaultError::InvalidAccountIdentifier(_))
        ));
    }
}

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// Local installation record, saved to disk after successful activation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallationRecord {
    pub email: String,
    pub license_key: String,
    pub machine_fingerprint: String,
    pub installed_at: String,
}

/// Returns the path to the license storage file.
fn license_path(app_data_dir: &str) -> PathBuf {
    Path::new(app_data_dir).join("license.dat")
}

/// Saves an installation record to disk.
pub fn save(app_data_dir: &str, record: &InstallationRecord) -> Result<(), String> {
    let path = license_path(app_data_dir);

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Erro ao criar diretório: {}", e))?;
    }

    let json = serde_json::to_string(record)
        .map_err(|e| format!("Erro ao serializar licença: {}", e))?;

    // Simple obfuscation: base64 encode
    let encoded = base64_encode(json.as_bytes());

    fs::write(&path, encoded)
        .map_err(|e| format!("Erro ao salvar licença: {}", e))?;

    log::info!("Licença salva em {}", path.display());
    Ok(())
}

/// Loads an installation record from disk.
pub fn load(app_data_dir: &str) -> Option<InstallationRecord> {
    let path = license_path(app_data_dir);

    if !path.exists() {
        return None;
    }

    let encoded = fs::read_to_string(&path).ok()?;
    let decoded = base64_decode(&encoded)?;
    let json = String::from_utf8(decoded).ok()?;
    let record: InstallationRecord = serde_json::from_str(&json).ok()?;

    Some(record)
}

/// Deletes the local license file.
pub fn clear(app_data_dir: &str) {
    let path = license_path(app_data_dir);
    if path.exists() {
        fs::remove_file(&path).ok();
        log::info!("Licença local removida");
    }
}

// Simple base64 encode/decode without external crate
fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    let chunks = data.chunks(3);

    for chunk in chunks {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;

        result.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);

        if chunk.len() > 1 {
            result.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }

        if chunk.len() > 2 {
            result.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }

    result
}

fn base64_decode(input: &str) -> Option<Vec<u8>> {
    let input = input.trim();
    if input.is_empty() {
        return None;
    }

    fn char_to_val(c: u8) -> Option<u32> {
        match c {
            b'A'..=b'Z' => Some((c - b'A') as u32),
            b'a'..=b'z' => Some((c - b'a' + 26) as u32),
            b'0'..=b'9' => Some((c - b'0' + 52) as u32),
            b'+' => Some(62),
            b'/' => Some(63),
            _ => None,
        }
    }

    let bytes: Vec<u8> = input.bytes().filter(|&b| b != b'\n' && b != b'\r').collect();
    let mut result = Vec::new();

    for chunk in bytes.chunks(4) {
        if chunk.len() < 2 {
            break;
        }

        let a = char_to_val(chunk[0])?;
        let b = char_to_val(chunk[1])?;
        result.push(((a << 2) | (b >> 4)) as u8);

        if chunk.len() > 2 && chunk[2] != b'=' {
            let c = char_to_val(chunk[2])?;
            result.push((((b & 0xF) << 4) | (c >> 2)) as u8);

            if chunk.len() > 3 && chunk[3] != b'=' {
                let d = char_to_val(chunk[3])?;
                result.push((((c & 0x3) << 6) | d) as u8);
            }
        }
    }

    Some(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base64_roundtrip() {
        let original = b"hello world test data";
        let encoded = base64_encode(original);
        let decoded = base64_decode(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_record_roundtrip() {
        let temp = std::env::temp_dir()
            .join("deskcraft_storage_test")
            .to_string_lossy()
            .to_string();
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&temp).ok();

        let record = InstallationRecord {
            email: "test@example.com".to_string(),
            license_key: "KEY-123".to_string(),
            machine_fingerprint: "ABC123".to_string(),
            installed_at: "2025-01-01T00:00:00Z".to_string(),
        };

        save(&temp, &record).unwrap();
        let loaded = load(&temp).unwrap();
        assert_eq!(loaded.email, "test@example.com");
        assert_eq!(loaded.license_key, "KEY-123");

        let _ = fs::remove_dir_all(&temp);
    }
}

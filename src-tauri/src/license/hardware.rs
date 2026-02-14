use sha2::{Digest, Sha256};
use std::process::Command;

/// Computes a unique hardware fingerprint for the current machine.
/// Uses processor ID + motherboard serial, hashed with SHA-256.
/// Algorithm matches the C# HardwareHelper.ComputeHardwareId() for Windows.
pub fn get_hardware_id() -> String {
    let processor_id = get_processor_id();
    let motherboard_serial = get_motherboard_serial();

    if processor_id.is_empty() && motherboard_serial.is_empty() {
        log::warn!("Hardware ID: both processor and motherboard queries returned empty. Using hostname fallback.");
        let hostname = hostname::get()
            .map(|h| h.to_string_lossy().to_string())
            .unwrap_or_else(|_| "unknown-host".to_string());
        let composite = format!("PROC=;MB=;HOST={}", hostname);
        return compute_sha256(&composite);
    }

    if processor_id.is_empty() {
        log::warn!("Hardware ID: processor ID query returned empty");
    }
    if motherboard_serial.is_empty() {
        log::warn!("Hardware ID: motherboard serial query returned empty");
    }

    let composite = format!("PROC={};MB={}", processor_id, motherboard_serial);
    compute_sha256(&composite)
}

fn compute_sha256(input: &str) -> String {
    let result = Sha256::digest(input.as_bytes());
    result
        .iter()
        .map(|b| format!("{:02X}", b))
        .collect::<String>()
}

// ─── Windows ───────────────────────────────────────────────────────────

#[cfg(target_os = "windows")]
fn get_processor_id() -> String {
    run_wmic_query("cpu", "ProcessorId")
}

#[cfg(target_os = "windows")]
fn get_motherboard_serial() -> String {
    run_wmic_query("baseboard", "SerialNumber")
}

#[cfg(target_os = "windows")]
fn run_wmic_query(component: &str, field: &str) -> String {
    // Try PowerShell first (wmic is deprecated on newer Windows)
    if let Some(val) = try_powershell_query(component, field) {
        if !val.is_empty() {
            return val;
        }
    }

    // Fallback to wmic
    let output = Command::new("wmic")
        .args([component, "get", field])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            text.lines()
                .nth(1) // skip header line
                .unwrap_or("")
                .trim()
                .to_string()
        }
        Err(e) => {
            log::warn!("wmic query failed for {}/{}: {}", component, field, e);
            String::new()
        }
    }
}

#[cfg(target_os = "windows")]
fn try_powershell_query(component: &str, field: &str) -> Option<String> {
    let class = match component {
        "cpu" => "Win32_Processor",
        "baseboard" => "Win32_BaseBoard",
        _ => return None,
    };

    let script = format!(
        "(Get-CimInstance {}).{} | Select-Object -First 1",
        class, field
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &script])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);
    let val = text.trim().to_string();
    if val.is_empty() || val.contains("Error") {
        None
    } else {
        Some(val)
    }
}

// ─── macOS ─────────────────────────────────────────────────────────────

#[cfg(target_os = "macos")]
fn get_processor_id() -> String {
    let output = Command::new("sysctl")
        .args(["-n", "machdep.cpu.brand_string"])
        .output();

    match output {
        Ok(out) => String::from_utf8_lossy(&out.stdout).trim().to_string(),
        Err(_) => String::new(),
    }
}

#[cfg(target_os = "macos")]
fn get_motherboard_serial() -> String {
    let output = Command::new("ioreg")
        .args(["-d2", "-c", "IOPlatformExpertDevice"])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            for line in text.lines() {
                if line.contains("IOPlatformSerialNumber") {
                    if let Some(val) = line.split('"').nth(3) {
                        return val.to_string();
                    }
                }
            }
            String::new()
        }
        Err(_) => String::new(),
    }
}

// ─── Linux ─────────────────────────────────────────────────────────────

#[cfg(target_os = "linux")]
fn get_processor_id() -> String {
    std::fs::read_to_string("/etc/machine-id")
        .unwrap_or_default()
        .trim()
        .to_string()
}

#[cfg(target_os = "linux")]
fn get_motherboard_serial() -> String {
    std::fs::read_to_string("/sys/class/dmi/id/board_serial")
        .unwrap_or_default()
        .trim()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sha256_deterministic() {
        let h1 = compute_sha256("test input");
        let h2 = compute_sha256("test input");
        assert_eq!(h1, h2);
        assert_eq!(h1.len(), 64); // SHA-256 = 32 bytes = 64 hex chars
    }

    #[test]
    fn test_hardware_id_not_empty() {
        let id = get_hardware_id();
        assert!(!id.is_empty());
        assert_eq!(id.len(), 64);
    }
}

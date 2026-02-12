use serde::{Deserialize, Serialize};
use tauri::State;

use crate::license::{hardware, service, storage};
use crate::AppState;

/// License status returned to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseStatus {
    pub is_licensed: bool,
    pub email: String,
    pub hardware_id: String,
    pub message: String,
}

/// Checks if the app has a valid license.
/// 1. Loads local license file
/// 2. If exists, verifies online (with offline fallback)
/// 3. Returns status
#[tauri::command]
pub async fn check_license(state: State<'_, AppState>) -> Result<LicenseStatus, String> {
    let app_data_dir = state.app_data_dir.clone();
    let hardware_id = hardware::get_hardware_id();

    // Check local storage
    let record = match storage::load(&app_data_dir) {
        Some(r) => r,
        None => {
            return Ok(LicenseStatus {
                is_licensed: false,
                email: String::new(),
                hardware_id,
                message: "Nenhuma licença encontrada.".into(),
            });
        }
    };

    // Verify online
    let result = service::verify_license(&record.email, &hardware_id).await;

    if result.success {
        log::info!("Licença verificada com sucesso para {}", record.email);
        return Ok(LicenseStatus {
            is_licensed: true,
            email: record.email,
            hardware_id,
            message: "Licença ativa.".into(),
        });
    }

    // If network error, allow offline use with cached license
    if result.code == "TIMEOUT" || result.code == "NETWORK_ERROR" {
        log::warn!(
            "Verificação online falhou ({}), usando licença local",
            result.code
        );
        return Ok(LicenseStatus {
            is_licensed: true,
            email: record.email,
            hardware_id,
            message: "Licença ativa (modo offline).".into(),
        });
    }

    // License explicitly invalid — clear local cache
    log::warn!("Licença inválida: {}", result.message);
    storage::clear(&app_data_dir);

    Ok(LicenseStatus {
        is_licensed: false,
        email: String::new(),
        hardware_id,
        message: result.message,
    })
}

/// Activates a license by email.
/// 1. Gets hardware fingerprint
/// 2. Calls activate API
/// 3. On success, saves locally
#[tauri::command]
pub async fn activate_license(
    email: String,
    state: State<'_, AppState>,
) -> Result<LicenseStatus, String> {
    let app_data_dir = state.app_data_dir.clone();
    let hardware_id = hardware::get_hardware_id();

    if email.trim().is_empty() {
        return Ok(LicenseStatus {
            is_licensed: false,
            email: String::new(),
            hardware_id,
            message: "Informe seu e-mail de compra.".into(),
        });
    }

    let result = service::activate_license(&email, &hardware_id).await;

    if result.success {
        // Save locally
        let record = storage::InstallationRecord {
            email: email.trim().to_lowercase(),
            license_key: result.code.clone(),
            machine_fingerprint: hardware_id.clone(),
            installed_at: chrono::Utc::now().to_rfc3339(),
        };

        storage::save(&app_data_dir, &record)
            .map_err(|e| format!("Licença ativada mas erro ao salvar: {}", e))?;

        log::info!("Licença ativada com sucesso para {}", email);

        return Ok(LicenseStatus {
            is_licensed: true,
            email: email.trim().to_lowercase(),
            hardware_id,
            message: result.message,
        });
    }

    Ok(LicenseStatus {
        is_licensed: false,
        email: String::new(),
        hardware_id,
        message: result.message,
    })
}

/// Returns the hardware fingerprint for this machine.
#[tauri::command]
pub fn get_hardware_id() -> String {
    hardware::get_hardware_id()
}

/// Removes the local license (logout).
#[tauri::command]
pub fn logout_license(state: State<'_, AppState>) -> Result<(), String> {
    storage::clear(&state.app_data_dir);
    Ok(())
}

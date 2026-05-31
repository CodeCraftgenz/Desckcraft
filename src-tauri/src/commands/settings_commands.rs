use std::process::Command;
use tauri::State;

use crate::db::models::Setting;
use crate::db::queries::settings;
use crate::AppState;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg(target_os = "windows")]
const RUN_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
#[cfg(target_os = "windows")]
const APP_VALUE_NAME: &str = "DeskCraft";

/// Configures whether DeskCraft launches automatically with Windows.
/// Writes/removes the registry entry under HKCU Run via `reg.exe`.
#[tauri::command]
pub fn set_startup_with_windows(enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        if enabled {
            let exe = std::env::current_exe()
                .map_err(|e| format!("Falha ao obter caminho do executável: {}", e))?;
            let exe_str = exe.to_string_lossy().to_string();
            let value_data = format!("\"{}\" --minimized", exe_str);

            let output = Command::new("reg")
                .args([
                    "add",
                    RUN_KEY,
                    "/v",
                    APP_VALUE_NAME,
                    "/t",
                    "REG_SZ",
                    "/d",
                    &value_data,
                    "/f",
                ])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| format!("Falha ao executar reg add: {}", e))?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(format!("reg add falhou: {}", stderr.trim()));
            }
        } else {
            let output = Command::new("reg")
                .args(["delete", RUN_KEY, "/v", APP_VALUE_NAME, "/f"])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| format!("Falha ao executar reg delete: {}", e))?;

            // reg delete returns error if the value doesn't exist — that's fine.
            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let lower = stderr.to_lowercase();
                if !lower.contains("unable to find") && !lower.contains("não conseguiu") && !lower.contains("nao conseguiu") {
                    return Err(format!("reg delete falhou: {}", stderr.trim()));
                }
            }
        }
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = enabled;
        Ok(())
    }
}

#[tauri::command]
pub fn get_setting(key: String, state: State<AppState>) -> Result<Option<String>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    settings::get_setting(&conn, &key).map_err(|e| format!("Falha ao obter configuração: {}", e))
}

#[tauri::command]
pub fn set_setting(key: String, value: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    settings::set_setting(&conn, &key, &value)
        .map_err(|e| format!("Falha ao salvar configuração: {}", e))
}

#[tauri::command]
pub fn get_all_settings(state: State<AppState>) -> Result<Vec<Setting>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    settings::get_all_settings(&conn).map_err(|e| format!("Falha ao obter configurações: {}", e))
}

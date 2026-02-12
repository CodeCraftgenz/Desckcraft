use tauri::State;

use crate::db::models::Setting;
use crate::db::queries::settings;
use crate::AppState;

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

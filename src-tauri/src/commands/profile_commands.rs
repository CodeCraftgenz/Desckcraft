use tauri::State;

use crate::db::models::{Profile, Rule};
use crate::db::queries::profiles;
use crate::AppState;

#[tauri::command]
pub fn list_profiles(state: State<AppState>) -> Result<Vec<Profile>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::list_profiles(&conn).map_err(|e| format!("Falha ao listar perfis: {}", e))
}

#[tauri::command]
pub fn create_profile(
    name: String,
    icon: String,
    color: String,
    state: State<AppState>,
) -> Result<Profile, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::create_profile(&conn, &name, &icon, &color)
        .map_err(|e| format!("Falha ao criar perfil: {}", e))
}

#[tauri::command]
pub fn activate_profile(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::activate_profile(&conn, &id)
        .map_err(|e| format!("Falha ao ativar perfil: {}", e))
}

#[tauri::command]
pub fn delete_profile(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::delete_profile(&conn, &id).map_err(|e| format!("Falha ao excluir perfil: {}", e))
}

#[tauri::command]
pub fn get_profile_rules(
    profile_id: String,
    state: State<AppState>,
) -> Result<Vec<Rule>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::get_profile_rules(&conn, &profile_id)
        .map_err(|e| format!("Falha ao obter regras do perfil: {}", e))
}

#[tauri::command]
pub fn add_rule_to_profile(
    profile_id: String,
    rule_id: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::add_rule_to_profile(&conn, &profile_id, &rule_id)
        .map_err(|e| format!("Falha ao adicionar regra ao perfil: {}", e))
}

#[tauri::command]
pub fn remove_rule_from_profile(
    profile_id: String,
    rule_id: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    profiles::remove_rule_from_profile(&conn, &profile_id, &rule_id)
        .map_err(|e| format!("Falha ao remover regra do perfil: {}", e))
}

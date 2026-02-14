use tauri::State;

use crate::db::models::Schedule;
use crate::db::queries::{schedules, watched_folders};
use crate::AppState;

#[tauri::command]
pub fn list_schedules(state: State<AppState>) -> Result<Vec<Schedule>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    schedules::list_schedules(&conn)
        .map_err(|e| format!("Falha ao listar agendamentos: {}", e))
}

#[tauri::command]
pub fn create_schedule(
    profile_id: String,
    folder_id: String,
    cron_expr: String,
    state: State<AppState>,
) -> Result<Schedule, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;

    // folder_id may be a file-system path instead of a watched_folders UUID.
    // Resolve it: look up (or create) the watched_folder by path and use its ID.
    let resolved_folder_id = if folder_id.contains('\\') || folder_id.contains('/') || folder_id.contains(':') {
        let folder = watched_folders::find_or_create_by_path(&conn, &folder_id, &profile_id)
            .map_err(|e| format!("Falha ao registrar pasta: {}", e))?;
        folder.id
    } else {
        folder_id
    };

    schedules::create_schedule(&conn, &profile_id, &resolved_folder_id, &cron_expr)
        .map_err(|e| format!("Falha ao criar agendamento: {}", e))
}

#[tauri::command]
pub fn update_schedule(
    id: String,
    cron_expr: String,
    is_enabled: bool,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    schedules::update_schedule(&conn, &id, &cron_expr, is_enabled)
        .map_err(|e| format!("Falha ao atualizar agendamento: {}", e))
}

#[tauri::command]
pub fn delete_schedule(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    schedules::delete_schedule(&conn, &id)
        .map_err(|e| format!("Falha ao excluir agendamento: {}", e))
}

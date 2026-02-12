use tauri::State;

use crate::db::models::Schedule;
use crate::db::queries::schedules;
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
    schedules::create_schedule(&conn, &profile_id, &folder_id, &cron_expr)
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

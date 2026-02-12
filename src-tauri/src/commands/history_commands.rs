use tauri::State;

use crate::db::models::{Run, RunItem};
use crate::db::queries::runs;
use crate::AppState;

#[tauri::command]
pub fn list_runs(
    limit: i32,
    offset: i32,
    state: State<AppState>,
) -> Result<Vec<Run>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    runs::list_runs(&conn, limit, offset)
        .map_err(|e| format!("Falha ao listar execuções: {}", e))
}

#[tauri::command]
pub fn get_run(id: String, state: State<AppState>) -> Result<Option<Run>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    runs::get_run(&conn, &id).map_err(|e| format!("Falha ao obter execução: {}", e))
}

#[tauri::command]
pub fn list_run_items(run_id: String, state: State<AppState>) -> Result<Vec<RunItem>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    runs::get_run_items(&conn, &run_id)
        .map_err(|e| format!("Falha ao obter itens da execução: {}", e))
}

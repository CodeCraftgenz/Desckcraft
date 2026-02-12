use tauri::State;

use crate::db::models::WatchedFolder;
use crate::db::queries::watched_folders;
use crate::AppState;

#[tauri::command]
pub fn list_watched_folders(state: State<AppState>) -> Result<Vec<WatchedFolder>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    watched_folders::list_watched_folders(&conn)
        .map_err(|e| format!("Falha ao listar pastas monitoradas: {}", e))
}

#[tauri::command]
pub fn add_watched_folder(
    path: String,
    profile_id: String,
    watch_mode: String,
    state: State<AppState>,
) -> Result<WatchedFolder, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    watched_folders::add_watched_folder(&conn, &path, &profile_id, &watch_mode)
        .map_err(|e| format!("Falha ao adicionar pasta monitorada: {}", e))
}

#[tauri::command]
pub fn remove_watched_folder(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    watched_folders::remove_watched_folder(&conn, &id)
        .map_err(|e| format!("Falha ao remover pasta monitorada: {}", e))
}

#[tauri::command]
pub fn update_watch_mode(
    id: String,
    watch_mode: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    watched_folders::update_watch_mode(&conn, &id, &watch_mode)
        .map_err(|e| format!("Falha ao atualizar modo de monitoramento: {}", e))
}

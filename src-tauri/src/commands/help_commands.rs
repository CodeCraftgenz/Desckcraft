use tauri::State;

use crate::db::models::{HelpFavorite, HelpView};
use crate::db::queries::help;
use crate::AppState;

#[tauri::command]
pub fn list_help_favorites(state: State<AppState>) -> Result<Vec<HelpFavorite>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    help::list_favorites(&conn).map_err(|e| format!("Falha ao listar favoritos: {}", e))
}

#[tauri::command]
pub fn add_help_favorite(article_slug: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    help::add_favorite(&conn, &article_slug)
        .map_err(|e| format!("Falha ao adicionar favorito: {}", e))
}

#[tauri::command]
pub fn remove_help_favorite(article_slug: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    help::remove_favorite(&conn, &article_slug)
        .map_err(|e| format!("Falha ao remover favorito: {}", e))
}

#[tauri::command]
pub fn is_help_favorite(article_slug: String, state: State<AppState>) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    help::is_favorite(&conn, &article_slug)
        .map_err(|e| format!("Falha ao verificar favorito: {}", e))
}

#[tauri::command]
pub fn record_help_view(article_slug: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    help::record_view(&conn, &article_slug)
        .map_err(|e| format!("Falha ao registrar visualização: {}", e))
}

#[tauri::command]
pub fn recent_help_views(
    limit: Option<i32>,
    state: State<AppState>,
) -> Result<Vec<HelpView>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    let limit = limit.unwrap_or(20);
    help::recent_views(&conn, limit).map_err(|e| format!("Falha ao obter visualizações recentes: {}", e))
}

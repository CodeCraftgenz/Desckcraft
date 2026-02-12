use tauri::State;

use crate::db::models::TourState;
use crate::db::queries::tour;
use crate::AppState;

#[tauri::command]
pub fn get_tour_state(state: State<AppState>) -> Result<TourState, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    tour::get_tour_state(&conn).map_err(|e| format!("Falha ao obter estado do tour: {}", e))
}

#[tauri::command]
pub fn update_tour_step(step: i32, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    tour::update_tour_step(&conn, step)
        .map_err(|e| format!("Falha ao atualizar passo do tour: {}", e))
}

#[tauri::command]
pub fn complete_tour(state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    tour::complete_tour(&conn).map_err(|e| format!("Falha ao completar tour: {}", e))
}

#[tauri::command]
pub fn skip_tour(state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    tour::skip_tour(&conn).map_err(|e| format!("Falha ao pular tour: {}", e))
}

#[tauri::command]
pub fn reset_tour(state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    tour::reset_tour(&conn).map_err(|e| format!("Falha ao resetar tour: {}", e))
}

use tauri::State;

use crate::db::queries::tips;
use crate::tips::engine::{self, TipSuggestion};
use crate::AppState;

/// Evaluates all tip heuristics for a folder and returns applicable suggestions.
#[tauri::command]
pub fn evaluate_tips(
    folder_path: String,
    state: State<AppState>,
) -> Result<Vec<TipSuggestion>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;

    let tip_states = tips::get_all_tip_states(&conn)
        .map_err(|e| format!("Falha ao avaliar dicas: {}", e))?;

    let suggestions = engine::evaluate_tips(&folder_path, &tip_states);
    Ok(suggestions)
}

/// Marks a tip as accepted (the user acted on it).
#[tauri::command]
pub fn accept_tip(tip_id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    tips::accept_tip(&conn, &tip_id).map_err(|e| format!("Falha ao aceitar dica: {}", e))
}

/// Dismisses a tip with an optional cooldown period in hours.
#[tauri::command]
pub fn dismiss_tip(
    tip_id: String,
    cooldown_hours: Option<i64>,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    let hours = cooldown_hours.unwrap_or(0);
    tips::dismiss_tip(&conn, &tip_id, hours)
        .map_err(|e| format!("Falha ao dispensar dica: {}", e))
}

use tauri::State;

use crate::db::models::{Rule, RuleAction, RuleCondition};
use crate::db::queries::rules;
use crate::AppState;

// ── Rule CRUD ─────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_rules(state: State<AppState>) -> Result<Vec<Rule>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::list_rules(&conn).map_err(|e| format!("Falha ao listar regras: {}", e))
}

#[tauri::command]
pub fn get_rule(id: String, state: State<AppState>) -> Result<Option<Rule>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::get_rule(&conn, &id).map_err(|e| format!("Falha ao obter regra: {}", e))
}

#[tauri::command]
pub fn create_rule(
    name: String,
    description: String,
    state: State<AppState>,
) -> Result<Rule, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::create_rule(&conn, &name, &description)
        .map_err(|e| format!("Falha ao criar regra: {}", e))
}

#[tauri::command]
pub fn update_rule(
    id: String,
    name: String,
    description: String,
    is_enabled: bool,
    priority: i32,
    state: State<AppState>,
) -> Result<Rule, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::update_rule(&conn, &id, &name, &description, is_enabled, priority)
        .map_err(|e| format!("Falha ao atualizar regra: {}", e))
}

#[tauri::command]
pub fn delete_rule(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::delete_rule(&conn, &id).map_err(|e| format!("Falha ao excluir regra: {}", e))
}

// ── Rule Conditions ───────────────────────────────────────────────────────

#[tauri::command]
pub fn get_rule_conditions(
    rule_id: String,
    state: State<AppState>,
) -> Result<Vec<RuleCondition>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::get_conditions(&conn, &rule_id)
        .map_err(|e| format!("Falha ao obter condições: {}", e))
}

#[tauri::command]
pub fn add_rule_condition(
    rule_id: String,
    field: String,
    operator: String,
    value: String,
    logic_gate: String,
    state: State<AppState>,
) -> Result<RuleCondition, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::add_condition(&conn, &rule_id, &field, &operator, &value, &logic_gate)
        .map_err(|e| format!("Falha ao adicionar condição: {}", e))
}

#[tauri::command]
pub fn delete_rule_condition(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::delete_condition(&conn, &id)
        .map_err(|e| format!("Falha ao excluir condição: {}", e))
}

// ── Rule Actions ──────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_rule_actions(
    rule_id: String,
    state: State<AppState>,
) -> Result<Vec<RuleAction>, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::get_actions(&conn, &rule_id)
        .map_err(|e| format!("Falha ao obter ações: {}", e))
}

#[tauri::command]
pub fn add_rule_action(
    rule_id: String,
    action_type: String,
    destination: String,
    rename_pattern: String,
    tag_name: String,
    state: State<AppState>,
) -> Result<RuleAction, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::add_action(
        &conn,
        &rule_id,
        &action_type,
        &destination,
        &rename_pattern,
        &tag_name,
    )
    .map_err(|e| format!("Falha ao adicionar ação: {}", e))
}

#[tauri::command]
pub fn delete_rule_action(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rules::delete_action(&conn, &id)
        .map_err(|e| format!("Falha ao excluir ação: {}", e))
}

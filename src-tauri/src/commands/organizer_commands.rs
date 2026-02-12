use std::collections::HashMap;
use tauri::State;

use crate::db::models::{ExecutionResult, FileEntry, SimulationResult};
use crate::db::queries::{profiles, rules, runs, settings};
use crate::organizer::{executor, rollback, scanner, simulator};
use crate::AppState;

/// Scans a folder and returns a list of file entries with metadata.
#[tauri::command]
pub fn scan_folder(path: String, _state: State<AppState>) -> Result<Vec<FileEntry>, String> {
    scanner::scan_folder(&path, false).map_err(|e| format!("Falha ao escanear pasta: {}", e))
}

/// Simulates file organization for a folder using the active profile's rules
/// (or a specified profile). Does not move any files.
#[tauri::command]
pub fn simulate_folder(
    path: String,
    profile_id: Option<String>,
    state: State<AppState>,
) -> Result<SimulationResult, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;

    // Determine which profile to use
    let pid = match profile_id {
        Some(id) => id,
        None => {
            let active = profiles::get_active_profile(&conn)
                .map_err(|e| format!("Falha ao obter perfil ativo: {}", e))?;
            match active {
                Some(p) => p.id,
                None => return Err("Nenhum perfil ativo encontrado".to_string()),
            }
        }
    };

    // Get profile rules
    let profile_rules = profiles::get_profile_rules(&conn, &pid)
        .map_err(|e| format!("Falha ao obter regras do perfil: {}", e))?;

    if profile_rules.is_empty() {
        return Err("Nenhuma regra configurada para este perfil".to_string());
    }

    // Load conditions and actions for each rule
    let mut conditions_map: HashMap<String, Vec<crate::db::models::RuleCondition>> = HashMap::new();
    let mut actions_map: HashMap<String, Vec<crate::db::models::RuleAction>> = HashMap::new();

    for rule in &profile_rules {
        let conds = rules::get_conditions(&conn, &rule.id)
            .map_err(|e| format!("Falha ao obter condições da regra {}: {}", rule.id, e))?;
        let acts = rules::get_actions(&conn, &rule.id)
            .map_err(|e| format!("Falha ao obter ações da regra {}: {}", rule.id, e))?;
        conditions_map.insert(rule.id.clone(), conds);
        actions_map.insert(rule.id.clone(), acts);
    }

    // Scan the folder
    let files = scanner::scan_folder(&path, false)
        .map_err(|e| format!("Falha ao escanear pasta: {}", e))?;

    // Simulate
    let result = simulator::simulate(&files, &profile_rules, &conditions_map, &actions_map);
    Ok(result)
}

/// Executes a simulation result, actually moving files.
/// Expects a JSON-serialized SimulationResult.
#[tauri::command]
pub fn execute_simulation(
    simulation_json: String,
    state: State<AppState>,
) -> Result<ExecutionResult, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;

    let simulation: SimulationResult = serde_json::from_str(&simulation_json)
        .map_err(|e| format!("JSON de simulação inválido: {}", e))?;

    // Get the active profile
    let active_profile = profiles::get_active_profile(&conn)
        .map_err(|e| format!("Falha ao obter perfil ativo: {}", e))?
        .ok_or_else(|| "Nenhum perfil ativo encontrado".to_string())?;

    // Get conflict strategy from settings
    let conflict_strategy = settings::get_setting(&conn, "conflict_strategy")
        .map_err(|e| format!("Falha ao obter estratégia de conflito: {}", e))?
        .unwrap_or_else(|| "suffix".to_string());

    // Determine source folder from the first item
    let source_folder = simulation
        .items
        .first()
        .map(|item| {
            std::path::Path::new(&item.file.path)
                .parent()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_default()
        })
        .unwrap_or_default();

    // Create a run record
    let run = runs::create_run(&conn, &active_profile.id, "manual", &source_folder)
        .map_err(|e| format!("Falha ao criar execução: {}", e))?;

    // Execute
    let result = executor::execute(&conn, &simulation, &run.id, &conflict_strategy)
        .map_err(|e| format!("Falha na execução: {}", e))?;

    Ok(result)
}

/// Rolls back a previous run, moving files back to their original locations.
#[tauri::command]
pub fn rollback_run(run_id: String, state: State<AppState>) -> Result<u32, String> {
    let conn = state.db.lock().map_err(|e| format!("Erro de acesso ao banco de dados: {}", e))?;
    rollback::rollback_run(&conn, &run_id).map_err(|e| format!("Falha ao reverter: {}", e))
}

/// Opens a native folder picker dialog and returns the selected path.
#[tauri::command]
pub async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let folder = app
        .dialog()
        .file()
        .set_title("Selecionar pasta")
        .blocking_pick_folder();
    Ok(folder.map(|p| p.to_string()))
}

pub mod commands;
pub mod db;
pub mod license;
pub mod logger;
pub mod organizer;
pub mod rules;
pub mod tips;
pub mod watcher;

use std::sync::Mutex;

use commands::help_commands;
use commands::history_commands;
use commands::license_commands;
use commands::organizer_commands;
use commands::profile_commands;
use commands::rule_commands;
use commands::schedule_commands;
use commands::settings_commands;
use commands::tips_commands;
use commands::tour_commands;
use commands::watched_folder_commands;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
    pub app_data_dir: String,
}

pub fn run() {
    env_logger::init();
    log::info!("Starting DeskCraft...");

    let app_data_dir = dirs_next_app_data();
    let conn = db::connection::init(&app_data_dir)
        .expect("Failed to initialize database");

    // Spawn background scheduler thread with its own DB connection
    let scheduler_data_dir = app_data_dir.clone();
    std::thread::spawn(move || {
        scheduler_loop(&scheduler_data_dir);
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            db: Mutex::new(conn),
            app_data_dir: app_data_dir.clone(),
        })
        .invoke_handler(tauri::generate_handler![
            // Organizer commands
            organizer_commands::scan_folder,
            organizer_commands::simulate_folder,
            organizer_commands::execute_simulation,
            organizer_commands::rollback_run,
            organizer_commands::select_folder,
            // Rule commands
            rule_commands::list_rules,
            rule_commands::get_rule,
            rule_commands::create_rule,
            rule_commands::update_rule,
            rule_commands::delete_rule,
            rule_commands::get_rule_conditions,
            rule_commands::add_rule_condition,
            rule_commands::delete_rule_condition,
            rule_commands::get_rule_actions,
            rule_commands::add_rule_action,
            rule_commands::delete_rule_action,
            // Profile commands
            profile_commands::list_profiles,
            profile_commands::create_profile,
            profile_commands::activate_profile,
            profile_commands::delete_profile,
            profile_commands::get_profile_rules,
            profile_commands::add_rule_to_profile,
            profile_commands::remove_rule_from_profile,
            // Settings commands
            settings_commands::get_setting,
            settings_commands::set_setting,
            settings_commands::get_all_settings,
            // Help commands
            help_commands::list_help_favorites,
            help_commands::add_help_favorite,
            help_commands::remove_help_favorite,
            help_commands::is_help_favorite,
            help_commands::record_help_view,
            help_commands::recent_help_views,
            // Tour commands
            tour_commands::get_tour_state,
            tour_commands::update_tour_step,
            tour_commands::complete_tour,
            tour_commands::skip_tour,
            tour_commands::reset_tour,
            // Tips commands
            tips_commands::evaluate_tips,
            tips_commands::accept_tip,
            tips_commands::dismiss_tip,
            // History commands
            history_commands::list_runs,
            history_commands::get_run,
            history_commands::list_run_items,
            // Watched folder commands
            watched_folder_commands::list_watched_folders,
            watched_folder_commands::add_watched_folder,
            watched_folder_commands::remove_watched_folder,
            watched_folder_commands::update_watch_mode,
            // Schedule commands
            schedule_commands::list_schedules,
            schedule_commands::create_schedule,
            schedule_commands::update_schedule,
            schedule_commands::delete_schedule,
            // License commands
            license_commands::check_license,
            license_commands::activate_license,
            license_commands::get_hardware_id,
            license_commands::logout_license,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running DeskCraft");
}

/// Background scheduler loop.
/// Opens its own DB connection and checks for due schedules every 30 seconds.
fn scheduler_loop(app_data_dir: &str) {
    // Wait a few seconds for the app to fully start
    std::thread::sleep(std::time::Duration::from_secs(5));

    log::info!("Scheduler background loop started");

    let conn = match db::connection::init(app_data_dir) {
        Ok(c) => c,
        Err(e) => {
            log::error!("Scheduler failed to open DB: {}", e);
            return;
        }
    };

    loop {
        std::thread::sleep(std::time::Duration::from_secs(30));

        let due = match db::queries::schedules::get_due_schedules(&conn) {
            Ok(d) => d,
            Err(e) => {
                log::warn!("Scheduler: failed to query due schedules: {}", e);
                continue;
            }
        };

        if due.is_empty() {
            continue;
        }

        log::info!("Scheduler: {} schedule(s) due for execution", due.len());

        for schedule in &due {
            let folder_path = match db::queries::schedules::get_schedule_folder_path(
                &conn,
                &schedule.folder_id,
            ) {
                Ok(p) => p,
                Err(e) => {
                    log::error!(
                        "Scheduler: failed to get folder for schedule {}: {}",
                        schedule.id, e
                    );
                    let _ = db::queries::schedules::mark_schedule_run(
                        &conn, &schedule.id, &schedule.cron_expr,
                    );
                    continue;
                }
            };

            log::info!(
                "Scheduler: running schedule {} — profile={}, folder={}",
                schedule.id, schedule.profile_id, folder_path
            );

            match run_scheduled_organization(&conn, &schedule.profile_id, &folder_path) {
                Ok((moved, skipped, errors)) => {
                    log::info!(
                        "Scheduler: schedule {} done — moved={}, skipped={}, errors={}",
                        schedule.id, moved, skipped, errors
                    );
                }
                Err(e) => {
                    log::error!("Scheduler: schedule {} failed: {}", schedule.id, e);
                }
            }

            if let Err(e) = db::queries::schedules::mark_schedule_run(
                &conn, &schedule.id, &schedule.cron_expr,
            ) {
                log::error!("Scheduler: failed to update schedule {}: {}", schedule.id, e);
            }
        }
    }
}

/// Runs the organizer for a scheduled profile on a folder.
/// Returns (moved, skipped, errors).
fn run_scheduled_organization(
    conn: &rusqlite::Connection,
    profile_id: &str,
    folder_path: &str,
) -> anyhow::Result<(u32, u32, u32)> {
    use std::collections::HashMap;

    let profile_rules = db::queries::profiles::get_profile_rules(conn, profile_id)?;
    if profile_rules.is_empty() {
        anyhow::bail!("Nenhuma regra configurada para o perfil {}", profile_id);
    }

    let mut conditions_map: HashMap<String, Vec<db::models::RuleCondition>> = HashMap::new();
    let mut actions_map: HashMap<String, Vec<db::models::RuleAction>> = HashMap::new();

    for rule in &profile_rules {
        conditions_map.insert(rule.id.clone(), db::queries::rules::get_conditions(conn, &rule.id)?);
        actions_map.insert(rule.id.clone(), db::queries::rules::get_actions(conn, &rule.id)?);
    }

    let files = organizer::scanner::scan_folder(folder_path, false)?;
    if files.is_empty() {
        return Ok((0, 0, 0));
    }

    let simulation = organizer::simulator::simulate(&files, &profile_rules, &conditions_map, &actions_map);
    if simulation.matched_files == 0 {
        return Ok((0, simulation.unmatched_files, 0));
    }

    let conflict_strategy = db::queries::settings::get_setting(conn, "conflict_strategy")?
        .unwrap_or_else(|| "suffix".to_string());

    let run = db::queries::runs::create_run(conn, profile_id, "scheduled", folder_path)?;
    let result = organizer::executor::execute(conn, &simulation, &run.id, &conflict_strategy)?;

    Ok((result.moved, result.skipped, result.errors))
}

/// Returns a sensible default app data directory for DeskCraft.
fn dirs_next_app_data() -> String {
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let path = std::path::Path::new(&appdata).join("com.deskcraft.app");
            std::fs::create_dir_all(&path).ok();
            return path.to_string_lossy().to_string();
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        if let Some(home) = std::env::var_os("HOME") {
            let path = std::path::Path::new(&home)
                .join(".local")
                .join("share")
                .join("com.deskcraft.app");
            std::fs::create_dir_all(&path).ok();
            return path.to_string_lossy().to_string();
        }
    }
    let fallback = std::path::Path::new(".").join("deskcraft_data");
    std::fs::create_dir_all(&fallback).ok();
    fallback.to_string_lossy().to_string()
}

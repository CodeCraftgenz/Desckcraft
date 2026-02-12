use anyhow::{Context, Result};
use rusqlite::Connection;
use std::fs;
use std::path::Path;

use crate::db::models::{ExecutionResult, SimulationResult};
use crate::db::queries::runs;
use crate::organizer::conflict;

/// Executes a simulation result, actually moving files and recording each action
/// in the database as run items.
pub fn execute(
    conn: &Connection,
    simulation: &SimulationResult,
    run_id: &str,
    conflict_strategy: &str,
) -> Result<ExecutionResult> {
    let mut moved: u32 = 0;
    let mut skipped: u32 = 0;
    let mut errors: u32 = 0;
    let mut error_messages: Vec<String> = Vec::new();

    for item in &simulation.items {
        if item.destination.is_empty() {
            skipped += 1;
            runs::create_run_item(
                conn,
                run_id,
                Some(&item.rule_id),
                &item.file.path,
                "",
                item.file.size as i64,
                &item.action_type,
                "skipped",
                conflict_strategy,
            )
            .ok();
            continue;
        }

        let source = Path::new(&item.file.path);
        let mut dest = std::path::PathBuf::from(&item.destination);

        // If the destination is a directory, place the file inside it
        if dest.is_dir() || item.destination.ends_with('/') || item.destination.ends_with('\\') {
            dest = dest.join(&item.file.name);
        }

        // Handle conflicts
        if dest.exists() {
            dest = conflict::resolve_conflict(&dest, conflict_strategy);
            if conflict_strategy == "skip" && dest.exists() {
                skipped += 1;
                runs::create_run_item(
                    conn,
                    run_id,
                    Some(&item.rule_id),
                    &item.file.path,
                    &dest.to_string_lossy(),
                    item.file.size as i64,
                    &item.action_type,
                    "skipped",
                    conflict_strategy,
                )
                .ok();
                continue;
            }
        }

        // Ensure destination directory exists
        if let Some(parent) = dest.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                let msg = format!(
                    "Failed to create directory {}: {}",
                    parent.display(),
                    e
                );
                log::error!("{}", msg);
                error_messages.push(msg);
                errors += 1;

                runs::create_run_item(
                    conn,
                    run_id,
                    Some(&item.rule_id),
                    &item.file.path,
                    &dest.to_string_lossy(),
                    item.file.size as i64,
                    &item.action_type,
                    "error",
                    conflict_strategy,
                )
                .ok();
                continue;
            }
        }

        // Move the file
        match move_file(source, &dest) {
            Ok(()) => {
                moved += 1;
                runs::create_run_item(
                    conn,
                    run_id,
                    Some(&item.rule_id),
                    &item.file.path,
                    &dest.to_string_lossy(),
                    item.file.size as i64,
                    &item.action_type,
                    "completed",
                    conflict_strategy,
                )
                .ok();
            }
            Err(e) => {
                let msg = format!(
                    "Failed to move {} -> {}: {}",
                    source.display(),
                    dest.display(),
                    e
                );
                log::error!("{}", msg);
                error_messages.push(msg);
                errors += 1;

                runs::create_run_item(
                    conn,
                    run_id,
                    Some(&item.rule_id),
                    &item.file.path,
                    &dest.to_string_lossy(),
                    item.file.size as i64,
                    &item.action_type,
                    "error",
                    conflict_strategy,
                )
                .ok();
            }
        }
    }

    // Update the run record with final counts
    let status = if errors > 0 && moved == 0 {
        "error"
    } else if errors > 0 {
        "completed_with_errors"
    } else {
        "completed"
    };

    runs::update_run_status(conn, run_id, status, moved as i32, skipped as i32, errors as i32)
        .ok();

    Ok(ExecutionResult {
        run_id: run_id.to_string(),
        total: moved + skipped + errors,
        moved,
        skipped,
        errors,
        error_messages,
    })
}

/// Moves a file from source to destination. Tries `fs::rename` first (fast, same
/// filesystem). If that fails (cross-device), falls back to copy + delete.
fn move_file(source: &Path, dest: &Path) -> Result<()> {
    match fs::rename(source, dest) {
        Ok(()) => Ok(()),
        Err(_rename_err) => {
            // Cross-device move: copy then delete
            fs::copy(source, dest)
                .with_context(|| {
                    format!(
                        "Failed to copy {} to {}",
                        source.display(),
                        dest.display()
                    )
                })?;
            fs::remove_file(source)
                .with_context(|| format!("Failed to remove source file {}", source.display()))?;
            Ok(())
        }
    }
}

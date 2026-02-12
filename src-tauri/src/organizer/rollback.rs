use anyhow::{Context, Result};
use rusqlite::Connection;
use std::fs;
use std::path::Path;

use crate::db::queries::runs;

/// Rolls back all completed items in a run, moving files back to their original locations.
/// Returns the number of items successfully rolled back.
pub fn rollback_run(conn: &Connection, run_id: &str) -> Result<u32> {
    let items = runs::get_run_items(conn, run_id)
        .context("Failed to get run items for rollback")?;

    let mut rolled_back: u32 = 0;
    let mut errors: u32 = 0;

    for item in &items {
        // Only rollback items that were successfully completed
        if item.status != "completed" {
            continue;
        }

        let dest = Path::new(&item.destination_path);
        let original = Path::new(&item.original_path);

        // Check that the destination file still exists
        if !dest.exists() {
            log::warn!(
                "Rollback: destination file no longer exists: {}",
                dest.display()
            );
            runs::update_run_item_status(conn, &item.id, "rollback_skipped").ok();
            continue;
        }

        // Ensure original directory exists
        if let Some(parent) = original.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                log::error!(
                    "Rollback: failed to create directory {}: {}",
                    parent.display(),
                    e
                );
                errors += 1;
                continue;
            }
        }

        // Move file back
        match move_file_back(dest, original) {
            Ok(()) => {
                runs::update_run_item_status(conn, &item.id, "rolled_back").ok();
                rolled_back += 1;
                log::info!(
                    "Rolled back: {} -> {}",
                    dest.display(),
                    original.display()
                );
            }
            Err(e) => {
                log::error!(
                    "Rollback failed for {} -> {}: {}",
                    dest.display(),
                    original.display(),
                    e
                );
                errors += 1;
            }
        }
    }

    // Update the run status
    let total_moved = items.iter().filter(|i| i.status == "completed").count() as i32;
    let status = if errors > 0 { "rollback_partial" } else { "rolled_back" };
    runs::update_run_status(conn, run_id, status, total_moved - rolled_back as i32, 0, errors as i32).ok();

    log::info!(
        "Rollback complete for run {}: {} rolled back, {} errors",
        run_id,
        rolled_back,
        errors
    );

    Ok(rolled_back)
}

/// Moves a file back to its original location.
fn move_file_back(source: &Path, dest: &Path) -> Result<()> {
    match fs::rename(source, dest) {
        Ok(()) => Ok(()),
        Err(_) => {
            // Cross-device: copy then delete
            fs::copy(source, dest)
                .with_context(|| {
                    format!(
                        "Rollback copy failed: {} -> {}",
                        source.display(),
                        dest.display()
                    )
                })?;
            fs::remove_file(source)
                .with_context(|| {
                    format!("Rollback delete failed: {}", source.display())
                })?;
            Ok(())
        }
    }
}

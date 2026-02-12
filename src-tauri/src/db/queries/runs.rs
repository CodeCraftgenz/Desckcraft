use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::{Run, RunItem};

/// Lists runs with pagination, most recent first.
pub fn list_runs(conn: &Connection, limit: i32, offset: i32) -> Result<Vec<Run>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, profile_id, run_type, status, source_folder,
                    total_files, moved_files, skipped_files, error_files,
                    started_at, completed_at, rolled_back_at, error_message
             FROM runs ORDER BY started_at DESC LIMIT ?1 OFFSET ?2",
        )
        .context("Failed to prepare list_runs query")?;

    let rows = stmt
        .query_map(rusqlite::params![limit, offset], |row| {
            Ok(Run {
                id: row.get(0)?,
                profile_id: row.get(1)?,
                run_type: row.get(2)?,
                status: row.get(3)?,
                source_folder: row.get(4)?,
                total_files: row.get(5)?,
                moved_files: row.get(6)?,
                skipped_files: row.get(7)?,
                error_files: row.get(8)?,
                started_at: row.get(9)?,
                completed_at: row.get(10)?,
                rolled_back_at: row.get(11)?,
                error_message: row.get(12)?,
            })
        })
        .context("Failed to execute list_runs query")?;

    let mut runs = Vec::new();
    for row in rows {
        runs.push(row.context("Failed to read run row")?);
    }
    Ok(runs)
}

/// Gets a single run by ID.
pub fn get_run(conn: &Connection, id: &str) -> Result<Option<Run>> {
    let result = conn.query_row(
        "SELECT id, profile_id, run_type, status, source_folder,
                total_files, moved_files, skipped_files, error_files,
                started_at, completed_at, rolled_back_at, error_message
         FROM runs WHERE id = ?1",
        [id],
        |row| {
            Ok(Run {
                id: row.get(0)?,
                profile_id: row.get(1)?,
                run_type: row.get(2)?,
                status: row.get(3)?,
                source_folder: row.get(4)?,
                total_files: row.get(5)?,
                moved_files: row.get(6)?,
                skipped_files: row.get(7)?,
                error_files: row.get(8)?,
                started_at: row.get(9)?,
                completed_at: row.get(10)?,
                rolled_back_at: row.get(11)?,
                error_message: row.get(12)?,
            })
        },
    );

    match result {
        Ok(run) => Ok(Some(run)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!(e).context("Failed to get run")),
    }
}

/// Creates a new run record.
pub fn create_run(
    conn: &Connection,
    profile_id: &str,
    run_type: &str,
    source_folder: &str,
) -> Result<Run> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO runs (id, profile_id, run_type, status, source_folder, total_files, moved_files, skipped_files, error_files, started_at)
         VALUES (?1, ?2, ?3, 'running', ?4, 0, 0, 0, 0, ?5)",
        rusqlite::params![id, profile_id, run_type, source_folder, now],
    )
    .context("Failed to insert new run")?;

    get_run(conn, &id)?
        .ok_or_else(|| anyhow::anyhow!("Run was inserted but could not be retrieved"))
}

/// Updates the status and counters of a run.
pub fn update_run_status(
    conn: &Connection,
    id: &str,
    status: &str,
    moved: i32,
    skipped: i32,
    errors: i32,
) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let completed_at = if status == "completed" || status == "error" {
        Some(now.clone())
    } else {
        None
    };

    let rolled_back_at = if status == "rolled_back" {
        Some(now)
    } else {
        None
    };

    let total = moved + skipped + errors;

    conn.execute(
        "UPDATE runs SET status = ?1, total_files = ?2, moved_files = ?3, skipped_files = ?4,
         error_files = ?5, completed_at = COALESCE(?6, completed_at),
         rolled_back_at = COALESCE(?7, rolled_back_at)
         WHERE id = ?8",
        rusqlite::params![status, total, moved, skipped, errors, completed_at, rolled_back_at, id],
    )
    .context("Failed to update run status")?;

    Ok(())
}

/// Gets all items for a given run.
pub fn get_run_items(conn: &Connection, run_id: &str) -> Result<Vec<RunItem>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, run_id, rule_id, original_path, destination_path, file_size,
                    action_type, status, conflict_strategy, error_message, executed_at, rolled_back_at
             FROM run_items WHERE run_id = ?1 ORDER BY executed_at ASC",
        )
        .context("Failed to prepare get_run_items query")?;

    let rows = stmt
        .query_map([run_id], |row| {
            Ok(RunItem {
                id: row.get(0)?,
                run_id: row.get(1)?,
                rule_id: row.get(2)?,
                original_path: row.get(3)?,
                destination_path: row.get(4)?,
                file_size: row.get(5)?,
                action_type: row.get(6)?,
                status: row.get(7)?,
                conflict_strategy: row.get(8)?,
                error_message: row.get(9)?,
                executed_at: row.get(10)?,
                rolled_back_at: row.get(11)?,
            })
        })
        .context("Failed to execute get_run_items query")?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row.context("Failed to read run item row")?);
    }
    Ok(items)
}

/// Creates a new run item record.
pub fn create_run_item(
    conn: &Connection,
    run_id: &str,
    rule_id: Option<&str>,
    original_path: &str,
    destination_path: &str,
    file_size: i64,
    action_type: &str,
    status: &str,
    conflict_strategy: &str,
) -> Result<RunItem> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO run_items (id, run_id, rule_id, original_path, destination_path, file_size,
         action_type, status, conflict_strategy, executed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![id, run_id, rule_id, original_path, destination_path, file_size, action_type, status, conflict_strategy, now],
    )
    .context("Failed to insert run item")?;

    Ok(RunItem {
        id,
        run_id: run_id.to_string(),
        rule_id: rule_id.map(|s| s.to_string()),
        original_path: original_path.to_string(),
        destination_path: destination_path.to_string(),
        file_size,
        action_type: action_type.to_string(),
        status: status.to_string(),
        conflict_strategy: conflict_strategy.to_string(),
        error_message: None,
        executed_at: Some(now),
        rolled_back_at: None,
    })
}

/// Updates the status of a run item.
pub fn update_run_item_status(conn: &Connection, id: &str, status: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let rolled_back_at = if status == "rolled_back" {
        Some(now)
    } else {
        None
    };

    conn.execute(
        "UPDATE run_items SET status = ?1, rolled_back_at = COALESCE(?2, rolled_back_at) WHERE id = ?3",
        rusqlite::params![status, rolled_back_at, id],
    )
    .context("Failed to update run item status")?;

    Ok(())
}

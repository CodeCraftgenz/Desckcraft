use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::Schedule;
use crate::watcher::scheduler;

/// Lists all schedules ordered by creation date.
pub fn list_schedules(conn: &Connection) -> Result<Vec<Schedule>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, profile_id, folder_id, cron_expr, is_enabled,
                    last_run_at, next_run_at, created_at, updated_at
             FROM schedules ORDER BY created_at ASC",
        )
        .context("Failed to prepare list_schedules query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Schedule {
                id: row.get(0)?,
                profile_id: row.get(1)?,
                folder_id: row.get(2)?,
                cron_expr: row.get(3)?,
                is_enabled: row.get(4)?,
                last_run_at: row.get(5)?,
                next_run_at: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .context("Failed to execute list_schedules query")?;

    let mut schedules = Vec::new();
    for row in rows {
        schedules.push(row.context("Failed to read schedule row")?);
    }
    Ok(schedules)
}

/// Creates a new schedule with calculated next_run_at.
pub fn create_schedule(
    conn: &Connection,
    profile_id: &str,
    folder_id: &str,
    cron_expr: &str,
) -> Result<Schedule> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let next_run_at = scheduler::calculate_next_run(cron_expr);

    conn.execute(
        "INSERT INTO schedules (id, profile_id, folder_id, cron_expr, is_enabled, next_run_at, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 1, ?5, ?6, ?6)",
        rusqlite::params![id, profile_id, folder_id, cron_expr, next_run_at, now],
    )
    .context("Failed to insert schedule")?;

    Ok(Schedule {
        id,
        profile_id: profile_id.to_string(),
        folder_id: folder_id.to_string(),
        cron_expr: cron_expr.to_string(),
        is_enabled: true,
        last_run_at: None,
        next_run_at,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Updates a schedule's cron expression and enabled state, recalculating next_run_at.
pub fn update_schedule(
    conn: &Connection,
    id: &str,
    cron_expr: &str,
    is_enabled: bool,
) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let next_run_at = if is_enabled {
        scheduler::calculate_next_run(cron_expr)
    } else {
        None
    };

    conn.execute(
        "UPDATE schedules SET cron_expr = ?1, is_enabled = ?2, next_run_at = ?3, updated_at = ?4 WHERE id = ?5",
        rusqlite::params![cron_expr, is_enabled, next_run_at, now, id],
    )
    .context("Failed to update schedule")?;

    Ok(())
}

/// Deletes a schedule by ID.
pub fn delete_schedule(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM schedules WHERE id = ?1", [id])
        .context("Failed to delete schedule")?;
    Ok(())
}

/// Gets all enabled schedules that are due to run (next_run_at <= now).
pub fn get_due_schedules(conn: &Connection) -> Result<Vec<Schedule>> {
    let now = chrono::Local::now()
        .naive_local()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();

    let mut stmt = conn
        .prepare(
            "SELECT id, profile_id, folder_id, cron_expr, is_enabled,
                    last_run_at, next_run_at, created_at, updated_at
             FROM schedules
             WHERE is_enabled = 1 AND next_run_at IS NOT NULL AND next_run_at <= ?1
             ORDER BY next_run_at ASC",
        )
        .context("Failed to prepare get_due_schedules query")?;

    let rows = stmt
        .query_map([&now], |row| {
            Ok(Schedule {
                id: row.get(0)?,
                profile_id: row.get(1)?,
                folder_id: row.get(2)?,
                cron_expr: row.get(3)?,
                is_enabled: row.get(4)?,
                last_run_at: row.get(5)?,
                next_run_at: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .context("Failed to execute get_due_schedules query")?;

    let mut schedules = Vec::new();
    for row in rows {
        schedules.push(row.context("Failed to read due schedule row")?);
    }
    Ok(schedules)
}

/// Marks a schedule as run: updates last_run_at to now and calculates next next_run_at.
pub fn mark_schedule_run(conn: &Connection, id: &str, cron_expr: &str) -> Result<()> {
    let now = chrono::Local::now()
        .naive_local()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let next_run_at = scheduler::calculate_next_run(cron_expr);

    conn.execute(
        "UPDATE schedules SET last_run_at = ?1, next_run_at = ?2, updated_at = ?1 WHERE id = ?3",
        rusqlite::params![now, next_run_at, id],
    )
    .context("Failed to mark schedule as run")?;

    Ok(())
}

/// Gets the folder path for a schedule's folder_id.
pub fn get_schedule_folder_path(conn: &Connection, folder_id: &str) -> Result<String> {
    let path: String = conn
        .query_row(
            "SELECT path FROM watched_folders WHERE id = ?1",
            [folder_id],
            |row| row.get(0),
        )
        .context("Failed to get folder path for schedule")?;
    Ok(path)
}

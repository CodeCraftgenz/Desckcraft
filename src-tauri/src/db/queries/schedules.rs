use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::Schedule;

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

/// Creates a new schedule.
pub fn create_schedule(
    conn: &Connection,
    profile_id: &str,
    folder_id: &str,
    cron_expr: &str,
) -> Result<Schedule> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO schedules (id, profile_id, folder_id, cron_expr, is_enabled, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 1, ?5, ?5)",
        rusqlite::params![id, profile_id, folder_id, cron_expr, now],
    )
    .context("Failed to insert schedule")?;

    Ok(Schedule {
        id,
        profile_id: profile_id.to_string(),
        folder_id: folder_id.to_string(),
        cron_expr: cron_expr.to_string(),
        is_enabled: true,
        last_run_at: None,
        next_run_at: None,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Updates a schedule's cron expression and enabled state.
pub fn update_schedule(
    conn: &Connection,
    id: &str,
    cron_expr: &str,
    is_enabled: bool,
) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE schedules SET cron_expr = ?1, is_enabled = ?2, updated_at = ?3 WHERE id = ?4",
        rusqlite::params![cron_expr, is_enabled, now, id],
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
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

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

use anyhow::{Context, Result};
use rusqlite::Connection;

use crate::db::models::TourState;

/// Gets the current tour state (there is always exactly one row with id='main').
pub fn get_tour_state(conn: &Connection) -> Result<TourState> {
    let state = conn
        .query_row(
            "SELECT id, has_seen, current_step, completed_at, skipped_at, times_completed, updated_at
             FROM tour_state WHERE id = 'main'",
            [],
            |row| {
                Ok(TourState {
                    id: row.get(0)?,
                    has_seen: row.get(1)?,
                    current_step: row.get(2)?,
                    completed_at: row.get(3)?,
                    skipped_at: row.get(4)?,
                    times_completed: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .context("Failed to get tour state")?;

    Ok(state)
}

/// Updates the current tour step.
pub fn update_tour_step(conn: &Connection, step: i32) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE tour_state SET current_step = ?1, has_seen = 1, updated_at = ?2 WHERE id = 'main'",
        rusqlite::params![step, now],
    )
    .context("Failed to update tour step")?;

    Ok(())
}

/// Marks the tour as completed.
pub fn complete_tour(conn: &Connection) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE tour_state SET has_seen = 1, completed_at = ?1,
         times_completed = times_completed + 1, updated_at = ?1 WHERE id = 'main'",
        [&now],
    )
    .context("Failed to complete tour")?;

    Ok(())
}

/// Marks the tour as skipped.
pub fn skip_tour(conn: &Connection) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE tour_state SET has_seen = 1, skipped_at = ?1, updated_at = ?1 WHERE id = 'main'",
        [&now],
    )
    .context("Failed to skip tour")?;

    Ok(())
}

/// Resets the tour state so it can be shown again.
pub fn reset_tour(conn: &Connection) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE tour_state SET has_seen = 0, current_step = 0, completed_at = NULL,
         skipped_at = NULL, updated_at = ?1 WHERE id = 'main'",
        [&now],
    )
    .context("Failed to reset tour")?;

    Ok(())
}

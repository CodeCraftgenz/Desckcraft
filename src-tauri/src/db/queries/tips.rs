use anyhow::{Context, Result};
use rusqlite::Connection;

use crate::db::models::TipState;

/// Gets the state of a specific tip.
pub fn get_tip_state(conn: &Connection, tip_id: &str) -> Result<Option<TipState>> {
    let result = conn.query_row(
        "SELECT id, times_shown, last_shown_at, accepted, dismissed, dismissed_at,
                cooldown_until, created_at, updated_at
         FROM tips_state WHERE id = ?1",
        [tip_id],
        |row| {
            Ok(TipState {
                id: row.get(0)?,
                times_shown: row.get(1)?,
                last_shown_at: row.get(2)?,
                accepted: row.get(3)?,
                dismissed: row.get(4)?,
                dismissed_at: row.get(5)?,
                cooldown_until: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    );

    match result {
        Ok(state) => Ok(Some(state)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!(e).context("Failed to get tip state")),
    }
}

/// Records that a tip was shown. Creates the record if it doesn't exist.
pub fn record_tip_shown(conn: &Connection, tip_id: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let existing = get_tip_state(conn, tip_id)?;

    if existing.is_some() {
        conn.execute(
            "UPDATE tips_state SET times_shown = times_shown + 1, last_shown_at = ?1, updated_at = ?1
             WHERE id = ?2",
            rusqlite::params![now, tip_id],
        )
        .context("Failed to update tip shown count")?;
    } else {
        conn.execute(
            "INSERT INTO tips_state (id, times_shown, last_shown_at, accepted, dismissed, created_at, updated_at)
             VALUES (?1, 1, ?2, 0, 0, ?2, ?2)",
            rusqlite::params![tip_id, now],
        )
        .context("Failed to insert tip state")?;
    }

    Ok(())
}

/// Marks a tip as accepted.
pub fn accept_tip(conn: &Connection, tip_id: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let existing = get_tip_state(conn, tip_id)?;

    if existing.is_some() {
        conn.execute(
            "UPDATE tips_state SET accepted = 1, updated_at = ?1 WHERE id = ?2",
            rusqlite::params![now, tip_id],
        )
        .context("Failed to accept tip")?;
    } else {
        conn.execute(
            "INSERT INTO tips_state (id, times_shown, accepted, dismissed, created_at, updated_at)
             VALUES (?1, 0, 1, 0, ?2, ?2)",
            rusqlite::params![tip_id, now],
        )
        .context("Failed to insert accepted tip state")?;
    }

    Ok(())
}

/// Dismisses a tip with an optional cooldown period in hours.
pub fn dismiss_tip(conn: &Connection, tip_id: &str, cooldown_hours: i64) -> Result<()> {
    let now = chrono::Utc::now();
    let now_str = now.format("%Y-%m-%d %H:%M:%S").to_string();

    let cooldown_until = if cooldown_hours > 0 {
        let until = now + chrono::Duration::hours(cooldown_hours);
        Some(until.format("%Y-%m-%d %H:%M:%S").to_string())
    } else {
        None
    };

    let existing = get_tip_state(conn, tip_id)?;

    if existing.is_some() {
        conn.execute(
            "UPDATE tips_state SET dismissed = 1, dismissed_at = ?1, cooldown_until = ?2, updated_at = ?1
             WHERE id = ?3",
            rusqlite::params![now_str, cooldown_until, tip_id],
        )
        .context("Failed to dismiss tip")?;
    } else {
        conn.execute(
            "INSERT INTO tips_state (id, times_shown, accepted, dismissed, dismissed_at, cooldown_until, created_at, updated_at)
             VALUES (?1, 0, 0, 1, ?2, ?3, ?2, ?2)",
            rusqlite::params![tip_id, now_str, cooldown_until],
        )
        .context("Failed to insert dismissed tip state")?;
    }

    Ok(())
}

/// Gets all tip states.
pub fn get_all_tip_states(conn: &Connection) -> Result<Vec<TipState>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, times_shown, last_shown_at, accepted, dismissed, dismissed_at,
                    cooldown_until, created_at, updated_at
             FROM tips_state ORDER BY id ASC",
        )
        .context("Failed to prepare get_all_tip_states query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(TipState {
                id: row.get(0)?,
                times_shown: row.get(1)?,
                last_shown_at: row.get(2)?,
                accepted: row.get(3)?,
                dismissed: row.get(4)?,
                dismissed_at: row.get(5)?,
                cooldown_until: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .context("Failed to execute get_all_tip_states query")?;

    let mut states = Vec::new();
    for row in rows {
        states.push(row.context("Failed to read tip state row")?);
    }
    Ok(states)
}

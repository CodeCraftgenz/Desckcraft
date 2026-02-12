use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::WatchedFolder;

/// Lists all watched folders ordered by creation date.
pub fn list_watched_folders(conn: &Connection) -> Result<Vec<WatchedFolder>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, path, profile_id, is_enabled, watch_mode, created_at, updated_at
             FROM watched_folders ORDER BY created_at ASC",
        )
        .context("Failed to prepare list_watched_folders query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(WatchedFolder {
                id: row.get(0)?,
                path: row.get(1)?,
                profile_id: row.get(2)?,
                is_enabled: row.get(3)?,
                watch_mode: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .context("Failed to execute list_watched_folders query")?;

    let mut folders = Vec::new();
    for row in rows {
        folders.push(row.context("Failed to read watched_folder row")?);
    }
    Ok(folders)
}

/// Adds a new watched folder.
pub fn add_watched_folder(
    conn: &Connection,
    path: &str,
    profile_id: &str,
    watch_mode: &str,
) -> Result<WatchedFolder> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO watched_folders (id, path, profile_id, is_enabled, watch_mode, created_at, updated_at)
         VALUES (?1, ?2, ?3, 1, ?4, ?5, ?5)",
        rusqlite::params![id, path, profile_id, watch_mode, now],
    )
    .context("Failed to insert watched folder")?;

    Ok(WatchedFolder {
        id,
        path: path.to_string(),
        profile_id: profile_id.to_string(),
        is_enabled: true,
        watch_mode: watch_mode.to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Removes a watched folder by ID.
pub fn remove_watched_folder(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM watched_folders WHERE id = ?1", [id])
        .context("Failed to delete watched folder")?;
    Ok(())
}

/// Updates the watch mode of a watched folder.
pub fn update_watch_mode(conn: &Connection, id: &str, watch_mode: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE watched_folders SET watch_mode = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![watch_mode, now, id],
    )
    .context("Failed to update watch mode")?;

    Ok(())
}

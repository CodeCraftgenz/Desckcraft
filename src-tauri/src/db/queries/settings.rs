use anyhow::{Context, Result};
use rusqlite::Connection;

use crate::db::models::Setting;

/// Gets a single setting value by key.
pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>> {
    let result = conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        [key],
        |row| row.get::<_, String>(0),
    );

    match result {
        Ok(value) => Ok(Some(value)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!(e).context("Failed to get setting")),
    }
}

/// Sets a setting value. Creates the key if it does not exist.
pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3",
        rusqlite::params![key, value, now],
    )
    .context("Failed to set setting")?;

    Ok(())
}

/// Gets all settings as a list.
pub fn get_all_settings(conn: &Connection) -> Result<Vec<Setting>> {
    let mut stmt = conn
        .prepare("SELECT key, value, updated_at FROM settings ORDER BY key ASC")
        .context("Failed to prepare get_all_settings query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Setting {
                key: row.get(0)?,
                value: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })
        .context("Failed to execute get_all_settings query")?;

    let mut settings = Vec::new();
    for row in rows {
        settings.push(row.context("Failed to read setting row")?);
    }
    Ok(settings)
}

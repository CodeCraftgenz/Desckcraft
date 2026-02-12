use anyhow::{Context, Result};
use rusqlite::Connection;
use std::path::Path;

use super::migrations;

/// Initializes the SQLite database at the given app data directory path.
/// Creates the database file if it does not exist, enables WAL mode,
/// and runs all pending migrations.
///
/// Returns a raw `Connection` that the caller can wrap in a `Mutex`.
pub fn init(app_data_dir: &str) -> Result<Connection> {
    let db_dir = Path::new(app_data_dir);
    std::fs::create_dir_all(db_dir)
        .with_context(|| format!("Failed to create app data directory: {}", app_data_dir))?;

    let db_path = db_dir.join("deskcraft.db");
    log::info!("Opening database at: {}", db_path.display());

    let conn = Connection::open(&db_path)
        .with_context(|| format!("Failed to open database at: {}", db_path.display()))?;

    // Enable WAL mode for better concurrent read performance
    conn.execute_batch("PRAGMA journal_mode=WAL;")
        .context("Failed to enable WAL mode")?;

    // Enable foreign keys
    conn.execute_batch("PRAGMA foreign_keys=ON;")
        .context("Failed to enable foreign keys")?;

    // Run migrations
    migrations::run_migrations(&conn).context("Failed to run database migrations")?;

    log::info!("Database initialized successfully");
    Ok(conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_creates_database() {
        let temp_dir = std::env::temp_dir().join("deskcraft_test_init");
        let _ = std::fs::remove_dir_all(&temp_dir);
        let conn = init(temp_dir.to_str().unwrap()).unwrap();
        // Verify the database is usable
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM settings", [], |row| row.get(0))
            .unwrap();
        assert!(count > 0);
        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}

use anyhow::{Context, Result};
use rusqlite::Connection;

/// Embedded migration SQL files. Each entry is (name, sql).
const MIGRATIONS: &[(&str, &str)] = &[
    (
        "001_initial_schema",
        include_str!("../../migrations/001_initial_schema.sql"),
    ),
    (
        "002_seed_defaults",
        include_str!("../../migrations/002_seed_defaults.sql"),
    ),
    (
        "003_help_and_tour",
        include_str!("../../migrations/003_help_and_tour.sql"),
    ),
    (
        "004_default_rules",
        include_str!("../../migrations/004_default_rules.sql"),
    ),
    (
        "005_extra_rules",
        include_str!("../../migrations/005_extra_rules.sql"),
    ),
];

/// Runs all pending migrations against the provided database connection.
/// Migrations are tracked in the `_migrations` table; only migrations that
/// have not been applied yet are executed.
pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Ensure the _migrations table exists (it is also in 001, but we create it
    // here first so we can query it before running any migration).
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );",
    )
    .context("Failed to create _migrations table")?;

    for (name, sql) in MIGRATIONS {
        let already_applied: bool = conn
            .query_row(
                "SELECT COUNT(*) > 0 FROM _migrations WHERE name = ?1",
                [name],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if already_applied {
            log::debug!("Migration '{}' already applied, skipping", name);
            continue;
        }

        log::info!("Applying migration '{}'...", name);

        conn.execute_batch(sql)
            .with_context(|| format!("Failed to apply migration '{}'", name))?;

        conn.execute(
            "INSERT INTO _migrations (name, applied_at) VALUES (?1, datetime('now'))",
            [name],
        )
        .with_context(|| format!("Failed to record migration '{}'", name))?;

        log::info!("Migration '{}' applied successfully", name);
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_migrations_are_idempotent() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();

        // Run twice — should not fail
        run_migrations(&conn).unwrap();
        run_migrations(&conn).unwrap();

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM _migrations", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count, 5);
    }
}

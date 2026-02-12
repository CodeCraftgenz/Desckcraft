use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::{HelpFavorite, HelpView};

/// Lists all help article favorites.
pub fn list_favorites(conn: &Connection) -> Result<Vec<HelpFavorite>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, article_slug, created_at FROM help_favorites ORDER BY created_at DESC",
        )
        .context("Failed to prepare list_favorites query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(HelpFavorite {
                id: row.get(0)?,
                article_slug: row.get(1)?,
                created_at: row.get(2)?,
            })
        })
        .context("Failed to execute list_favorites query")?;

    let mut favorites = Vec::new();
    for row in rows {
        favorites.push(row.context("Failed to read favorite row")?);
    }
    Ok(favorites)
}

/// Adds an article to favorites.
pub fn add_favorite(conn: &Connection, article_slug: &str) -> Result<()> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT OR IGNORE INTO help_favorites (id, article_slug, created_at) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, article_slug, now],
    )
    .context("Failed to add favorite")?;

    Ok(())
}

/// Removes an article from favorites.
pub fn remove_favorite(conn: &Connection, article_slug: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM help_favorites WHERE article_slug = ?1",
        [article_slug],
    )
    .context("Failed to remove favorite")?;

    Ok(())
}

/// Checks if an article is a favorite.
pub fn is_favorite(conn: &Connection, article_slug: &str) -> Result<bool> {
    let count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM help_favorites WHERE article_slug = ?1",
            [article_slug],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(count > 0)
}

/// Records a view for a help article.
pub fn record_view(conn: &Connection, article_slug: &str) -> Result<()> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO help_views (id, article_slug, viewed_at) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, article_slug, now],
    )
    .context("Failed to record help view")?;

    Ok(())
}

/// Gets recent help article views.
pub fn recent_views(conn: &Connection, limit: i32) -> Result<Vec<HelpView>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, article_slug, viewed_at FROM help_views ORDER BY viewed_at DESC LIMIT ?1",
        )
        .context("Failed to prepare recent_views query")?;

    let rows = stmt
        .query_map([limit], |row| {
            Ok(HelpView {
                id: row.get(0)?,
                article_slug: row.get(1)?,
                viewed_at: row.get(2)?,
            })
        })
        .context("Failed to execute recent_views query")?;

    let mut views = Vec::new();
    for row in rows {
        views.push(row.context("Failed to read view row")?);
    }
    Ok(views)
}

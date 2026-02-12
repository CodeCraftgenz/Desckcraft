-- DeskCraft help and tour tables
-- Migration 003: Help favorites, views, tour and tips state

CREATE TABLE IF NOT EXISTS help_favorites (
    id TEXT PRIMARY KEY NOT NULL,
    article_slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS help_views (
    id TEXT PRIMARY KEY NOT NULL,
    article_slug TEXT NOT NULL,
    viewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_help_views_article_slug ON help_views(article_slug);
CREATE INDEX IF NOT EXISTS idx_help_views_viewed_at ON help_views(viewed_at);

CREATE TABLE IF NOT EXISTS tour_state (
    id TEXT PRIMARY KEY NOT NULL DEFAULT 'main',
    has_seen INTEGER NOT NULL DEFAULT 0,
    current_step INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    skipped_at TEXT,
    times_completed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tips_state (
    id TEXT PRIMARY KEY NOT NULL,
    times_shown INTEGER NOT NULL DEFAULT 0,
    last_shown_at TEXT,
    accepted INTEGER NOT NULL DEFAULT 0,
    dismissed INTEGER NOT NULL DEFAULT 0,
    dismissed_at TEXT,
    cooldown_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO tour_state (id, has_seen, current_step, times_completed, updated_at)
VALUES ('main', 0, 0, 0, datetime('now'));

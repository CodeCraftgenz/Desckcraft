-- DeskCraft seed defaults
-- Migration 002: Default settings and profile

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
    ('theme', 'system', datetime('now')),
    ('language', 'pt-BR', datetime('now')),
    ('conflict_strategy', 'suffix', datetime('now')),
    ('tips_enabled', '1', datetime('now')),
    ('first_launch', '1', datetime('now')),
    ('notifications_enabled', '1', datetime('now')),
    ('auto_update', '1', datetime('now')),
    ('log_level', 'info', datetime('now')),
    ('max_log_days', '30', datetime('now')),
    ('confirm_before_execute', '1', datetime('now')),
    ('show_hidden_files', '0', datetime('now')),
    ('default_conflict_strategy', 'suffix', datetime('now')),
    ('watcher_debounce_ms', '2000', datetime('now')),
    ('max_file_size_mb', '0', datetime('now')),
    ('trial_started_at', '', datetime('now')),
    ('license_key', '', datetime('now'));

INSERT OR IGNORE INTO profiles (id, name, icon, color, is_active, is_default, created_at, updated_at)
VALUES (
    'default-profile-001',
    'Pessoal',
    'user',
    '#6366f1',
    1,
    1,
    datetime('now'),
    datetime('now')
);

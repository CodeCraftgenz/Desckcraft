# DeskCraft — Modelo do Banco SQLite

## Diagrama ER (textual)

```
profiles ──1:N── profile_rules ──N:1── rules ──1:N── rule_conditions
                                                  └──1:N── rule_actions

profiles ──1:N── runs ──1:N── run_items

settings (key-value)

help_favorites ──N:1── (article_slug)
help_views ──N:1── (article_slug)

tour_state (singleton-like)

tips_state (per tip)

schedules ──N:1── profiles

shortcuts

tags ──N:N── (via rule_actions ou run_items)
```

## Tabelas

### 1. `profiles` — Perfis de organização

```sql
CREATE TABLE profiles (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name        TEXT NOT NULL,
    icon        TEXT DEFAULT 'folder',
    color       TEXT DEFAULT '#6366f1',
    is_active   INTEGER NOT NULL DEFAULT 0,
    is_default  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2. `rules` — Regras de organização

```sql
CREATE TABLE rules (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name        TEXT NOT NULL,
    description TEXT,
    is_enabled  INTEGER NOT NULL DEFAULT 1,
    priority    INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 3. `rule_conditions` — Condições IF de uma regra

```sql
CREATE TABLE rule_conditions (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    rule_id     TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
    field       TEXT NOT NULL,
    -- field: 'extension', 'filename', 'size', 'created_date',
    --        'modified_date', 'source_folder', 'regex'
    operator    TEXT NOT NULL,
    -- operator: 'equals', 'not_equals', 'contains', 'not_contains',
    --           'starts_with', 'ends_with', 'greater_than', 'less_than',
    --           'before', 'after', 'matches' (regex)
    value       TEXT NOT NULL,
    logic_gate  TEXT NOT NULL DEFAULT 'AND',
    -- logic_gate: 'AND', 'OR'
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_rule_conditions_rule ON rule_conditions(rule_id);
```

### 4. `rule_actions` — Ações THEN de uma regra

```sql
CREATE TABLE rule_actions (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    rule_id         TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
    action_type     TEXT NOT NULL,
    -- action_type: 'move_to_folder', 'move_to_subfolder', 'rename', 'add_tag'
    destination     TEXT,
    -- Para move_to_folder: caminho absoluto ou relativo
    -- Para move_to_subfolder: template como '{extension}' ou '{year}/{month}'
    rename_pattern  TEXT,
    -- Para rename: pattern como '{original}_{date}' ou '{counter}_{original}'
    tag_name        TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_rule_actions_rule ON rule_actions(rule_id);
```

### 5. `profile_rules` — Relação perfil ↔ regras

```sql
CREATE TABLE profile_rules (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rule_id     TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(profile_id, rule_id)
);
CREATE INDEX idx_profile_rules_profile ON profile_rules(profile_id);
CREATE INDEX idx_profile_rules_rule ON profile_rules(rule_id);
```

### 6. `watched_folders` — Pastas monitoradas

```sql
CREATE TABLE watched_folders (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    path        TEXT NOT NULL UNIQUE,
    profile_id  TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    is_enabled  INTEGER NOT NULL DEFAULT 1,
    watch_mode  TEXT NOT NULL DEFAULT 'manual',
    -- watch_mode: 'manual', 'realtime', 'scheduled'
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 7. `runs` — Histórico de execuções

```sql
CREATE TABLE runs (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    profile_id      TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    run_type        TEXT NOT NULL DEFAULT 'manual',
    -- run_type: 'manual', 'simulation', 'watcher', 'scheduled'
    status          TEXT NOT NULL DEFAULT 'pending',
    -- status: 'pending', 'running', 'completed', 'failed', 'rolled_back'
    source_folder   TEXT NOT NULL,
    total_files     INTEGER NOT NULL DEFAULT 0,
    moved_files     INTEGER NOT NULL DEFAULT 0,
    skipped_files   INTEGER NOT NULL DEFAULT 0,
    error_files     INTEGER NOT NULL DEFAULT 0,
    started_at      TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at    TEXT,
    rolled_back_at  TEXT,
    error_message   TEXT
);
CREATE INDEX idx_runs_profile ON runs(profile_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_runs_started ON runs(started_at);
```

### 8. `run_items` — Itens individuais de um run

```sql
CREATE TABLE run_items (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    run_id          TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    rule_id         TEXT REFERENCES rules(id) ON DELETE SET NULL,
    original_path   TEXT NOT NULL,
    destination_path TEXT NOT NULL,
    file_size       INTEGER NOT NULL DEFAULT 0,
    action_type     TEXT NOT NULL,
    -- action_type: 'move', 'rename', 'move_rename'
    status          TEXT NOT NULL DEFAULT 'pending',
    -- status: 'pending', 'completed', 'failed', 'rolled_back', 'skipped'
    conflict_strategy TEXT,
    -- conflict_strategy: 'suffix', 'conflict_folder', 'skip', 'ask'
    error_message   TEXT,
    executed_at     TEXT,
    rolled_back_at  TEXT
);
CREATE INDEX idx_run_items_run ON run_items(run_id);
CREATE INDEX idx_run_items_status ON run_items(status);
```

### 9. `schedules` — Agendamentos

```sql
CREATE TABLE schedules (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    folder_id   TEXT NOT NULL REFERENCES watched_folders(id) ON DELETE CASCADE,
    cron_expr   TEXT NOT NULL,
    -- Simplified cron: 'daily:09:00', 'weekly:mon:09:00', 'hourly'
    is_enabled  INTEGER NOT NULL DEFAULT 1,
    last_run_at TEXT,
    next_run_at TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_schedules_profile ON schedules(profile_id);
```

### 10. `settings` — Configurações key-value

```sql
CREATE TABLE settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default settings:
-- theme: 'system' | 'light' | 'dark'
-- language: 'pt-BR' | 'en-US'
-- conflict_strategy: 'suffix' | 'conflict_folder' | 'ask'
-- start_minimized: '0' | '1'
-- start_with_os: '0' | '1'
-- log_level: 'info' | 'debug' | 'warn' | 'error'
-- tips_enabled: '1' | '0'
-- tips_frequency: 'normal' | 'low' | 'off'
-- license_key: '' (empty = free)
-- trial_started_at: '' (empty = not started)
-- first_launch: '1'
```

### 11. `tags` — Tags para organização (opcional)

```sql
CREATE TABLE tags (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name        TEXT NOT NULL UNIQUE,
    color       TEXT DEFAULT '#6366f1',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 12. `shortcuts` — Atalhos rápidos

```sql
CREATE TABLE shortcuts (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name        TEXT NOT NULL,
    shortcut_type TEXT NOT NULL,
    -- shortcut_type: 'folder', 'profile_activate', 'run_simulation', 'run_organize'
    target      TEXT NOT NULL,
    -- Para folder: path. Para profile: profile_id. etc.
    hotkey      TEXT,
    -- Hotkey: 'Ctrl+Shift+1', etc. (opcional)
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 13. `help_favorites` — Artigos favoritos do Help Center

```sql
CREATE TABLE help_favorites (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    article_slug TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 14. `help_views` — Histórico de visualização de artigos

```sql
CREATE TABLE help_views (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    article_slug TEXT NOT NULL,
    viewed_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_help_views_slug ON help_views(article_slug);
CREATE INDEX idx_help_views_date ON help_views(viewed_at);
```

### 15. `tour_state` — Estado do tour guiado

```sql
CREATE TABLE tour_state (
    id              TEXT PRIMARY KEY DEFAULT 'main',
    has_seen        INTEGER NOT NULL DEFAULT 0,
    current_step    INTEGER NOT NULL DEFAULT 0,
    completed_at    TEXT,
    skipped_at      TEXT,
    times_completed INTEGER NOT NULL DEFAULT 0,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 16. `tips_state` — Estado das dicas inteligentes

```sql
CREATE TABLE tips_state (
    id              TEXT PRIMARY KEY,
    -- id: 'desktop_clutter', 'pdf_accumulation', 'installer_pileup', etc.
    times_shown     INTEGER NOT NULL DEFAULT 0,
    last_shown_at   TEXT,
    accepted        INTEGER NOT NULL DEFAULT 0,
    dismissed       INTEGER NOT NULL DEFAULT 0,
    dismissed_at    TEXT,
    cooldown_until  TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Migration Strategy

```
migrations/
├── 001_initial_schema.sql      -- Todas as tabelas core
├── 002_seed_defaults.sql       -- Perfis padrão, settings iniciais
├── 003_help_and_tour.sql       -- Help, tour, tips tables
└── ...                         -- Futuras migrations
```

Cada migration tem um número sequencial e é aplicada uma única vez (tracking via tabela `_migrations`):

```sql
CREATE TABLE IF NOT EXISTS _migrations (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

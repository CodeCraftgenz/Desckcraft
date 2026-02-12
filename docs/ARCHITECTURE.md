# DeskCraft — Arquitetura do Sistema

## Stack

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (WebView)                │
│            React 18 + TypeScript + Vite              │
│         Tailwind CSS + Framer Motion + Zustand       │
├─────────────────────────────────────────────────────┤
│                    TAURI BRIDGE                      │
│              IPC Commands + Events                   │
├─────────────────────────────────────────────────────┤
│                  BACKEND (Rust)                      │
│     Tauri Core + rusqlite + notify + tokio           │
└─────────────────────────────────────────────────────┘
```

## Diagrama de Módulos

```
┌──────────────────────────────────────────────────────────────────┐
│                         TAURI APP                                │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │  Organizer   │  │  Rule Engine  │  │  Watcher/Scheduler  │    │
│  │   Engine     │  │              │  │                     │    │
│  │             │  │  - parse     │  │  - notify (fs)      │    │
│  │  - scan     │  │  - evaluate  │  │  - cron scheduler   │    │
│  │  - simulate │  │  - match     │  │  - debounce         │    │
│  │  - execute  │  │  - priority  │  │  - queue            │    │
│  │  - rollback │  │              │  │                     │    │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘    │
│         │                │                      │               │
│  ┌──────▼────────────────▼──────────────────────▼──────────┐    │
│  │                    CORE SERVICES                         │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────────────┐   │    │
│  │  │  SQLite   │  │   Logger   │  │  Config/Settings   │   │    │
│  │  │  Layer    │  │  Service   │  │    Service         │   │    │
│  │  │          │  │           │  │                    │   │    │
│  │  │ - pool   │  │ - file    │  │  - get/set         │   │    │
│  │  │ - migrate│  │ - rotate  │  │  - profiles        │   │    │
│  │  │ - query  │  │ - export  │  │  - license         │   │    │
│  │  └──────────┘  └───────────┘  └────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                 KNOWLEDGE & UX LAYER                      │    │
│  │                                                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │    │
│  │  │ Help Center   │  │ Product Tour  │  │ Tips Engine   │  │    │
│  │  │              │  │              │  │               │  │    │
│  │  │ - articles   │  │ - steps      │  │ - heuristics  │  │    │
│  │  │ - search idx │  │ - overlay    │  │ - cooldown    │  │    │
│  │  │ - favorites  │  │ - state      │  │ - tracking    │  │    │
│  │  │ - history    │  │ - highlight  │  │ - dismiss     │  │    │
│  │  └──────────────┘  └──────────────┘  └───────────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────┐                            │
│  │         TRAY / SYSTEM           │                            │
│  │  - tray icon + menu             │                            │
│  │  - global shortcuts (optional)  │                            │
│  │  - startup (optional)           │                            │
│  └─────────────────────────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
```

## Módulos Detalhados

### 1. Organizer Engine (`src-tauri/src/organizer/`)

Responsabilidade: Escanear pastas, aplicar regras, mover arquivos.

```
OrganizerEngine
├── scan(folder) → Vec<FileEntry>
├── simulate(folder, rules) → SimulationResult
│   └── Retorna lista de ações sem executar
├── execute(simulation_id) → ExecutionResult
│   └── Move arquivos, registra no histórico
├── rollback(run_id) → RollbackResult
│   └── Reverte movimentações de um run específico
└── resolve_conflict(file, strategy) → ResolvedPath
    └── Estratégias: suffix, conflict_folder, ask_user
```

**Fluxo principal:**
```
Scan → Filter (rules) → Simulate → Preview UI → Confirm → Execute → Log
                                                              ↓
                                                         Rollback (if needed)
```

### 2. Rule Engine (`src-tauri/src/rules/`)

Responsabilidade: Avaliar condições IF→THEN contra arquivos.

```
RuleEngine
├── evaluate(file, rules) → Option<RuleMatch>
├── parse_condition(condition) → ConditionEvaluator
│   ├── ExtensionMatch    (e.g., .pdf, .docx)
│   ├── KeywordMatch      (filename contains "invoice")
│   ├── DateMatch         (created/modified before/after)
│   ├── SizeMatch         (> 10MB, < 1KB)
│   ├── OriginMatch       (source folder)
│   └── RegexMatch        (Pro only)
└── parse_action(action) → ActionExecutor
    ├── MoveToFolder
    ├── MoveToSubfolder   (dynamic: by date, by extension)
    ├── Rename
    └── AddTag
```

**Prioridade de regras:** Regras com maior especificidade vencem. Em caso de empate, a ordem manual (drag) define.

### 3. Watcher/Scheduler (`src-tauri/src/watcher/`)

Responsabilidade: Monitorar pastas em tempo real e agendar execuções.

```
Watcher
├── watch(folders) → Start filesystem notifications
├── on_change(event) → Debounce + Enqueue
├── process_queue() → Apply rules to changed files
└── stop() → Cleanup watchers

Scheduler
├── add_schedule(cron_expr, profile_id)
├── remove_schedule(schedule_id)
├── tick() → Check and execute due schedules
└── list_schedules() → Vec<Schedule>
```

**Implementação:** `notify` crate para fs events, `tokio` para scheduling.

### 4. SQLite Layer (`src-tauri/src/db/`)

Responsabilidade: Persistência, migrations, queries tipadas.

```
Database
├── init() → Run migrations, return pool
├── migrate() → Apply pending migrations
├── rules::*       → CRUD de regras
├── profiles::*    → CRUD de perfis
├── runs::*        → Histórico de execuções
├── settings::*    → Configurações
├── help::*        → Favoritos, views
├── tour::*        → Estado do tour
└── tips::*        → Estado das dicas
```

**Migration strategy:** Arquivos SQL numerados (`001_initial.sql`, `002_add_tips.sql`).

### 5. Logger Service (`src-tauri/src/logger/`)

```
Logger
├── info/warn/error(message, context)
├── rotate() → Rotacionar arquivos de log por tamanho
├── export_diagnostic() → Gerar arquivo .zip de diagnóstico
└── Destino: {app_data}/logs/deskcraft-YYYY-MM-DD.log
```

### 6. Help Center (Frontend + dados estáticos)

```
HelpCenter
├── articles/         → Markdown files (bundled)
├── index.json        → Search index (pre-built)
├── ArticleViewer     → Render markdown
├── SearchBar         → Busca local por termos
├── Favorites         → Salvar artigos favoritos (SQLite)
├── RecentViews       → Últimos artigos vistos (SQLite)
└── Categories        → Guia, Tutoriais, FAQ, Glossário, Troubleshooting
```

### 7. Product Tour (Frontend + estado SQLite)

```
ProductTour
├── TourOverlay       → Overlay escuro com highlight
├── TourStep          → Tooltip posicionado no elemento alvo
├── TourProvider      → Context com estado e navegação
├── steps.json        → Definição dos passos
└── SQLite            → tour_state (seen, step, completed_at)
```

### 8. Tips Engine (Rust + Frontend)

```
TipsEngine (Rust side)
├── evaluate_tips(context) → Vec<Tip>
│   ├── DesktopClutter     (>30 items on Desktop)
│   ├── PdfAccumulation    (>10 PDFs in folder)
│   ├── InstallerPileup    (.exe/.msi/.dmg accumulation)
│   ├── LargeFiles         (files > 500MB in watched folder)
│   └── InactiveFiles      (files not accessed in 30+ days)
├── dismiss(tip_id)
├── accept(tip_id)
└── get_cooldown(tip_id) → Duration

TipsBanner (React side)
├── TipCard             → UI do tip com ações
├── TipsProvider        → Context com estado
└── useTips() hook      → Fetch/dismiss/accept
```

## Comunicação Frontend ↔ Backend

```
Frontend (React)              Backend (Rust/Tauri)
     │                              │
     │── invoke("scan_folder") ────►│── OrganizerEngine::scan()
     │◄── Result<Vec<FileEntry>> ───│
     │                              │
     │── invoke("simulate") ───────►│── OrganizerEngine::simulate()
     │◄── Result<SimulationResult> ─│
     │                              │
     │── invoke("execute_run") ────►│── OrganizerEngine::execute()
     │◄── Event("run:progress") ────│   (streaming progress)
     │◄── Result<ExecutionResult> ──│
     │                              │
     │── listen("tip:new") ────────►│── TipsEngine::evaluate()
     │◄── Event("tip:new", tip) ────│
     │                              │
     │── listen("watcher:event") ──►│── Watcher::on_change()
     │◄── Event("watcher:event") ───│
```

## Fluxo de Dados

```
User Action → React Component → Zustand Store → Tauri invoke()
                                                      │
                                                      ▼
                                               Rust Command Handler
                                                      │
                                          ┌───────────┼───────────┐
                                          ▼           ▼           ▼
                                       SQLite      FileSystem   Logger
                                          │           │           │
                                          └───────────┼───────────┘
                                                      │
                                                      ▼
                                               Result/Event
                                                      │
                                                      ▼
                                    React ← Zustand Update ← IPC Response
```

## Segurança

- **Permissões Tauri**: Mínimas (só pastas selecionadas pelo usuário)
- **Validação de paths**: Canonicalizar e validar contra traversal
- **Regex sanitization**: Timeout + limite de complexidade (Pro only)
- **No shell execution**: Nunca executar comandos shell
- **Conflict resolution**: Nunca sobrescrever sem estratégia definida

# DeskCraft — Estrutura do Projeto

```
DeskCraft/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── PROJECT_STRUCTURE.md
│   └── BACKLOG.md
│
├── src-tauri/                          # Backend Rust (Tauri)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── icons/                          # App icons
│   ├── migrations/                     # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_seed_defaults.sql
│   │   └── 003_help_and_tour.sql
│   └── src/
│       ├── main.rs                     # Entry point
│       ├── lib.rs                      # Module declarations
│       ├── commands/                   # Tauri IPC commands
│       │   ├── mod.rs
│       │   ├── organizer_commands.rs
│       │   ├── rule_commands.rs
│       │   ├── profile_commands.rs
│       │   ├── settings_commands.rs
│       │   ├── help_commands.rs
│       │   ├── tour_commands.rs
│       │   └── tips_commands.rs
│       ├── db/                         # SQLite layer
│       │   ├── mod.rs
│       │   ├── connection.rs
│       │   ├── migrations.rs
│       │   ├── models.rs
│       │   └── queries/
│       │       ├── mod.rs
│       │       ├── rules.rs
│       │       ├── profiles.rs
│       │       ├── runs.rs
│       │       ├── settings.rs
│       │       ├── help.rs
│       │       ├── tour.rs
│       │       └── tips.rs
│       ├── organizer/                  # Core engine
│       │   ├── mod.rs
│       │   ├── scanner.rs
│       │   ├── simulator.rs
│       │   ├── executor.rs
│       │   ├── rollback.rs
│       │   └── conflict.rs
│       ├── rules/                      # Rule engine
│       │   ├── mod.rs
│       │   ├── engine.rs
│       │   ├── conditions.rs
│       │   └── actions.rs
│       ├── watcher/                    # File watcher
│       │   ├── mod.rs
│       │   ├── fs_watcher.rs
│       │   └── scheduler.rs
│       ├── tips/                       # Tips engine
│       │   ├── mod.rs
│       │   ├── engine.rs
│       │   └── heuristics.rs
│       ├── logger/                     # Logging
│       │   ├── mod.rs
│       │   └── service.rs
│       └── license/                    # License validation
│           ├── mod.rs
│           └── validator.rs
│
├── src/                                # Frontend React
│   ├── main.tsx                        # Entry point
│   ├── App.tsx                         # Root component
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css             # Tailwind + custom
│   ├── components/
│   │   ├── ui/                         # Primitivos reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/                     # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── TrayMenu.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── dashboard/                  # Dashboard
│   │   │   ├── DashboardView.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentRuns.tsx
│   │   │   └── FolderStats.tsx
│   │   ├── rules/                      # Rule Builder
│   │   │   ├── RuleListView.tsx
│   │   │   ├── RuleBuilder.tsx
│   │   │   ├── ConditionRow.tsx
│   │   │   └── ActionRow.tsx
│   │   ├── profiles/                   # Perfis
│   │   │   ├── ProfileListView.tsx
│   │   │   └── ProfileEditor.tsx
│   │   ├── history/                    # Histórico
│   │   │   ├── HistoryView.tsx
│   │   │   ├── RunDetail.tsx
│   │   │   └── RollbackDialog.tsx
│   │   ├── simulation/                 # Simulação
│   │   │   ├── SimulationView.tsx
│   │   │   └── SimulationPreview.tsx
│   │   ├── settings/                   # Configurações
│   │   │   ├── SettingsView.tsx
│   │   │   ├── GeneralSettings.tsx
│   │   │   ├── FolderSettings.tsx
│   │   │   └── LicenseSettings.tsx
│   │   ├── help/                       # Help Center
│   │   │   ├── HelpView.tsx
│   │   │   ├── ArticleViewer.tsx
│   │   │   ├── HelpSearch.tsx
│   │   │   ├── HelpSidebar.tsx
│   │   │   └── HelpFavorites.tsx
│   │   ├── tour/                       # Product Tour
│   │   │   ├── TourProvider.tsx
│   │   │   ├── TourOverlay.tsx
│   │   │   └── TourStep.tsx
│   │   └── tips/                       # Tips
│   │       ├── TipsProvider.tsx
│   │       └── TipBanner.tsx
│   ├── hooks/                          # Custom hooks
│   │   ├── useRules.ts
│   │   ├── useProfiles.ts
│   │   ├── useOrganizer.ts
│   │   ├── useSettings.ts
│   │   ├── useHelp.ts
│   │   ├── useTour.ts
│   │   └── useTips.ts
│   ├── stores/                         # Zustand stores
│   │   ├── appStore.ts
│   │   ├── ruleStore.ts
│   │   ├── profileStore.ts
│   │   ├── historyStore.ts
│   │   ├── settingsStore.ts
│   │   ├── helpStore.ts
│   │   ├── tourStore.ts
│   │   └── tipsStore.ts
│   ├── lib/                            # Utilities
│   │   ├── tauri.ts                    # Tauri invoke wrappers
│   │   ├── formatters.ts              # Date, size formatters
│   │   └── constants.ts               # App constants
│   ├── types/                          # TypeScript types
│   │   ├── rules.ts
│   │   ├── profiles.ts
│   │   ├── runs.ts
│   │   ├── settings.ts
│   │   ├── help.ts
│   │   ├── tour.ts
│   │   └── tips.ts
│   └── content/                        # Help Center content
│       ├── help/
│       │   ├── index.json              # Article index + search data
│       │   ├── getting-started.md
│       │   ├── tutorial-rules.md
│       │   ├── tutorial-simulation.md
│       │   ├── tutorial-profiles.md
│       │   ├── tutorial-watcher.md
│       │   ├── tutorial-rollback.md
│       │   ├── faq.md
│       │   ├── glossary.md
│       │   └── troubleshooting.md
│       └── tour/
│           └── steps.json              # Tour step definitions
│
├── index.html                          # Vite entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

## Padrões de Código

### Rust
- **Formatter**: `rustfmt` (default)
- **Linter**: `clippy` com `-D warnings`
- **Error handling**: `thiserror` + `anyhow` para erros tipados
- **Naming**: snake_case para funções/variáveis, PascalCase para types/structs

### TypeScript/React
- **Linter**: ESLint com config estrita
- **Formatter**: Prettier (2 spaces, single quotes, trailing comma)
- **Components**: Functional components com hooks
- **State**: Zustand stores (sem Redux)
- **Styling**: Tailwind CSS + CSS modules quando necessário
- **Naming**: camelCase para funções/variáveis, PascalCase para componentes

### Commits
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Exemplos:
  - `feat: add rule builder with IF/THEN conditions`
  - `fix: resolve file conflict when destination exists`
  - `refactor: extract scanner into separate module`

### Testes
- **Rust**: `#[cfg(test)]` inline + `tests/` directory para integration
- **React**: Vitest + React Testing Library
- **Coverage target**: 80% para core engine, 60% para UI

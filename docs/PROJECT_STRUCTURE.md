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
├── installer/                             # Inno Setup installer
│   ├── deskcraft.iss                      # Script de instalação
│   ├── wizard-image.bmp                   # Imagem lateral do wizard
│   ├── wizard-small.bmp                   # Ícone pequeno do wizard
│   └── Output/
│       └── DeskCraft-Setup-1.0.0.exe      # Instalador gerado
│
├── scripts/                               # Scripts utilitários
│   ├── generate_icons.py                  # Gera ícones do app (ICO + PNG)
│   └── generate_wizard_images.py          # Gera imagens BMP do wizard
│
├── src-tauri/                             # Backend Rust (Tauri v2)
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── icons/                             # App icons (ICO + PNG 32-512px)
│   ├── migrations/                        # SQL migrations
│   │   ├── 001_initial_schema.sql         # 16 tabelas (profiles, rules, schedules, etc.)
│   │   ├── 002_seed_defaults.sql          # Configurações e perfil padrão
│   │   ├── 003_help_and_tour.sql          # Dados do tour e help
│   │   ├── 004_default_rules.sql          # 6 regras padrão (imagens, docs, etc.)
│   │   └── 005_extra_rules.sql            # 4 regras extras (fontes, código, design, e-books)
│   └── src/
│       ├── main.rs                        # Entry point
│       ├── lib.rs                         # Módulos + IPC commands + scheduler loop
│       ├── commands/                      # Tauri IPC commands (37 comandos)
│       │   ├── mod.rs
│       │   ├── organizer_commands.rs      # scan, simulate, execute, rollback
│       │   ├── rule_commands.rs           # CRUD de regras, condições e ações
│       │   ├── profile_commands.rs        # CRUD de perfis + associação de regras
│       │   ├── schedule_commands.rs       # CRUD de agendamentos
│       │   ├── settings_commands.rs       # get/set configurações
│       │   ├── watched_folder_commands.rs # Gerenciar pastas monitoradas
│       │   ├── history_commands.rs        # Listar execuções e itens
│       │   ├── help_commands.rs           # Favoritos e views do Help Center
│       │   ├── tour_commands.rs           # Estado do product tour
│       │   ├── tips_commands.rs           # Engine de dicas contextuais
│       │   └── license_commands.rs        # Ativação e verificação de licença
│       ├── db/                            # SQLite layer (rusqlite)
│       │   ├── mod.rs
│       │   ├── connection.rs              # Init, WAL mode, foreign keys
│       │   ├── migrations.rs              # Runner de migrations incremental
│       │   ├── models.rs                  # Structs (Profile, Rule, Schedule, etc.)
│       │   └── queries/
│       │       ├── mod.rs
│       │       ├── rules.rs               # Regras + condições + ações
│       │       ├── profiles.rs            # Perfis + profile_rules
│       │       ├── runs.rs                # Histórico de execuções
│       │       ├── schedules.rs           # Agendamentos + cron + next_run_at
│       │       ├── settings.rs            # Chave-valor de configurações
│       │       ├── watched_folders.rs     # Pastas monitoradas + find_or_create
│       │       ├── help.rs                # Favoritos e visualizações
│       │       ├── tour.rs                # Estado do tour
│       │       └── tips.rs                # Estado das dicas
│       ├── organizer/                     # Core engine de organização
│       │   ├── mod.rs
│       │   ├── scanner.rs                 # Escaneia pasta → lista de FileEntry
│       │   ├── simulator.rs               # Simula regras → SimulationResult
│       │   ├── executor.rs                # Executa movimentações reais
│       │   ├── rollback.rs                # Reverte uma execução
│       │   └── conflict.rs                # Estratégias de conflito (suffix, skip, overwrite)
│       ├── rules/                         # Rule engine
│       │   ├── mod.rs
│       │   ├── engine.rs                  # Avalia regras contra arquivos
│       │   ├── conditions.rs              # Matchers (extensão, tamanho, nome, data)
│       │   └── actions.rs                 # Ações (mover, renomear, tag)
│       ├── watcher/                       # File watcher + scheduler
│       │   ├── mod.rs
│       │   ├── fs_watcher.rs              # Watcher de filesystem (notify crate)
│       │   └── scheduler.rs               # Parser de cron + cálculo de next_run_at
│       ├── tips/                          # Tips engine
│       │   ├── mod.rs
│       │   ├── engine.rs                  # Avaliação de dicas contextuais
│       │   └── heuristics.rs              # Heurísticas para sugestões
│       ├── license/                       # Sistema de licenciamento
│       │   ├── mod.rs
│       │   ├── service.rs                 # API client (verify + activate)
│       │   ├── hardware.rs                # Fingerprint SHA-256 (CPU + MB + hostname)
│       │   ├── storage.rs                 # Persistência em license.dat (base64)
│       │   └── validator.rs
│       └── logger/                        # Logging
│           ├── mod.rs
│           └── service.rs
│
├── src/                                   # Frontend React + TypeScript
│   ├── main.tsx                           # Entry point
│   ├── App.tsx                            # Root + ContentRouter (view routing)
│   ├── vite-env.d.ts
│   ├── assets/
│   │   ├── logo.png                       # Logo do DeskCraft
│   │   └── styles/
│   │       └── globals.css                # Tailwind + custom + animações
│   ├── components/
│   │   ├── ui/                            # Primitivos reutilizáveis (12 componentes)
│   │   │   ├── index.ts
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── layout/                        # Layout
│   │   │   ├── index.ts
│   │   │   ├── Sidebar.tsx                # Navegação lateral com logo
│   │   │   ├── Header.tsx                 # Barra superior
│   │   │   └── MainLayout.tsx
│   │   ├── dashboard/                     # Dashboard
│   │   │   ├── index.ts
│   │   │   ├── DashboardView.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   ├── RecentRuns.tsx
│   │   │   └── FolderOverview.tsx
│   │   ├── rules/                         # Rule Builder
│   │   │   ├── index.ts
│   │   │   ├── RuleListView.tsx
│   │   │   ├── RuleBuilder.tsx            # Editor visual de regras IF/THEN
│   │   │   ├── RulePreview.tsx
│   │   │   ├── ConditionRow.tsx
│   │   │   └── ActionRow.tsx
│   │   ├── profiles/                      # Perfis
│   │   │   ├── index.ts
│   │   │   ├── ProfileListView.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   └── ProfileCard.tsx
│   │   ├── simulation/                    # Simulação
│   │   │   ├── index.ts
│   │   │   ├── SimulationView.tsx
│   │   │   └── SimulationPreview.tsx
│   │   ├── history/                       # Histórico de execuções
│   │   │   ├── index.ts
│   │   │   ├── HistoryView.tsx
│   │   │   ├── RunDetail.tsx
│   │   │   └── RollbackDialog.tsx
│   │   ├── scheduling/                    # Agendamento
│   │   │   ├── index.ts
│   │   │   └── SchedulingView.tsx
│   │   ├── settings/                      # Configurações
│   │   │   ├── index.ts
│   │   │   ├── SettingsView.tsx
│   │   │   ├── GeneralSettings.tsx
│   │   │   ├── FolderSettings.tsx
│   │   │   ├── ConflictSettings.tsx
│   │   │   ├── TipsSettings.tsx
│   │   │   ├── LicenseSettings.tsx
│   │   │   └── AboutSection.tsx
│   │   ├── help/                          # Help Center
│   │   │   ├── index.ts
│   │   │   ├── HelpView.tsx
│   │   │   ├── ArticleViewer.tsx
│   │   │   ├── HelpSearch.tsx
│   │   │   ├── HelpSidebar.tsx
│   │   │   └── HelpFavorites.tsx
│   │   ├── tour/                          # Product Tour
│   │   │   ├── index.ts
│   │   │   ├── TourProvider.tsx
│   │   │   ├── TourController.tsx
│   │   │   ├── TourOverlay.tsx
│   │   │   └── TourStep.tsx
│   │   ├── tips/                          # Dicas contextuais
│   │   │   ├── index.ts
│   │   │   ├── TipsProvider.tsx
│   │   │   ├── TipBanner.tsx
│   │   │   └── TipCard.tsx
│   │   └── license/                       # Tela de login/ativação
│   │       ├── index.ts
│   │       └── LoginView.tsx
│   ├── hooks/                             # Custom hooks
│   │   ├── useHelp.ts
│   │   └── useTips.ts
│   ├── stores/                            # Zustand stores (11 stores)
│   │   ├── index.ts                       # Re-exports
│   │   ├── appStore.ts                    # currentView, theme, sidebar
│   │   ├── ruleStore.ts                   # Regras CRUD
│   │   ├── profileStore.ts               # Perfis CRUD
│   │   ├── historyStore.ts               # Histórico de execuções
│   │   ├── scheduleStore.ts              # Agendamentos CRUD
│   │   ├── settingsStore.ts              # Configurações
│   │   ├── licenseStore.ts               # Estado da licença
│   │   ├── helpStore.ts                  # Help Center
│   │   ├── tourStore.ts                  # Product Tour
│   │   └── tipsStore.ts                  # Dicas
│   ├── lib/                               # Utilitários
│   │   ├── tauri.ts                       # Wrapper de invoke com fallback
│   │   ├── formatters.ts                  # Formatadores de data/tamanho
│   │   └── constants.ts                   # Constantes (VIEWS, etc.)
│   ├── types/                             # TypeScript types
│   │   ├── index.ts
│   │   ├── rules.ts
│   │   ├── profiles.ts
│   │   ├── runs.ts
│   │   ├── schedules.ts
│   │   ├── settings.ts
│   │   ├── license.ts
│   │   ├── help.ts
│   │   ├── tour.ts
│   │   └── tips.ts
│   └── content/                           # Conteúdo estático (pt-BR)
│       ├── help/
│       │   ├── index.json                 # Índice de artigos + dados de busca
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
│           └── steps.json                 # 6 passos do product tour
│
├── Logo.png                               # Logo original
├── Logo_transparent.png                   # Logo com fundo transparente
├── Logo_white.png                         # Logo branco (para ícones)
├── index.html                             # Vite entry
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .prettierrc
└── .gitignore
```

## Números do Projeto

| Métrica | Valor |
|---|---|
| Arquivos Rust (.rs) | 47 |
| Arquivos TypeScript/React (.tsx/.ts) | 70+ |
| Migrations SQL | 5 |
| Comandos IPC (Tauri) | 37 |
| Componentes UI | 12 |
| Views/Telas | 10 |
| Zustand Stores | 11 |
| Regras padrão | 10 |
| Artigos de ajuda (pt-BR) | 9 |
| Passos do tour | 6 |

## Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | Tauri v2, Rust, rusqlite, notify, chrono, regex, uuid, reqwest |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion |
| **Banco** | SQLite (bundled via rusqlite), WAL mode |
| **Ícones** | lucide-react |
| **Instalador** | Inno Setup 6 + NSIS (Tauri) + MSI (WiX) |
| **Licença** | API online (reqwest) + cache local (base64/JSON) |

## Padrões de Código

### Rust
- **Formatter**: `rustfmt` (default)
- **Error handling**: `anyhow` para erros genéricos
- **Naming**: snake_case para funções/variáveis, PascalCase para types/structs
- **DB**: Queries raw SQL com `rusqlite::params![]`

### TypeScript/React
- **Formatter**: Prettier (2 spaces, single quotes, trailing comma)
- **Components**: Functional components com hooks
- **State**: Zustand stores (sem Redux)
- **Styling**: Tailwind CSS
- **Naming**: camelCase para funções/variáveis, PascalCase para componentes
- **Routing**: View-based via `appStore.currentView` (sem react-router)

### Commits
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

## Build & Distribuição

```bash
# Desenvolvimento
npx tauri dev

# Build de produção (gera .exe + .msi + .nsis)
npx tauri build

# Instalador Inno Setup (requer build anterior)
"C:/Program Files (x86)/Inno Setup 6/ISCC.exe" installer/deskcraft.iss
```

| Artefato | Tamanho | Caminho |
|---|---|---|
| Executável | ~13 MB | `src-tauri/target/release/deskcraft.exe` |
| NSIS installer | ~4.8 MB | `src-tauri/target/release/bundle/nsis/DeskCraft_1.0.0_x64-setup.exe` |
| MSI installer | ~4.8 MB | `src-tauri/target/release/bundle/msi/DeskCraft_1.0.0_x64_en-US.msi` |
| Inno Setup | ~6.1 MB | `installer/Output/DeskCraft-Setup-1.0.0.exe` |

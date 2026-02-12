# DeskCraft — MVP Backlog (v1.0)

## Sprint 0: Setup & Foundation
- [x] B-001: Inicializar projeto Tauri + React + TypeScript + Vite
- [x] B-002: Configurar Tailwind CSS + PostCSS
- [x] B-003: Configurar ESLint + Prettier + rustfmt + clippy
- [x] B-004: Configurar SQLite (rusqlite) com connection pool
- [x] B-005: Criar sistema de migrations + migration runner
- [x] B-006: Aplicar migration 001 (schema inicial)
- [x] B-007: Aplicar migration 002 (seed de defaults)
- [ ] B-008: Configurar Zustand stores básicos
- [ ] B-009: Criar layout base (Sidebar + Header + MainContent)
- [ ] B-010: Configurar tema claro/escuro com Tailwind

## Sprint 1: Core Engine
- [ ] B-011: Scanner — listar arquivos de uma pasta com metadata
- [ ] B-012: Rule Engine — parser de conditions (extension, keyword, size, date)
- [ ] B-013: Rule Engine — evaluator (match file against conditions)
- [ ] B-014: Rule Engine — action executor (move_to_folder, rename)
- [ ] B-015: Simulator — dry-run que gera lista de ações sem executar
- [ ] B-016: Executor — executar ações com progress callback
- [ ] B-017: Conflict resolver — suffix strategy
- [ ] B-018: Conflict resolver — conflict_folder strategy
- [ ] B-019: Rollback — reverter um run completo
- [ ] B-020: Testes unitários para rule engine (mínimo 15 cases)
- [ ] B-021: Testes de integração com pasta sandbox

## Sprint 2: Rule Builder UI
- [ ] B-022: CRUD de regras (Tauri commands)
- [ ] B-023: RuleListView — listar regras com toggle enable/disable
- [ ] B-024: RuleBuilder — formulário visual IF→THEN
- [ ] B-025: ConditionRow — seleção de campo, operador, valor
- [ ] B-026: ActionRow — seleção de ação e configuração
- [ ] B-027: Validação de regras (frontend + backend)
- [ ] B-028: Preview de regra (mostrar exemplos de match)

## Sprint 3: Profiles & Dashboard
- [ ] B-029: CRUD de perfis (Tauri commands)
- [ ] B-030: ProfileListView — listar e ativar perfis
- [ ] B-031: ProfileEditor — nome, ícone, cor, regras associadas
- [ ] B-032: Dashboard — visão geral com stats rápidas
- [ ] B-033: QuickActions — botões "Organizar Agora" e "Simular"
- [ ] B-034: RecentRuns — últimos 5 runs com status
- [ ] B-035: FolderStats — contagem de arquivos por pasta monitorada

## Sprint 4: Simulation & History
- [ ] B-036: SimulationView — executar e mostrar preview
- [ ] B-037: SimulationPreview — tree view de ações planejadas
- [ ] B-038: Botão "Executar" a partir de simulação
- [ ] B-039: HistoryView — listar runs com filtro por status/data
- [ ] B-040: RunDetail — detalhes de cada run item
- [ ] B-041: RollbackDialog — confirmar e executar rollback
- [ ] B-042: Progress bar durante execução/rollback

## Sprint 5: Watcher & Scheduler
- [ ] B-043: Watcher — monitorar pasta com `notify` crate
- [ ] B-044: Watcher — debounce de eventos (300ms)
- [ ] B-045: Watcher — aplicar regras do perfil ativo em novos arquivos
- [ ] B-046: Scheduler — modelo simplificado (daily, weekly, hourly)
- [ ] B-047: Scheduler — UI para criar/editar agendamentos
- [ ] B-048: Scheduler — tick loop em background
- [ ] B-049: FolderSettings — adicionar/remover pastas monitoradas
- [ ] B-050: Watch mode selector (manual/realtime/scheduled)

## Sprint 6: Help Center
- [ ] B-051: Estrutura de conteúdo em Markdown (8+ artigos)
- [ ] B-052: Index de busca local (JSON com termos + slugs)
- [ ] B-053: HelpView — layout com sidebar de categorias
- [ ] B-054: ArticleViewer — renderizar Markdown com estilo
- [ ] B-055: HelpSearch — busca por termos no index local
- [ ] B-056: HelpFavorites — salvar/remover favoritos (SQLite)
- [ ] B-057: Artigos recentes — últimos 5 visualizados
- [ ] B-058: Conteúdo: Getting Started (primeiros passos)
- [ ] B-059: Conteúdo: Tutoriais (rules, simulation, profiles, watcher, rollback)
- [ ] B-060: Conteúdo: FAQ + Glossário + Troubleshooting

## Sprint 7: Product Tour
- [ ] B-061: TourProvider — context com estado e navegação
- [ ] B-062: TourOverlay — overlay escuro com highlight de elemento
- [ ] B-063: TourStep — tooltip posicionado com texto e ações
- [ ] B-064: Definição de 6 steps (dashboard, simular, regras, perfis, histórico, watcher)
- [ ] B-065: Persistência do tour state no SQLite
- [ ] B-066: Auto-iniciar tour no primeiro uso
- [ ] B-067: Botão "Fazer Tour" no Help Center

## Sprint 8: Tips Engine
- [ ] B-068: TipsEngine (Rust) — avaliar heurísticas
- [ ] B-069: Heurística: Desktop com >30 itens
- [ ] B-070: Heurística: Muitos PDFs acumulados
- [ ] B-071: Heurística: Instaladores acumulados (.exe/.msi/.dmg/.deb)
- [ ] B-072: Cooldown e tracking no SQLite
- [ ] B-073: TipBanner (React) — UI discreta com ações aceitar/dispensar
- [ ] B-074: TipsProvider — buscar tips e gerenciar estado
- [ ] B-075: Settings para desativar/ajustar frequência de tips
- [ ] B-076: Testes unitários para tips engine

## Sprint 9: System Tray & Settings
- [ ] B-077: Tray icon com menu: Organizar Agora, Simular, Trocar Perfil, Abrir
- [ ] B-078: GeneralSettings — tema, idioma, startup
- [ ] B-079: Conflict strategy global (settings)
- [ ] B-080: LicenseSettings — validar chave offline, mostrar status trial
- [ ] B-081: Logger — arquivo rotativo local
- [ ] B-082: Exportar diagnóstico (.zip com logs + config sanitizada)

## Sprint 10: Polish & Release
- [ ] B-083: Microanimações (Framer Motion) em transições de página
- [ ] B-084: Loading states e empty states para todas as views
- [ ] B-085: Acessibilidade — keyboard navigation em todas as views
- [ ] B-086: Acessibilidade — ARIA labels e contraste WCAG AA
- [ ] B-087: Error boundaries e tratamento de erros global
- [ ] B-088: Build Windows (.exe via NSIS/WiX)
- [ ] B-089: Build macOS (.dmg)
- [ ] B-090: Build Linux (.AppImage/.deb)
- [ ] B-091: Versionamento semântico + CHANGELOG
- [ ] B-092: Preparar Inno Setup config (Windows installer)
- [ ] B-093: Testes E2E críticos (organizar, simular, rollback)
- [ ] B-094: Review de segurança (path traversal, regex DoS)
- [ ] B-095: README final + screenshots

## Prioridade de Implementação

1. **P0 (Crítico)**: B-001→B-021 — Sem engine, não existe produto.
2. **P0 (Crítico)**: B-022→B-028 — Sem regras, engine é inútil.
3. **P1 (Alto)**: B-029→B-042 — Dashboard, perfis, simulação, histórico.
4. **P1 (Alto)**: B-043→B-050 — Watcher torna o produto "automático".
5. **P2 (Médio)**: B-051→B-076 — Help, Tour e Tips (diferencial).
6. **P3 (Baixo)**: B-077→B-095 — Polish, tray, release.

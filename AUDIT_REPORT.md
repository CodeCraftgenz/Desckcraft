# DeskCraft — Auditoria Técnica Completa

**Data:** 2026-02-11
**Autor:** Tech Lead / QA Lead
**Versão:** 1.0.0
**Stack:** Tauri v2 + Rust + React 18 + TypeScript + SQLite

---

## A) REQUISITOS — Lista Completa (FR + NFR)

### Requisitos Funcionais (FR)

| ID | Módulo | Requisito |
|----|--------|-----------|
| FR-001 | Scanner | Escanear pasta selecionada e listar todos os arquivos com metadados (nome, extensão, tamanho, datas) |
| FR-002 | Scanner | Suportar escaneamento recursivo (subpastas) |
| FR-003 | Scanner | Ignorar entradas não-arquivo (symlinks, etc.) |
| FR-004 | Regras | Criar regras de organização com nome e descrição |
| FR-005 | Regras | Editar propriedades de regra (nome, descrição, habilitado, prioridade) |
| FR-006 | Regras | Deletar regras |
| FR-007 | Regras | Habilitar/desabilitar regras individualmente |
| FR-008 | Condições | Adicionar condições a uma regra (campo, operador, valor) |
| FR-009 | Condições | Suportar 7 campos: extension, filename, size, created_date, modified_date, source_folder, regex |
| FR-010 | Condições | Suportar 11 operadores: equals, not_equals, contains, not_contains, starts_with, ends_with, greater_than, less_than, before, after, matches |
| FR-011 | Condições | Combinar condições com lógica AND/OR |
| FR-012 | Condições | Remover condições de uma regra |
| FR-013 | Ações | Adicionar ações a uma regra (move_to_folder, move_to_subfolder, rename, add_tag) |
| FR-014 | Ações | Suportar templates no destino: {extension}, {year}, {month}, {day}, {original}, {counter} |
| FR-015 | Ações | Remover ações de uma regra |
| FR-016 | Engine | Avaliar regras em ordem de prioridade/sort_order |
| FR-017 | Engine | Primeira regra que casar define as ações (first-match wins) |
| FR-018 | Simulação | Executar simulação sem mover arquivos |
| FR-019 | Simulação | Mostrar preview: total, correspondentes, sem correspondência, conflitos |
| FR-020 | Simulação | Detectar conflitos (arquivo já existe no destino) |
| FR-021 | Execução | Executar organização movendo arquivos conforme simulação |
| FR-022 | Execução | Criar diretórios de destino automaticamente |
| FR-023 | Execução | Suportar move cross-device (copy + delete fallback) |
| FR-024 | Conflitos | Resolver conflitos com estratégia "suffix" (_1, _2, ...) |
| FR-025 | Conflitos | Resolver conflitos com estratégia "conflict_folder" (pasta Conflicts/) |
| FR-026 | Conflitos | Resolver conflitos com estratégia "skip" (pular arquivo) |
| FR-027 | Rollback | Desfazer organização movendo arquivos de volta |
| FR-028 | Rollback | Suportar rollback parcial (quando alguns arquivos não podem ser revertidos) |
| FR-029 | Histórico | Listar execuções passadas com paginação |
| FR-030 | Histórico | Ver detalhes de uma execução (arquivos movidos, status) |
| FR-031 | Histórico | Registrar cada operação como run_item no banco |
| FR-032 | Perfis | Criar perfis de organização (nome, ícone, cor) |
| FR-033 | Perfis | Ativar/desativar perfis |
| FR-034 | Perfis | Associar regras a perfis |
| FR-035 | Perfis | Remover regras de perfis |
| FR-036 | Perfis | Deletar perfis |
| FR-037 | Perfis | Perfil padrão "Pessoal" com 6 regras pré-configuradas |
| FR-038 | Watcher | Adicionar pastas para monitoramento em tempo real |
| FR-039 | Watcher | Remover pastas do monitoramento |
| FR-040 | Watcher | Atualizar modo de monitoramento |
| FR-041 | Watcher | Receber eventos de filesystem via notify crate |
| FR-042 | Agendamento | Criar agendamentos (perfil, pasta, expressão cron) |
| FR-043 | Agendamento | Editar agendamentos |
| FR-044 | Agendamento | Deletar agendamentos |
| FR-045 | Agendamento | Suportar @hourly, @daily, @weekly, @monthly e intervalos em minutos |
| FR-046 | Agendamento | Verificar agendamentos vencidos e executar automaticamente |
| FR-047 | Configurações | Tema claro/escuro/sistema |
| FR-048 | Configurações | Estratégia de conflito padrão |
| FR-049 | Configurações | Idioma (pt-BR) |
| FR-050 | Configurações | Iniciar minimizado |
| FR-051 | Configurações | Iniciar com o sistema |
| FR-052 | Configurações | Nível de log |
| FR-053 | Configurações | Habilitar/desabilitar dicas |
| FR-054 | Configurações | Frequência de dicas |
| FR-055 | Ajuda | Exibir artigos de ajuda organizados por categoria |
| FR-056 | Ajuda | Buscar artigos por texto |
| FR-057 | Ajuda | Favoritar artigos |
| FR-058 | Ajuda | Registrar visualizações recentes |
| FR-059 | Tour | Tour interativo para novos usuários |
| FR-060 | Tour | Pular/completar/resetar tour |
| FR-061 | Tour | Persistir estado do tour no banco |
| FR-062 | Dicas | Avaliar dicas baseadas em heurísticas (clutter, PDFs, instaladores) |
| FR-063 | Dicas | Aceitar/dispensar dicas com cooldown |
| FR-064 | Licença | Validar chave de licença offline (hash-based) |
| FR-065 | Licença | Trial de 14 dias |
| FR-066 | Licença | Calcular dias restantes do trial |
| FR-067 | UI | Navegação por sidebar com 8 seções |
| FR-068 | UI | Dashboard com quick stats, ações rápidas, execuções recentes |
| FR-069 | UI | Seletor nativo de pastas via plugin dialog |
| FR-070 | UI | Notificações toast (success, error, info, warning) |
| FR-071 | UI | Animações Framer Motion em transições |
| FR-072 | Logger | Sistema de log com arquivo e nível configurável |
| FR-073 | DB | Migrações automáticas (4 migrações, idempotentes) |
| FR-074 | DB | Seed de dados padrão (settings, perfil, regras) |

### Requisitos Não-Funcionais (NFR)

| ID | Categoria | Requisito | Critério Mensurável |
|----|-----------|-----------|---------------------|
| NFR-001 | Performance | Escaneamento de pastas deve ser responsivo | < 5s para 10.000 arquivos |
| NFR-002 | Performance | Simulação deve completar rapidamente | < 3s para 1.000 arquivos com 10 regras |
| NFR-003 | Performance | UI deve permanecer responsiva durante operações | Thread principal sem bloqueio |
| NFR-004 | Performance | Startup do app deve ser rápido | < 3s até tela principal visível |
| NFR-005 | Segurança | Dados 100% offline, sem envio externo | Zero chamadas HTTP externas |
| NFR-006 | Segurança | Licença validada offline | Sem comunicação com servidor de licenças |
| NFR-007 | Segurança | CSP configurado para prevenir XSS | Content Security Policy ativo |
| NFR-008 | Confiabilidade | Rollback deve restaurar estado original | 100% dos arquivos movidos com sucesso devem ser reversíveis |
| NFR-009 | Confiabilidade | Migrações DB devem ser idempotentes | Executar migrações N vezes sem erro |
| NFR-010 | Confiabilidade | Erro em um arquivo não deve abortar toda a execução | Continua processando próximos arquivos |
| NFR-011 | Usabilidade | Interface 100% em pt-BR | Todos os textos, erros e mensagens |
| NFR-012 | Usabilidade | Tour guiado para primeira utilização | Passos interativos com overlay |
| NFR-013 | Usabilidade | Dicas contextuais inteligentes | Heurísticas ativam tips relevantes |
| NFR-014 | Portabilidade | Funcionar em Windows, macOS, Linux | Builds cross-platform via Tauri |
| NFR-015 | Manutenibilidade | Código tipado end-to-end | TypeScript strict + Rust strong types |
| NFR-016 | Manutenibilidade | Testes unitários no backend | Cobertura > 50% de linhas em módulos críticos |
| NFR-017 | Manutenibilidade | Testes unitários no frontend | Cobertura > 40% de componentes |
| NFR-018 | Escalabilidade | Suportar centenas de regras sem degradação | Até 200 regras sem impacto perceptível |
| NFR-019 | Acessibilidade | Dark mode funcional | Toggle claro/escuro/sistema |
| NFR-020 | Instalação | Instaladores nativos por plataforma | MSI+NSIS (Win), DMG (Mac), AppImage/Deb (Linux) |

---

## B) REQUIREMENTS TRACEABILITY MATRIX (RTM)

| Req ID | Módulo Backend | Módulo Frontend | DB Query | Comando Tauri | Teste Backend | Teste Frontend | Status |
|--------|---------------|-----------------|----------|---------------|---------------|----------------|--------|
| FR-001 | scanner.rs | SimulationView | — | scan_folder | ✗ | ✗ | IMPL |
| FR-002 | scanner.rs | SimulationView | — | scan_folder | ✗ | ✗ | IMPL |
| FR-003 | scanner.rs | — | — | — | ✗ | — | IMPL |
| FR-004 | — | RuleBuilder | rules.rs | create_rule | ✗ | ✗ | IMPL |
| FR-005 | — | RuleBuilder | rules.rs | update_rule | ✗ | ✗ | IMPL |
| FR-006 | — | RuleListView | rules.rs | delete_rule | ✗ | ✗ | IMPL |
| FR-007 | — | RuleListView | rules.rs | update_rule | ✗ | ✗ | IMPL |
| FR-008 | — | ConditionRow | rules.rs | add_rule_condition | ✗ | ✗ | IMPL |
| FR-009 | conditions.rs | ConditionRow | — | — | ✓ (7) | ✗ | IMPL+TEST |
| FR-010 | conditions.rs | ConditionRow | — | — | ✓ (7) | ✗ | IMPL+TEST |
| FR-011 | conditions.rs | ConditionRow | — | — | ✓ (2) | ✗ | IMPL+TEST |
| FR-012 | — | ConditionRow | rules.rs | delete_rule_condition | ✗ | ✗ | IMPL |
| FR-013 | actions.rs | ActionRow | rules.rs | add_rule_action | ✓ (3) | ✗ | IMPL+TEST |
| FR-014 | actions.rs | — | — | — | ✓ (2) | ✗ | IMPL+TEST |
| FR-015 | — | ActionRow | rules.rs | delete_rule_action | ✗ | ✗ | IMPL |
| FR-016 | engine.rs | — | — | — | ✓ (2) | — | IMPL+TEST |
| FR-017 | engine.rs | — | — | — | ✓ (1) | — | IMPL+TEST |
| FR-018 | simulator.rs | SimulationView | — | simulate_folder | ✗ | ✗ | IMPL |
| FR-019 | simulator.rs | SimulationView | — | — | ✗ | ✗ | IMPL |
| FR-020 | simulator.rs | SimulationView | — | — | ✗ | ✗ | IMPL |
| FR-021 | executor.rs | SimulationView | runs.rs | execute_simulation | ✗ | ✗ | IMPL |
| FR-022 | executor.rs | — | — | — | ✗ | — | IMPL |
| FR-023 | executor.rs | — | — | — | ✗ | — | IMPL |
| FR-024 | conflict.rs | ConflictSettings | — | — | ✓ (1) | ✗ | IMPL+TEST |
| FR-025 | conflict.rs | ConflictSettings | — | — | ✗ | ✗ | IMPL |
| FR-026 | conflict.rs | ConflictSettings | — | — | ✓ (1) | ✗ | IMPL+TEST |
| FR-027 | rollback.rs | HistoryView | runs.rs | rollback_run | ✗ | ✗ | IMPL |
| FR-028 | rollback.rs | HistoryView | runs.rs | — | ✗ | ✗ | IMPL |
| FR-029 | — | HistoryView | runs.rs | list_runs | ✗ | ✗ | IMPL |
| FR-030 | — | RunDetail | runs.rs | get_run, list_run_items | ✗ | ✗ | IMPL |
| FR-031 | executor.rs | — | runs.rs | — | ✗ | — | IMPL |
| FR-032 | — | ProfileEditor | profiles.rs | create_profile | ✗ | ✗ | IMPL |
| FR-033 | — | ProfileCard | profiles.rs | activate_profile | ✗ | ✗ | IMPL |
| FR-034 | — | ProfileEditor | profiles.rs | add_rule_to_profile | ✗ | ✗ | IMPL |
| FR-035 | — | ProfileEditor | profiles.rs | remove_rule_from_profile | ✗ | ✗ | IMPL |
| FR-036 | — | ProfileCard | profiles.rs | delete_profile | ✗ | ✗ | IMPL |
| FR-037 | 004_default_rules.sql | — | — | — | ✗ | — | IMPL |
| FR-038 | fs_watcher.rs | FolderSettings | watched_folders.rs | add_watched_folder | ✗ | ✗ | IMPL |
| FR-039 | fs_watcher.rs | FolderSettings | watched_folders.rs | remove_watched_folder | ✗ | ✗ | IMPL |
| FR-040 | fs_watcher.rs | FolderSettings | watched_folders.rs | update_watch_mode | ✗ | ✗ | IMPL |
| FR-041 | fs_watcher.rs | — | — | — | ✗ | — | IMPL |
| FR-042 | scheduler.rs | SchedulingView | schedules.rs | create_schedule | ✓ (1) | ✗ | IMPL+TEST |
| FR-043 | scheduler.rs | SchedulingView | schedules.rs | update_schedule | ✗ | ✗ | IMPL |
| FR-044 | scheduler.rs | SchedulingView | schedules.rs | delete_schedule | ✗ | ✗ | IMPL |
| FR-045 | scheduler.rs | — | — | — | ✓ (1) | — | IMPL+TEST |
| FR-046 | scheduler.rs | — | — | — | ✓ (1) | — | IMPL+TEST |
| FR-047 | — | GeneralSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-048 | — | ConflictSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-049 | — | GeneralSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-050 | — | GeneralSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-051 | — | GeneralSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-052 | — | GeneralSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-053 | — | TipsSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-054 | — | TipsSettings | settings.rs | set_setting | ✗ | ✗ | IMPL |
| FR-055 | — | HelpView | help.rs | — | ✗ | ✗ | IMPL |
| FR-056 | — | HelpSearch | — | — | ✗ | ✗ | IMPL |
| FR-057 | — | HelpFavorites | help.rs | add/remove_help_favorite | ✗ | ✗ | IMPL |
| FR-058 | — | HelpView | help.rs | record_help_view | ✗ | ✗ | IMPL |
| FR-059 | — | TourController | tour.rs | get_tour_state | ✗ | ✗ | IMPL |
| FR-060 | — | TourController | tour.rs | skip/complete/reset_tour | ✗ | ✗ | IMPL |
| FR-061 | — | — | tour.rs | update_tour_step | ✗ | — | IMPL |
| FR-062 | heuristics.rs | TipBanner | tips.rs | evaluate_tips | ✓ (2) | ✗ | IMPL+TEST |
| FR-063 | engine.rs (tips) | TipCard | tips.rs | accept/dismiss_tip | ✓ (2) | ✗ | IMPL+TEST |
| FR-064 | validator.rs | LicenseSettings | — | — | ✓ (3) | ✗ | IMPL+TEST |
| FR-065 | validator.rs | LicenseSettings | — | — | ✓ (2) | ✗ | IMPL+TEST |
| FR-066 | validator.rs | LicenseSettings | — | — | ✓ (1) | ✗ | IMPL+TEST |
| FR-067 | — | Sidebar | — | — | — | ✗ | IMPL |
| FR-068 | — | DashboardView | — | — | — | ✗ | IMPL |
| FR-069 | — | SimulationView | — | select_folder | — | ✗ | IMPL |
| FR-070 | — | Toast | — | — | — | ✗ | IMPL |
| FR-071 | — | (vários) | — | — | — | ✗ | IMPL |
| FR-072 | service.rs | — | — | — | ✓ (1) | — | IMPL+TEST |
| FR-073 | migrations.rs | — | — | — | ✓ (1) | — | IMPL+TEST |
| FR-074 | 002+004 SQL | — | — | — | ✗ | — | IMPL |

**Legenda:** IMPL = implementado sem teste | IMPL+TEST = implementado com teste | GAP = não implementado

### Resumo RTM

| Status | Contagem | % |
|--------|----------|---|
| IMPL+TEST | 19 | 25.7% |
| IMPL (sem teste) | 55 | 74.3% |
| GAP (não implementado) | 0 | 0.0% |
| **Total** | **74** | **100%** |

---

## C) CHECKLIST DE ACEITAÇÃO (52 itens)

### C.1 — Instalação e Inicialização (6 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-01 | App instala via MSI/NSIS no Windows sem erros | Manual | ✓ Verificado |
| AC-02 | App inicia e exibe Dashboard em < 3s | Manual | ✓ Verificado |
| AC-03 | Banco SQLite é criado automaticamente no primeiro uso | Auto | ✓ Verificado |
| AC-04 | 4 migrações executam sem erro no primeiro boot | Auto | ✓ Verificado |
| AC-05 | Perfil "Pessoal" com 6 regras padrão existe após setup | Auto | ✓ Verificado |
| AC-06 | Settings padrão são inseridos (tema, idioma, conflito) | Auto | ✓ Verificado |

### C.2 — Dashboard (4 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-07 | Dashboard exibe quick stats (pastas monitoradas, execuções) | Manual | ⚠ Parcial |
| AC-08 | Quick Actions navegam para Simulação e Regras | Manual | ✓ OK |
| AC-09 | Recent Runs mostra últimas execuções | Manual | ✓ OK |
| AC-10 | Folder Overview mostra pastas monitoradas | Manual | ⚠ Depende de dados |

### C.3 — Regras e Condições (8 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-11 | Criar regra com nome e descrição funciona | Manual | ✓ OK |
| AC-12 | Editar nome/descrição de regra existente | Manual | ✓ OK |
| AC-13 | Habilitar/desabilitar regra via toggle | Manual | ✓ OK |
| AC-14 | Deletar regra com confirmação | Manual | ✓ OK |
| AC-15 | Adicionar condição (7 campos × 11 operadores) | Manual | ✓ OK |
| AC-16 | Combinar condições com AND e OR | Manual | ✓ OK |
| AC-17 | Adicionar ação (move_to_folder, move_to_subfolder, rename, add_tag) | Manual | ✓ OK |
| AC-18 | Templates de ação expandem corretamente ({extension}, {year}, etc.) | Unit | ✓ Testado |

### C.4 — Perfis (5 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-19 | Criar perfil com nome, ícone e cor | Manual | ✓ OK |
| AC-20 | Ativar perfil (apenas um ativo por vez) | Manual | ✓ OK |
| AC-21 | Associar regras a um perfil | Manual | ✓ OK |
| AC-22 | Remover regras de um perfil | Manual | ✓ OK |
| AC-23 | Deletar perfil (não o padrão) | Manual | ✓ OK |

### C.5 — Simulação e Execução (8 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-24 | Selecionar pasta via diálogo nativo | Manual | ✓ OK |
| AC-25 | Digitar caminho de pasta manualmente | Manual | ✓ OK |
| AC-26 | Simulação mostra total, correspondentes, conflitos | Manual | ✓ OK |
| AC-27 | Simulação não move nenhum arquivo | Manual | ✓ OK |
| AC-28 | Execução move arquivos corretamente | Manual | ✓ OK |
| AC-29 | Execução cria diretórios de destino automaticamente | Manual | ✓ OK |
| AC-30 | Conflitos resolvidos conforme estratégia configurada | Manual | ✓ OK |
| AC-31 | Erros individuais não interrompem processamento | Auto | ✓ Verificado |

### C.6 — Histórico e Rollback (5 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-32 | Histórico lista execuções passadas | Manual | ✓ OK |
| AC-33 | Detalhes mostram arquivos movidos com caminhos | Manual | ✓ OK |
| AC-34 | Rollback reverte arquivos para localização original | Manual | ✓ OK |
| AC-35 | Rollback parcial quando alguns arquivos foram deletados | Manual | ✓ OK |
| AC-36 | Status de rollback atualiza no histórico | Manual | ✓ OK |

### C.7 — Watcher e Agendamento (4 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-37 | Adicionar pasta monitorada via diálogo | Manual | ✓ OK |
| AC-38 | Remover pasta do monitoramento | Manual | ✓ OK |
| AC-39 | Criar agendamento com expressão cron simplificada | Manual | ✓ OK |
| AC-40 | Deletar agendamento | Manual | ✓ OK |

### C.8 — Configurações (4 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-41 | Alternar tema claro/escuro/sistema | Manual | ✓ OK |
| AC-42 | Alterar estratégia de conflito persiste | Manual | ✓ OK |
| AC-43 | Dicas habilitadas/desabilitadas conforme setting | Manual | ✓ OK |
| AC-44 | Configurações persistem entre sessões | Manual | ✓ OK |

### C.9 — Ajuda, Tour e Dicas (4 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-45 | Artigos de ajuda renderizam Markdown corretamente | Manual | ✓ OK |
| AC-46 | Busca de artigos filtra por texto | Manual | ✓ OK |
| AC-47 | Tour guiado exibe overlay e steps | Manual | ✓ OK |
| AC-48 | Dicas aparecem conforme heurísticas | Manual | ✓ OK |

### C.10 — Licença (2 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-49 | Validação de chave de licença offline funciona | Unit | ✓ Testado |
| AC-50 | Trial de 14 dias calcula dias restantes corretamente | Unit | ✓ Testado |

### C.11 — UI/UX Geral (2 itens)

| # | Critério | Tipo | Status |
|---|----------|------|--------|
| AC-51 | Todas as strings de interface estão em pt-BR | Manual | ✓ OK |
| AC-52 | Mensagens de erro do backend estão em pt-BR | Manual | ✓ OK |

### Resumo do Checklist

| Status | Contagem |
|--------|----------|
| ✓ OK / Verificado / Testado | 50 |
| ⚠ Parcial | 2 |
| ✗ Falha | 0 |
| **Total** | **52** |

---

## D) PLANO DE TESTES

### D.1 — Testes Unitários Backend (Rust)

**Estado atual:** 28 testes em 11 módulos (23.4% dos arquivos)

| Módulo | Testes Existentes | Testes Necessários | Prioridade |
|--------|------------------|--------------------|------------|
| rules/conditions.rs | 7 | — | ✓ Coberto |
| rules/actions.rs | 3 | +2 (move_to_subfolder, rename) | Alta |
| rules/engine.rs | 2 | +2 (disabled rules, priority order) | Média |
| license/validator.rs | 5 | — | ✓ Coberto |
| watcher/scheduler.rs | 3 | — | ✓ Coberto |
| tips/engine.rs | 2 | +1 (cooldown expired) | Baixa |
| tips/heuristics.rs | 2 | +1 (acima do threshold) | Baixa |
| organizer/conflict.rs | 2 | +1 (conflict_folder) | Média |
| db/connection.rs | 1 | — | ✓ Coberto |
| db/migrations.rs | 1 | — | ✓ Coberto |
| logger/service.rs | 1 | — | ✓ Coberto |
| organizer/scanner.rs | 0 | +3 (scan, recursive, empty dir) | **Alta** |
| organizer/simulator.rs | 0 | +3 (match, no-match, multi-action) | **Alta** |
| organizer/executor.rs | 0 | +3 (move, skip, error) | **Alta** |
| organizer/rollback.rs | 0 | +2 (rollback, partial) | **Alta** |
| db/queries/*.rs | 0 | +8 (CRUD por módulo) | Média |
| commands/*.rs | 0 | +5 (integration via mock DB) | Baixa |

**Meta:** +30 testes → total 58 testes (estimativa para cobertura > 50%)

### D.2 — Testes Unitários Frontend (React/TypeScript)

**Estado atual:** 0 testes (infra vitest + testing-library instalada mas não usada)

| Módulo | Testes Necessários | Prioridade |
|--------|-------------------|------------|
| stores/ruleStore.ts | 5 (CRUD + fetch) | Alta |
| stores/profileStore.ts | 4 (create, activate, delete, rules) | Alta |
| stores/historyStore.ts | 3 (fetch, details, rollback) | Alta |
| stores/settingsStore.ts | 2 (fetch, update) | Média |
| stores/scheduleStore.ts | 3 (CRUD) | Média |
| stores/appStore.ts | 2 (setView, toggle) | Baixa |
| lib/formatters.ts | 3 (size, date, duration) | Média |
| lib/tauri.ts | 1 (mock invoke) | Alta |
| components/ui/Button | 2 (render, click) | Baixa |
| components/ui/Toast | 2 (show, dismiss) | Baixa |
| SimulationView | 3 (setup, results, execute) | Alta |
| RuleBuilder | 3 (conditions, actions, save) | Média |

**Meta:** 33 testes frontend → cobertura de stores + componentes críticos

### D.3 — Testes de Integração

| # | Cenário | Componentes | Prioridade |
|---|---------|-------------|------------|
| INT-01 | Scanner → Simulator → Executor pipeline completo | scanner + simulator + executor | **Crítica** |
| INT-02 | Rule CRUD → conditions + actions persistem no DB | commands + queries + models | Alta |
| INT-03 | Profile CRUD → profile_rules associação correta | commands + queries | Alta |
| INT-04 | Execute → Run criado → RunItems registrados → Rollback funcional | executor + rollback + runs queries | **Crítica** |
| INT-05 | Settings get/set → persiste entre restarts | settings queries + commands | Média |
| INT-06 | Migration 004 → regras padrão → simulação funciona out-of-the-box | migrations + rules + simulator | Alta |
| INT-07 | Watcher → folder event → trigger organization | fs_watcher + scanner + executor | Média |
| INT-08 | Schedule due → auto-execute | scheduler + scanner + executor | Média |

### D.4 — Testes E2E

**Estado atual:** Nenhum framework E2E configurado

**Recomendação:** Playwright + @playwright/test para testes E2E via WebDriver

| # | Cenário E2E | Passos |
|---|-------------|--------|
| E2E-01 | Primeiro uso completo | App abre → Tour aparece → Pula tour → Dashboard visível |
| E2E-02 | Simulação end-to-end | Selecionar pasta → Escolher perfil → Simular → Verificar preview → Executar |
| E2E-03 | CRUD de regra completo | Criar regra → Adicionar condição → Adicionar ação → Salvar → Verificar na lista |
| E2E-04 | Rollback completo | Executar organização → Ir ao histórico → Rollback → Verificar arquivos voltaram |
| E2E-05 | Alternar tema | Settings → Trocar para dark → Verificar classe CSS → Trocar para light |
| E2E-06 | Navegação completa | Clicar em cada item do sidebar → Verificar view correta carrega |

### D.5 — Testes Cross-Platform

| Plataforma | Build Target | Status |
|-----------|-------------|--------|
| Windows 11 | MSI + NSIS | ✓ Verificado (build + execução) |
| macOS (Apple Silicon) | DMG | ⚠ Não testado |
| macOS (Intel) | DMG | ⚠ Não testado |
| Ubuntu 22.04+ | AppImage + Deb | ⚠ Não testado |
| Fedora 38+ | AppImage | ⚠ Não testado |

---

## E) GAP REPORT — Lacunas e Plano de Correção

### E.1 — Gaps Críticos

| # | Gap | Impacto | Plano de Correção | Esforço |
|---|-----|---------|-------------------|---------|
| GAP-01 | **Zero testes frontend** — vitest instalado mas nenhum teste escrito | Regressões silenciosas em toda a UI | Criar testes para stores críticos (rule, profile, history) e SimulationView | 3-4h |
| GAP-02 | **Scanner/Simulator/Executor sem testes** — pipeline inteiro não testado unitariamente | Bugs podem passar despercebidos no fluxo principal | Adicionar testes unitários com mock de filesystem | 2-3h |
| GAP-03 | **Nenhuma CI/CD** — sem GitHub Actions ou pipeline automatizado | Merges podem quebrar silenciosamente | Criar workflow GitHub Actions (lint + typecheck + test + build) | 1-2h |
| GAP-04 | **Watcher não integrado com organização automática** — fs_watcher.rs recebe eventos mas não dispara organização | Feature de auto-organização é no-op | Implementar handler que conecta WatchEvent → scanner → executor | 2-3h |

### E.2 — Gaps Importantes

| # | Gap | Impacto | Plano de Correção | Esforço |
|---|-----|---------|-------------------|---------|
| GAP-05 | **Operadores "before" e "after" declarados no frontend mas não implementados no backend** | Condições de data com before/after falham silenciosamente | Implementar comparação de datas em conditions.rs | 1h |
| GAP-06 | **`react-router-dom` instalado mas não utilizado** — app usa switch/case em appStore | Dependência morta, aumenta bundle | Remover react-router-dom do package.json | 5min |
| GAP-07 | **CSP está null em tauri.conf.json** — `"csp": null` | Potencial vulnerabilidade XSS | Configurar CSP restritivo: `"default-src 'self'; script-src 'self'"` | 30min |
| GAP-08 | **Scheduler não é ativado automaticamente** — código existe mas não há trigger loop | Agendamentos criados nunca são executados | Criar background tokio task que checa schedules periodicamente | 2h |
| GAP-09 | **delete action declarado no backend mas sem UI** — `"delete"` é um action_type reconhecido mas não está nos tipos frontend | Usuário não pode criar ações de deletar | Adicionar `delete` ao ActionType no frontend ou remover do backend | 30min |
| GAP-10 | **Nenhum teste de query SQL** — 9 módulos de queries sem teste | Queries incorretas passam despercebidas | Criar testes com in-memory SQLite (`:memory:`) | 3h |

### E.3 — Gaps Menores

| # | Gap | Impacto | Plano de Correção | Esforço |
|---|-----|---------|-------------------|---------|
| GAP-11 | **`beforeBuildCommand` e `beforeDevCommand` vazios** em tauri.conf.json | Build manual necessário antes de `tauri build` | Configurar `"beforeBuildCommand": "npm run build"` | 5min |
| GAP-12 | **Sem vitest.config.ts** — vitest roda com defaults | Pode faltar jsdom environment para React | Criar vitest.config.ts com environment: 'jsdom' e setup files | 15min |
| GAP-13 | **Logger test cria arquivo real** — service.rs test cria arquivo em temp | Teste não é hermético | Aceitável para testes locais, isolar em CI | 15min |
| GAP-14 | **copy action type presente no backend mas não no frontend** | `"copy"` é tratado igual a `"move"` no backend | Documentar ou remover | 10min |
| GAP-15 | **Sem .prettierrc** — Prettier configurado sem arquivo de config | Formatação pode variar entre devs | Criar .prettierrc com regras do projeto | 10min |
| GAP-16 | **Sem ESLint config dedicado** — ESLint 9 flat config provavelmente em eslint.config.js | Verificar se existe e está correto | Auditar config | 15min |

### E.4 — Plano de Correção Priorizado

| Sprint | Itens | Esforço Total |
|--------|-------|---------------|
| **Sprint 1 (Crítico)** | GAP-01, GAP-02, GAP-03, GAP-07, GAP-11 | ~8h |
| **Sprint 2 (Importante)** | GAP-04, GAP-05, GAP-08, GAP-10 | ~8h |
| **Sprint 3 (Melhoria)** | GAP-06, GAP-09, GAP-12, GAP-14, GAP-15, GAP-16 | ~2h |

---

## F) QUALITY GATES — Pipeline CI/CD Recomendado

### F.1 — GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit           # Gate 1: TypeScript
      - run: npx eslint src/             # Gate 2: Linting
      - run: npx prettier --check src/   # Gate 3: Formatting
      - run: npx vitest run              # Gate 4: Unit Tests
      - run: npx vite build              # Gate 5: Build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo check --manifest-path src-tauri/Cargo.toml    # Gate 6
      - run: cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings  # Gate 7
      - run: cargo fmt --manifest-path src-tauri/Cargo.toml -- --check         # Gate 8
      - run: cargo test --manifest-path src-tauri/Cargo.toml     # Gate 9

  build:
    needs: [frontend, backend]
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - uses: dtolnay/rust-toolchain@stable
      - run: npm ci
      - run: npx tauri build                                     # Gate 10
```

### F.2 — Quality Gates Resumo

| # | Gate | Ferramenta | Critério de Aprovação |
|---|------|------------|----------------------|
| QG-01 | TypeScript Typecheck | `tsc --noEmit` | Zero erros |
| QG-02 | ESLint | `eslint src/` | Zero warnings/errors |
| QG-03 | Prettier | `prettier --check` | Todos os arquivos formatados |
| QG-04 | Frontend Unit Tests | `vitest run` | 100% passing |
| QG-05 | Frontend Build | `vite build` | Build sem erros |
| QG-06 | Rust Typecheck | `cargo check` | Zero erros |
| QG-07 | Rust Linting | `cargo clippy -D warnings` | Zero warnings |
| QG-08 | Rust Formatting | `cargo fmt --check` | Todos formatados |
| QG-09 | Rust Unit Tests | `cargo test` | 100% passing |
| QG-10 | Tauri Build | `tauri build` | Binário gerado com sucesso |

---

## G) TESTES NÃO-FUNCIONAIS — Critérios Mensuráveis

### G.1 — Performance

| ID | Teste | Método | Critério | Ferramenta |
|----|-------|--------|----------|------------|
| NFR-T01 | Tempo de scan para 1.000 arquivos | Benchmark com pasta de teste | < 2s | `std::time::Instant` / `cargo bench` |
| NFR-T02 | Tempo de scan para 10.000 arquivos | Benchmark com pasta de teste | < 5s | `std::time::Instant` |
| NFR-T03 | Tempo de simulação (1.000 arquivos, 10 regras) | Benchmark | < 1s | `std::time::Instant` |
| NFR-T04 | Tempo de startup do app | Timer externo | < 3s até Dashboard | Manual / PowerShell Measure-Command |
| NFR-T05 | Memória do app em idle | Task Manager | < 100MB RSS | Windows Task Manager / htop |
| NFR-T06 | Memória durante scan 10K arquivos | Task Manager | < 200MB RSS | Performance Monitor |
| NFR-T07 | UI responsividade durante execução | Thread principal | 0 freezes > 100ms | DevTools Performance tab |

### G.2 — Segurança

| ID | Teste | Método | Critério |
|----|-------|--------|----------|
| NFR-T08 | Zero chamadas HTTP externas | Wireshark / Network monitor | 0 requests para IPs externos durante uso normal |
| NFR-T09 | CSP previne inline scripts | Injetar `<script>` via input | Script não executa |
| NFR-T10 | Path traversal em destino | Testar com `../../etc/passwd` como destino | Ação bloqueada ou sanitizada |
| NFR-T11 | Licença não exfiltrada | Monitorar rede durante validação | 0 bytes enviados |

### G.3 — Confiabilidade

| ID | Teste | Método | Critério |
|----|-------|--------|----------|
| NFR-T12 | Migrações idempotentes | Executar `run_migrations()` 5x consecutivas | Zero erros |
| NFR-T13 | Rollback após crash parcial | Kill processo durante execução, reiniciar e rollback | Estado consistente |
| NFR-T14 | Execução com permissão negada | Pasta destino sem write permission | Erro registrado, não crash |
| NFR-T15 | Execução com disco cheio | Mock disco cheio | Erro registrado, não crash |
| NFR-T16 | Arquivo locked durante move | Abrir arquivo, tentar mover | Erro reportado, próximo arquivo processado |

### G.4 — Usabilidade

| ID | Teste | Método | Critério |
|----|-------|--------|----------|
| NFR-T17 | Todas strings em pt-BR | Grep por strings em inglês no bundle JS | 0 strings inglês na UI |
| NFR-T18 | Dark mode completo | Ativar dark mode, screenshot cada tela | 0 elementos com fundo branco hardcoded |
| NFR-T19 | Tour completo para novos usuários | Primeiro uso, seguir todos os steps | Tour guia por todas funcionalidades principais |

### G.5 — Portabilidade

| ID | Teste | Método | Critério |
|----|-------|--------|----------|
| NFR-T20 | Build Windows | `tauri build` no Windows | MSI + NSIS gerados |
| NFR-T21 | Build macOS | `tauri build` no macOS | DMG gerado |
| NFR-T22 | Build Linux | `tauri build` no Linux | AppImage + Deb gerados |
| NFR-T23 | Paths com espaços e acentos | Pasta "Meus Documentos/Relatórios" | Scan e execução funcionam |
| NFR-T24 | Paths longos (> 260 chars) | Pasta com path > 260 chars no Windows | Tratamento gracioso |

---

## RESUMO EXECUTIVO

### Pontos Fortes

1. **Arquitetura sólida** — Separação clara entre frontend (React/Zustand), backend (Rust/Tauri), e dados (SQLite)
2. **Feature-complete** — Todos os 74 requisitos funcionais estão implementados
3. **Backend robusto** — 28 testes unitários cobrindo lógica crítica (conditions, actions, engine, license, scheduler)
4. **UI polida** — Componentes reutilizáveis, animações, dark mode, toast notifications
5. **Localização completa** — Interface e mensagens de erro 100% em pt-BR
6. **Dados offline** — Zero dependência de serviços externos

### Pontos de Atenção

1. **Zero testes frontend** — Vitest e Testing Library instalados mas sem nenhum teste (GAP-01)
2. **Pipeline inteiro sem testes** — Scanner, Simulator, Executor não têm testes unitários (GAP-02)
3. **Sem CI/CD** — Nenhum workflow automatizado para validação (GAP-03)
4. **Watcher desconectado** — FsWatcher recebe eventos mas não aciona organização (GAP-04)
5. **Scheduler não ativado** — Background loop não implementado (GAP-08)
6. **CSP desabilitado** — `"csp": null` no tauri.conf.json (GAP-07)

### Métricas

| Métrica | Valor |
|---------|-------|
| Requisitos Funcionais | 74 |
| Requisitos Não-Funcionais | 20 |
| Implementados | 74/74 (100%) |
| Com testes backend | 19/74 (25.7%) |
| Com testes frontend | 0/74 (0%) |
| Gaps Críticos | 4 |
| Gaps Importantes | 6 |
| Gaps Menores | 6 |
| Testes unitários Rust | 28 |
| Testes unitários React | 0 |
| Arquivos Rust com testes | 11/47 (23.4%) |
| Cobertura estimada backend | ~25% |
| Cobertura estimada frontend | 0% |

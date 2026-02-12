# DeskCraft — Product Requirements Document (PRD)

## 1. Visão do Produto

**DeskCraft** é um organizador automático premium de arquivos para Desktop, Downloads e pastas customizadas. Funciona 100% offline, é multiplataforma (Windows, macOS, Linux) e oferece regras inteligentes, perfis por contexto, simulação prévia e rollback completo.

## 2. Problema

- Desktops e pastas de Downloads acumulam centenas de arquivos desorganizados.
- Usuários perdem tempo buscando arquivos, renomeando manualmente e movendo para pastas.
- Soluções existentes são limitadas, feias, ou dependem de cloud/assinaturas.
- Falta de confiança: medo de perder arquivos ao usar organizadores automáticos.

## 3. Solução

Motor de organização com regras IF→THEN, simulação (dry-run) antes de executar, histórico completo, rollback por execução, perfis contextuais e watcher em tempo real. UI premium com tour guiado, help center offline e dicas inteligentes.

## 4. Personas

| Persona | Descrição | Dor principal |
|---------|-----------|---------------|
| **Dev/Designer** | Profissional que acumula screenshots, projetos, assets | Desktop caótico, perde tempo buscando arquivos |
| **Estudante** | Baixa PDFs, slides, trabalhos constantemente | Downloads vira lixão, não acha nada |
| **Profissional Corporativo** | Documentos, planilhas, apresentações espalhadas | Precisa de organização por projeto/cliente |
| **Power User** | Quer controle total com regras avançadas | Quer regex, agendamento, automação completa |

## 5. Proposta de Valor

> "Seu desktop organizado em segundos — com segurança, controle e sem internet."

- **Seguro**: Nunca apaga. Simula antes. Desfaz depois.
- **Inteligente**: Regras IF→THEN + dicas proativas.
- **Rápido**: Engine em Rust, UI nunca trava.
- **Bonito**: UI premium com tema claro/escuro.
- **Offline**: Zero dependência de internet, zero telemetria.

## 6. Diferenciais Competitivos

| Feature | DeskCraft | Concorrentes |
|---------|-----------|-------------|
| Simulação (dry-run) com preview | ✅ | ❌ |
| Rollback por execução | ✅ | ❌ |
| Rule Builder visual IF→THEN | ✅ | Parcial |
| Perfis contextuais | ✅ | ❌ |
| 100% offline | ✅ | Parcial |
| Watcher em tempo real | ✅ | Parcial |
| Help Center offline + Tour | ✅ | ❌ |
| Dicas inteligentes (sem IA cloud) | ✅ | ❌ |
| Multi-plataforma nativo | ✅ | Parcial |

## 7. Modelo de Negócio (Free vs Pro)

### Free
- Até 3 regras ativas
- 1 perfil
- Organização manual (sem watcher)
- Histórico dos últimos 10 runs
- Help Center completo
- Tour guiado

### Pro (licença perpétua offline)
- Regras ilimitadas
- Perfis ilimitados
- Watcher em tempo real
- Agendamento
- Regex em regras
- Histórico ilimitado
- Exportar diagnóstico
- Dicas inteligentes avançadas
- Prioridade em updates

### Validação de Licença
- Chave offline (hash local, sem server).
- Trial de 14 dias com todas as features Pro.
- Após trial, volta para Free (sem perder dados).

## 8. Roadmap

### v1.0 — MVP
- [x] Engine de organização (mover com segurança)
- [x] Simulação (dry-run) + preview
- [x] Histórico + rollback
- [x] Rule Builder (extensão, palavra-chave, data, tamanho)
- [x] Perfis básicos (Trabalho/Estudos/Pessoal)
- [x] Watcher básico + agendamento simples
- [x] UI com tema claro/escuro
- [x] Tray icon com ações rápidas
- [x] Help Center offline (guia + tutoriais + FAQ + busca)
- [x] Tour guiado (5-8 steps)
- [x] Tips Engine (3 dicas iniciais)
- [x] SQLite com migrations
- [x] Build Win/Mac/Linux

### v1.5 — Polish
- [ ] Regex em regras (Pro)
- [ ] Estatísticas visuais (gráficos de organização)
- [ ] Templates de regras pré-configuradas
- [ ] Drag & drop para reordenar regras
- [ ] Atalhos de teclado globais
- [ ] Exportar/importar regras e perfis
- [ ] Internacionalização (pt-BR, en-US)

### v2.0 — Advanced
- [ ] Plugins/extensões (rule actions customizadas)
- [ ] Organização por conteúdo (tags de imagem, metadata de PDF)
- [ ] Integração com file managers nativos
- [ ] Compressão automática de pastas antigas
- [ ] Auto-update (opt-in, verificação local de assinatura)

## 9. Requisitos Não-Funcionais

- **Performance**: UI response < 100ms, organização de 1000 arquivos < 5s
- **Segurança**: Nunca apagar sem confirmação. Logs auditáveis.
- **Acessibilidade**: Navegação por teclado, contraste WCAG AA, screen reader friendly
- **Tamanho**: Instalador < 30MB
- **Memória**: Idle < 50MB RAM, pico < 200MB
- **Startup**: Tempo de abertura < 2s

## 10. Métricas de Sucesso (locais, sem telemetria)

- Número de runs executados (local)
- Arquivos organizados (local)
- Regras criadas (local)
- Uso de simulação antes de execução (local)
- Rollbacks usados (indicador de confiança)

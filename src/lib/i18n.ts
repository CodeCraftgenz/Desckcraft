import { useSettingsStore } from '@/stores/settingsStore';

type Language = 'pt-BR' | 'en-US';

type Dictionary = Record<string, { 'pt-BR': string; 'en-US': string }>;

/**
 * String dictionary for i18n. Add new keys here as you translate more of the UI.
 * Coverage focus: navigation (sidebar), page titles (header), settings tabs and
 * primary section labels — the strings the user sees on every screen.
 *
 * For deeper content (help articles, tip messages, error details) we keep PT-BR.
 */
export const STRINGS: Dictionary = {
  // ── Sidebar / Navigation ──
  'nav.dashboard': { 'pt-BR': 'Dashboard', 'en-US': 'Dashboard' },
  'nav.rules': { 'pt-BR': 'Regras', 'en-US': 'Rules' },
  'nav.profiles': { 'pt-BR': 'Perfis', 'en-US': 'Profiles' },
  'nav.simulation': { 'pt-BR': 'Simulação', 'en-US': 'Simulation' },
  'nav.history': { 'pt-BR': 'Histórico', 'en-US': 'History' },
  'nav.scheduling': { 'pt-BR': 'Agendamento', 'en-US': 'Scheduling' },
  'nav.settings': { 'pt-BR': 'Configurações', 'en-US': 'Settings' },
  'nav.help': { 'pt-BR': 'Ajuda', 'en-US': 'Help' },
  'nav.collapse': { 'pt-BR': 'Recolher', 'en-US': 'Collapse' },
  'nav.activeProfile': { 'pt-BR': 'Perfil ativo', 'en-US': 'Active profile' },

  // ── Header ──
  'header.theme.light': { 'pt-BR': 'Modo claro', 'en-US': 'Light mode' },
  'header.theme.dark': { 'pt-BR': 'Modo escuro', 'en-US': 'Dark mode' },
  'header.notifications': { 'pt-BR': 'Notificações', 'en-US': 'Notifications' },
  'header.noProfile': { 'pt-BR': 'Sem perfil', 'en-US': 'No profile' },
  'header.profiles': { 'pt-BR': 'Perfis', 'en-US': 'Profiles' },
  'header.noProfilesCreated': { 'pt-BR': 'Nenhum perfil criado', 'en-US': 'No profiles created' },
  'header.recentActivity': { 'pt-BR': 'Atividade recente', 'en-US': 'Recent activity' },
  'header.noRecentActivity': { 'pt-BR': 'Nenhuma atividade recente', 'en-US': 'No recent activity' },
  'header.viewFullHistory': { 'pt-BR': 'Ver histórico completo', 'en-US': 'View full history' },

  // ── View Titles ──
  'view.dashboard': { 'pt-BR': 'Dashboard', 'en-US': 'Dashboard' },
  'view.rules': { 'pt-BR': 'Regras', 'en-US': 'Rules' },
  'view.ruleEditor': { 'pt-BR': 'Editor de Regras', 'en-US': 'Rule Editor' },
  'view.profiles': { 'pt-BR': 'Perfis', 'en-US': 'Profiles' },
  'view.simulation': { 'pt-BR': 'Simulação', 'en-US': 'Simulation' },
  'view.execution': { 'pt-BR': 'Execução', 'en-US': 'Execution' },
  'view.history': { 'pt-BR': 'Histórico', 'en-US': 'History' },
  'view.historyDetail': { 'pt-BR': 'Detalhes do Histórico', 'en-US': 'History Details' },
  'view.scheduling': { 'pt-BR': 'Agendamento', 'en-US': 'Scheduling' },
  'view.settings': { 'pt-BR': 'Configurações', 'en-US': 'Settings' },
  'view.help': { 'pt-BR': 'Ajuda', 'en-US': 'Help' },
  'view.helpArticle': { 'pt-BR': 'Artigo de Ajuda', 'en-US': 'Help Article' },

  // ── Settings Tabs ──
  'settings.general': { 'pt-BR': 'Geral', 'en-US': 'General' },
  'settings.folders': { 'pt-BR': 'Pastas', 'en-US': 'Folders' },
  'settings.conflicts': { 'pt-BR': 'Conflitos', 'en-US': 'Conflicts' },
  'settings.tips': { 'pt-BR': 'Dicas', 'en-US': 'Tips' },
  'settings.about': { 'pt-BR': 'Sobre', 'en-US': 'About' },
  'settings.title': { 'pt-BR': 'Configurações', 'en-US': 'Settings' },
  'settings.subtitle': {
    'pt-BR': 'Personalize o comportamento e aparência do DeskCraft',
    'en-US': 'Customize DeskCraft behavior and appearance',
  },

  // ── General Settings ──
  'general.theme': { 'pt-BR': 'Tema', 'en-US': 'Theme' },
  'general.theme.system': { 'pt-BR': 'Sistema', 'en-US': 'System' },
  'general.theme.light': { 'pt-BR': 'Claro', 'en-US': 'Light' },
  'general.theme.dark': { 'pt-BR': 'Escuro', 'en-US': 'Dark' },
  'general.language': { 'pt-BR': 'Idioma', 'en-US': 'Language' },
  'general.startMinimized': { 'pt-BR': 'Iniciar minimizado', 'en-US': 'Start minimized' },
  'general.startMinimizedDesc': {
    'pt-BR': 'O aplicativo inicia na bandeja do sistema ao invés de abrir a janela',
    'en-US': 'The app starts in the system tray instead of opening the window',
  },
  'general.startWithOs': { 'pt-BR': 'Iniciar com o sistema', 'en-US': 'Start with system' },
  'general.startWithOsDesc': {
    'pt-BR': 'DeskCraft inicia automaticamente ao ligar o computador',
    'en-US': 'DeskCraft starts automatically when you turn on your computer',
  },
  'general.logLevel': { 'pt-BR': 'Nível de log', 'en-US': 'Log level' },

  // ── Common Buttons ──
  'common.save': { 'pt-BR': 'Salvar', 'en-US': 'Save' },
  'common.cancel': { 'pt-BR': 'Cancelar', 'en-US': 'Cancel' },
  'common.delete': { 'pt-BR': 'Excluir', 'en-US': 'Delete' },
  'common.edit': { 'pt-BR': 'Editar', 'en-US': 'Edit' },
  'common.add': { 'pt-BR': 'Adicionar', 'en-US': 'Add' },
  'common.search': { 'pt-BR': 'Buscar', 'en-US': 'Search' },
  'common.loading': { 'pt-BR': 'Carregando...', 'en-US': 'Loading...' },
};

function normalizeLanguage(lang: string | undefined): Language {
  if (lang === 'en-US' || lang === 'en') return 'en-US';
  return 'pt-BR';
}

/**
 * React hook returning a translate function bound to the user's current language.
 * Falls back to the key itself if a translation is missing.
 */
export function useT(): (key: keyof typeof STRINGS) => string {
  const language = useSettingsStore((s) => s.settings.language);
  const lang = normalizeLanguage(language);
  return (key) => STRINGS[key]?.[lang] ?? String(key);
}

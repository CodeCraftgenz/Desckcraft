import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  CheckCircle2,
  FlaskConical,
  AlertCircle,
  History,
} from 'lucide-react';
import { useAppStore, useSettingsStore, useProfileStore, useHistoryStore } from '@/stores';
import { VIEWS } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Run } from '@/types/runs';

/* ---------- View Titles ---------- */

const viewTitles: Record<string, string> = {
  [VIEWS.DASHBOARD]: 'Dashboard',
  [VIEWS.RULES]: 'Regras',
  [VIEWS.RULE_EDITOR]: 'Editor de Regras',
  [VIEWS.PROFILES]: 'Perfis',
  [VIEWS.SIMULATION]: 'Simulação',
  [VIEWS.EXECUTION]: 'Execução',
  [VIEWS.HISTORY]: 'Histórico',
  [VIEWS.HISTORY_DETAIL]: 'Detalhes do Histórico',
  [VIEWS.SCHEDULING]: 'Agendamento',
  [VIEWS.SETTINGS]: 'Configurações',
  [VIEWS.HELP]: 'Ajuda',
  [VIEWS.HELP_ARTICLE]: 'Artigo de Ajuda',
};

/* ---------- Notification Helpers ---------- */

function getRunStatusIcon(run: Run) {
  switch (run.status) {
    case 'completed':
      return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
    case 'failed':
      return <AlertCircle size={14} className="text-red-500 shrink-0" />;
    case 'running':
      return <FlaskConical size={14} className="text-blue-500 shrink-0" />;
    default:
      return <History size={14} className="text-gray-400 shrink-0" />;
  }
}

function getRunLabel(run: Run): string {
  switch (run.run_type) {
    case 'simulation':
      return 'Simulação completada';
    case 'manual':
      return 'Organização concluída';
    case 'watcher':
      return 'Monitoramento executado';
    case 'scheduled':
      return 'Agendamento executado';
    default:
      return 'Atividade registrada';
  }
}

function getRunStatusLabel(run: Run): string {
  switch (run.status) {
    case 'completed':
      return `${run.moved_files} arquivo${run.moved_files !== 1 ? 's' : ''} movido${run.moved_files !== 1 ? 's' : ''}`;
    case 'failed':
      return run.error_message || 'Erro na execução';
    case 'running':
      return 'Em andamento...';
    case 'rolled_back':
      return 'Revertido';
    default:
      return run.status;
  }
}

function timeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHour < 24) return `há ${diffHour}h`;
    if (diffDay < 7) return `há ${diffDay}d`;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

/* ---------- Notification Dropdown ---------- */

function NotificationDropdown({
  runs,
  onViewHistory,
  onClose,
}: {
  runs: Run[];
  onViewHistory: () => void;
  onClose: () => void;
}) {
  const recentRuns = runs.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="
        absolute right-0 top-full mt-1.5
        w-80 py-1
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl shadow-lg z-50
      "
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Atividade recente
        </p>
      </div>

      {/* Items */}
      {recentRuns.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <Bell size={20} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhuma atividade recente
          </p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {recentRuns.map((run) => (
            <div
              key={run.id}
              className="
                flex items-start gap-3 px-4 py-3
                hover:bg-gray-50 dark:hover:bg-gray-800/50
                transition-colors
              "
            >
              <div className="mt-0.5">{getRunStatusIcon(run)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {getRunLabel(run)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {getRunStatusLabel(run)}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                {timeAgo(run.started_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
        <button
          type="button"
          onClick={() => {
            onViewHistory();
            onClose();
          }}
          className="
            w-full text-center text-xs font-medium
            text-brand-600 dark:text-brand-400
            hover:text-brand-700 dark:hover:text-brand-300
            transition-colors
          "
        >
          Ver histórico completo
        </button>
      </div>
    </motion.div>
  );
}

/* ---------- Header Component ---------- */

export function Header() {
  const currentView = useAppStore((s) => s.currentView);
  const setView = useAppStore((s) => s.setView);
  const { settings, updateSetting } = useSettingsStore();
  const { profiles, activeProfile, activateProfile } = useProfileStore();
  const runs = useHistoryStore((s) => s.runs);
  const fetchRuns = useHistoryStore((s) => s.fetchRuns);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const pageTitle = viewTitles[currentView] || 'DeskCraft';
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Fetch recent runs for notifications
  useEffect(() => {
    fetchRuns(5, 0);
  }, [fetchRuns]);

  // Count of recent notifications (items from last 24h)
  const recentCount = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return runs.filter((r) => {
      try {
        return new Date(r.started_at).getTime() > oneDayAgo;
      } catch {
        return false;
      }
    }).length;
  }, [runs]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (settings.theme === 'dark') {
      updateSetting('theme', 'light');
    } else {
      updateSetting('theme', 'dark');
    }
  };

  const handleViewHistory = useCallback(() => {
    setView(VIEWS.HISTORY);
  }, [setView]);

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {pageTitle}
      </h1>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Tooltip content={isDark ? 'Modo claro' : 'Modo escuro'} placement="bottom">
          <button
            type="button"
            onClick={toggleTheme}
            className="
              p-2 rounded-lg
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              hover:text-gray-700 dark:hover:text-gray-200
              transition-colors
            "
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </Tooltip>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Tooltip content="Notificações" placement="bottom">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen((prev) => !prev);
                setProfileDropdownOpen(false);
              }}
              className="
                relative p-2 rounded-lg
                text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:text-gray-700 dark:hover:text-gray-200
                transition-colors
              "
              aria-label="Notificações"
            >
              <Bell size={18} />
              {/* Notification badge counter */}
              {recentCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {recentCount > 9 ? '9+' : recentCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notificationOpen && (
              <NotificationDropdown
                runs={runs}
                onViewHistory={handleViewHistory}
                onClose={() => setNotificationOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />

        {/* Profile Selector */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setProfileDropdownOpen((prev) => !prev);
              setNotificationOpen(false);
            }}
            className="
              flex items-center gap-2 px-2.5 py-1.5 rounded-lg
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors
            "
          >
            {activeProfile ? (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{
                  backgroundColor: activeProfile.color || '#6366f1',
                }}
              >
                {activeProfile.icon ||
                  activeProfile.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 shrink-0">
                <User size={14} className="text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {activeProfile?.name || 'Sem perfil'}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-150 ${
                profileDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Perfis
                </p>
              </div>
              {profiles.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Nenhum perfil criado
                </div>
              ) : (
                profiles.map((profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    onClick={() => {
                      activateProfile(profile.id);
                      setProfileDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2
                      text-left text-sm
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      transition-colors
                      ${
                        profile.is_active
                          ? 'text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{
                        backgroundColor: profile.color || '#6366f1',
                      }}
                    >
                      {profile.icon || profile.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">{profile.name}</span>
                    {profile.is_active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

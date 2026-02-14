import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  FlaskConical,
  History,
  CalendarClock,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAppStore, useProfileStore } from '@/stores';
import { VIEWS } from '@/lib/constants';
import logoSrc from '@/assets/logo.png';
import { Tooltip } from '@/components/ui/Tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  dataTour?: string;
}

const navItems: NavItem[] = [
  { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: VIEWS.RULES, label: 'Regras', icon: FileText, dataTour: 'nav-rules' },
  { id: VIEWS.PROFILES, label: 'Perfis', icon: Users, dataTour: 'nav-profiles' },
  { id: VIEWS.SIMULATION, label: 'Simulação', icon: FlaskConical },
  { id: VIEWS.HISTORY, label: 'Histórico', icon: History, dataTour: 'nav-history' },
  { id: VIEWS.SCHEDULING, label: 'Agendamento', icon: CalendarClock },
  { id: VIEWS.SETTINGS, label: 'Configurações', icon: Settings },
  { id: VIEWS.HELP, label: 'Ajuda', icon: HelpCircle, dataTour: 'nav-help' },
];

export function Sidebar() {
  const { currentView, sidebarCollapsed, setView, toggleSidebar } =
    useAppStore();
  const activeProfile = useProfileStore((s) => s.activeProfile);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 250 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="
        flex flex-col h-screen shrink-0
        bg-white dark:bg-gray-950
        border-r border-gray-200 dark:border-gray-800
        overflow-hidden select-none
      "
    >
      {/* Logo */}
      <div className="flex items-center justify-center px-3 h-14 shrink-0 border-b border-gray-200 dark:border-gray-800">
        <img
          src={logoSrc}
          alt="DeskCraft"
          className={`${sidebarCollapsed ? 'h-7' : 'h-9'} object-contain shrink-0 drop-shadow-sm`}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            const button = (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setView(item.id)}
                  data-tour={item.dataTour}
                  className={`
                    w-full flex items-center gap-3 rounded-lg
                    transition-colors duration-150
                    ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                    ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : ''
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              </li>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.id} content={item.label} placement="right">
                  {button}
                </Tooltip>
              );
            }

            return button;
          })}
        </ul>
      </nav>

      {/* Active Profile Badge */}
      {activeProfile && (
        <div
          className={`
            mx-2 mb-2 px-3 py-2 rounded-lg
            bg-gray-50 dark:bg-gray-900
            border border-gray-200 dark:border-gray-800
            ${sidebarCollapsed ? 'flex items-center justify-center' : ''}
          `}
        >
          {sidebarCollapsed ? (
            <Tooltip content={activeProfile.name} placement="right">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: activeProfile.color || '#6366f1' }}
              >
                {activeProfile.icon || activeProfile.name.charAt(0).toUpperCase()}
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: activeProfile.color || '#6366f1' }}
              >
                {activeProfile.icon || activeProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activeProfile.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-500">
                  Perfil ativo
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapse/Expand Button */}
      <div className="px-2 pb-3 pt-1 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={toggleSidebar}
          className="
            w-full flex items-center justify-center gap-2
            py-2 rounded-lg
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-900
            transition-colors duration-150
          "
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronsRight size={18} />
          ) : (
            <>
              <ChevronsLeft size={18} />
              <span className="text-xs font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

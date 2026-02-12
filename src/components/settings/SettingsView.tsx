import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Settings2,
  FolderOpen,
  ShieldAlert,
  Lightbulb,
  KeyRound,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { FolderSettings } from './FolderSettings';
import { ConflictSettings } from './ConflictSettings';
import { TipsSettings } from './TipsSettings';
import { LicenseSettings } from './LicenseSettings';
import { AboutSection } from './AboutSection';

interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  component: ReactNode;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'general',
    label: 'Geral',
    icon: Settings2,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    component: <GeneralSettings />,
  },
  {
    id: 'folders',
    label: 'Pastas',
    icon: FolderOpen,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    component: <FolderSettings />,
  },
  {
    id: 'conflicts',
    label: 'Conflitos',
    icon: ShieldAlert,
    iconColor: 'text-red-500 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    component: <ConflictSettings />,
  },
  {
    id: 'tips',
    label: 'Dicas',
    icon: Lightbulb,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    component: <TipsSettings />,
  },
  {
    id: 'license',
    label: 'Licenca',
    icon: KeyRound,
    iconColor: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    component: <LicenseSettings />,
  },
  {
    id: 'about',
    label: 'Sobre',
    icon: Info,
    iconColor: 'text-gray-500 dark:text-gray-400',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    component: <AboutSection />,
  },
];

/**
 * SettingsView — Main settings page with a vertical tabbed layout.
 *
 * Structure:
 * - Header with "Configuracoes" title and Settings icon
 * - Left sidebar: vertical tab navigation
 * - Right content: active section with fade transition
 *
 * Sections: Geral, Pastas, Conflitos, Dicas, Licenca, Sobre
 */
export function SettingsView() {
  const [activeTab, setActiveTab] = useState(SETTINGS_TABS[0].id);

  const activeSection = SETTINGS_TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="
            flex items-center justify-center
            w-10 h-10 rounded-xl
            bg-gray-100 dark:bg-gray-800
            ring-1 ring-gray-200/50 dark:ring-gray-700
          "
        >
          <Settings size={20} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Configuracoes
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Personalize o comportamento e aparencia do DeskCraft
          </p>
        </div>
      </div>

      {/* Layout: Sidebar tabs + Content area */}
      <div className="flex gap-6 min-h-0">
        {/* Sidebar tabs */}
        <nav className="w-48 shrink-0 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-left transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                  dark:focus:ring-offset-gray-900
                  ${
                    isActive
                      ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="settings-tab-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full"
                    transition={{
                      type: 'spring',
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                )}

                <div
                  className={`
                    flex items-center justify-center w-7 h-7 rounded-md shrink-0
                    transition-colors duration-150
                    ${isActive ? tab.iconBg : 'bg-transparent'}
                  `}
                >
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? tab.iconColor
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  />
                </div>

                <span
                  className={`
                    text-sm font-medium transition-colors duration-150
                    ${
                      isActive
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeSection?.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

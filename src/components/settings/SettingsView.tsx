import { useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Settings2,
  FolderOpen,
  ShieldAlert,
  Lightbulb,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { FolderSettings } from './FolderSettings';
import { ConflictSettings } from './ConflictSettings';
import { TipsSettings } from './TipsSettings';
import { AboutSection } from './AboutSection';
import { useT, STRINGS } from '@/lib/i18n';

interface SettingsTab {
  id: string;
  labelKey: keyof typeof STRINGS;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  Component: ComponentType;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'general',
    labelKey: 'settings.general',
    icon: Settings2,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    Component: GeneralSettings,
  },
  {
    id: 'folders',
    labelKey: 'settings.folders',
    icon: FolderOpen,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    Component: FolderSettings,
  },
  {
    id: 'conflicts',
    labelKey: 'settings.conflicts',
    icon: ShieldAlert,
    iconColor: 'text-red-500 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    Component: ConflictSettings,
  },
  {
    id: 'tips',
    labelKey: 'settings.tips',
    icon: Lightbulb,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    Component: TipsSettings,
  },
  {
    id: 'about',
    labelKey: 'settings.about',
    icon: Info,
    iconColor: 'text-gray-500 dark:text-gray-400',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    Component: AboutSection,
  },
];

/**
 * SettingsView — Main settings page with a vertical tabbed layout.
 *
 * Structure:
 * - Header with "Configurações" title and Settings icon
 * - Left sidebar: vertical tab navigation
 * - Right content: active section with fade transition
 *
 * Sections: Geral, Pastas, Conflitos, Dicas, Licença, Sobre
 */
export function SettingsView() {
  const t = useT();
  const [activeTab, setActiveTab] = useState(SETTINGS_TABS[0].id);

  const activeSection = SETTINGS_TABS.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeSection?.Component ?? GeneralSettings;

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
            {t('settings.title')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('settings.subtitle')}
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
            const label = t(tab.labelKey);

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
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div key={activeTab} className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}

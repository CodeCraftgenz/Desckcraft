import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Sun, Moon, Globe, Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/stores/settingsStore';
import type { AppSettings } from '@/types/settings';

const THEME_OPTIONS: {
  value: AppSettings['theme'];
  label: string;
  icon: typeof Monitor;
  description: string;
}[] = [
  {
    value: 'system',
    label: 'Sistema',
    icon: Monitor,
    description: 'Segue a preferência do sistema operacional',
  },
  {
    value: 'light',
    label: 'Claro',
    icon: Sun,
    description: 'Tema claro para ambientes iluminados',
  },
  {
    value: 'dark',
    label: 'Escuro',
    icon: Moon,
    description: 'Tema escuro para conforto visual',
  },
];

const LANGUAGE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (pt-BR)' },
  { value: 'en-US', label: 'English (en-US)' },
];

const LOG_LEVEL_OPTIONS = [
  { value: 'info', label: 'Info — Padrão' },
  { value: 'debug', label: 'Debug — Detalhado' },
  { value: 'warn', label: 'Warn — Avisos' },
  { value: 'error', label: 'Error — Somente erros' },
];

/**
 * GeneralSettings — General application settings.
 *
 * Provides:
 * - Theme selector with visual preview icons (Sistema/Claro/Escuro)
 * - Language selector (Português/English)
 * - Start minimized toggle
 * - Start with OS toggle
 * - Log level selector
 */
export function GeneralSettings() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const language = useSettingsStore((s) => s.settings.language);
  const startMinimized = useSettingsStore((s) => s.settings.start_minimized);
  const startWithOs = useSettingsStore((s) => s.settings.start_with_os);
  const logLevel = useSettingsStore((s) => s.settings.log_level);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const handleThemeChange = useCallback(
    (value: AppSettings['theme']) => {
      updateSetting('theme', value);
    },
    [updateSetting],
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting('language', e.target.value);
    },
    [updateSetting],
  );

  const handleStartMinimizedChange = useCallback(
    (checked: boolean) => {
      updateSetting('start_minimized', checked);
    },
    [updateSetting],
  );

  const handleStartWithOsChange = useCallback(
    (checked: boolean) => {
      updateSetting('start_with_os', checked);
    },
    [updateSetting],
  );

  const handleLogLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting('log_level', e.target.value);
    },
    [updateSetting],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card padding="lg">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="
              flex items-center justify-center
              w-9 h-9 rounded-lg
              bg-blue-50 dark:bg-blue-500/10
              ring-1 ring-blue-200/50 dark:ring-blue-500/20
            "
          >
            <Settings2 size={18} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Geral
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Aparência, idioma e comportamento do aplicativo
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tema
            </label>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleThemeChange(option.value)}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl
                      border-2 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                      dark:focus:ring-offset-gray-900
                      ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50'
                      }
                    `}
                  >
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-lg
                        transition-colors duration-200
                        ${
                          isSelected
                            ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }
                      `}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={`
                        text-xs font-medium
                        ${
                          isSelected
                            ? 'text-brand-700 dark:text-brand-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="theme-indicator"
                        className="absolute -top-px -right-px w-5 h-5 bg-brand-500 rounded-bl-lg rounded-tr-[10px] flex items-center justify-center"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Language selector */}
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-gray-400 dark:text-gray-500 shrink-0 mt-6" />
            <div className="flex-1">
              <Select
                label="Idioma"
                options={LANGUAGE_OPTIONS}
                value={language === 'en' ? 'en-US' : language === 'pt-BR' ? 'pt-BR' : 'pt-BR'}
                onChange={handleLanguageChange}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Novas traduções serão adicionadas em futuras versões
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Startup toggles */}
          <div className="space-y-4">
            <Switch
              checked={startMinimized}
              onChange={handleStartMinimizedChange}
              label="Iniciar minimizado"
              description="O aplicativo inicia na bandeja do sistema ao invés de abrir a janela"
            />
            <Switch
              checked={startWithOs}
              onChange={handleStartWithOsChange}
              label="Iniciar com o sistema"
              description="DeskCraft inicia automaticamente ao ligar o computador"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Log level */}
          <Select
            label="Nível de log"
            options={LOG_LEVEL_OPTIONS}
            value={logLevel}
            onChange={handleLogLevelChange}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-4">
            Útil para diagnóstico. Nível "Debug" gera logs mais detalhados.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

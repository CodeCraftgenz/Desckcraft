import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Hash,
  FolderInput,
  MessageCircleQuestion,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/stores/settingsStore';
import type { AppSettings } from '@/types/settings';

interface StrategyOption {
  value: AppSettings['conflict_strategy'];
  label: string;
  description: string;
  icon: typeof Hash;
  iconColor: string;
  iconBg: string;
  example: {
    before: string;
    after: string;
  };
  recommended?: boolean;
}

const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    value: 'suffix',
    label: 'Sufixo numerico',
    description:
      'Adiciona um numero ao nome do arquivo quando ja existe outro com o mesmo nome na pasta de destino.',
    icon: Hash,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-200/50 dark:ring-blue-500/20',
    example: {
      before: 'relatorio.pdf',
      after: 'relatorio_1.pdf',
    },
    recommended: true,
  },
  {
    value: 'conflict_folder',
    label: 'Pasta Conflitos',
    description:
      'Move o arquivo conflitante para uma subpasta chamada "_conflitos" dentro do destino original.',
    icon: FolderInput,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg:
      'bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200/50 dark:ring-amber-500/20',
    example: {
      before: 'relatorio.pdf',
      after: '_conflitos/relatorio.pdf',
    },
  },
  {
    value: 'ask',
    label: 'Perguntar ao usuario',
    description:
      'Exibe uma notificacao pedindo que voce decida o que fazer com cada arquivo conflitante.',
    icon: MessageCircleQuestion,
    iconColor: 'text-purple-500 dark:text-purple-400',
    iconBg:
      'bg-purple-50 dark:bg-purple-500/10 ring-1 ring-purple-200/50 dark:ring-purple-500/20',
    example: {
      before: 'relatorio.pdf',
      after: '(aguarda sua decisao)',
    },
  },
];

/**
 * ConflictSettings — Configure how file name conflicts are resolved.
 *
 * Provides:
 * - Three strategy options as selectable cards
 * - Visual explanation for each strategy
 * - Example preview (before/after) for each option
 * - Recommended indicator on suffix strategy
 */
export function ConflictSettings() {
  const conflictStrategy = useSettingsStore((s) => s.settings.conflict_strategy);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const handleStrategyChange = useCallback(
    (value: AppSettings['conflict_strategy']) => {
      updateSetting('conflict_strategy', value);
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
              bg-red-50 dark:bg-red-500/10
              ring-1 ring-red-200/50 dark:ring-red-500/20
            "
          >
            <ShieldAlert size={18} className="text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Resolucao de conflitos
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Como o DeskCraft lida com arquivos de nomes duplicados
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Description */}
          <div
            className="
              px-4 py-3 rounded-lg
              bg-gray-50 dark:bg-gray-800/50
              border border-gray-100 dark:border-gray-800
            "
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Quando uma regra tenta mover ou renomear um arquivo e ja existe outro
              com o mesmo nome no destino, o DeskCraft usa a estrategia abaixo para
              resolver o conflito automaticamente.
            </p>
          </div>

          {/* Strategy options */}
          <div className="space-y-3">
            {STRATEGY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = conflictStrategy === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStrategyChange(option.value)}
                  className={`
                    relative w-full text-left p-4 rounded-xl
                    border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                    dark:focus:ring-offset-gray-900
                    ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/5 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`
                        flex items-center justify-center
                        w-9 h-9 rounded-lg shrink-0 mt-0.5
                        ${option.iconBg}
                      `}
                    >
                      <Icon size={16} className={option.iconColor} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                        {option.recommended && (
                          <span
                            className="
                              inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
                              bg-brand-100 text-brand-700
                              dark:bg-brand-500/20 dark:text-brand-300
                            "
                          >
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {option.description}
                      </p>

                      {/* Example preview */}
                      <div
                        className="
                          mt-3 px-3 py-2 rounded-md
                          bg-gray-100/80 dark:bg-gray-800/80
                          border border-gray-200/50 dark:border-gray-700/50
                        "
                      >
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                          Exemplo:
                        </p>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-gray-500 dark:text-gray-400">
                            {option.example.before}
                          </span>
                          <svg
                            className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          <span className="text-brand-600 dark:text-brand-400 font-medium">
                            {option.example.after}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selected check */}
                    <div
                      className={`
                        flex items-center justify-center
                        w-6 h-6 rounded-full shrink-0 mt-0.5
                        transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-brand-500 text-white'
                            : 'border-2 border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

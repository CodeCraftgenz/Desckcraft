import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTipsStore } from '@/stores/tipsStore';

const FREQUENCY_OPTIONS = [
  { value: 'normal', label: 'Normal (a cada 5 minutos)' },
  { value: 'low', label: 'Baixa (a cada 15 minutos)' },
  { value: 'off', label: 'Desativado' },
];

/**
 * TipsSettings — Settings panel section for controlling the smart tips engine.
 *
 * Provides:
 * - Toggle: Enable/disable "Dicas inteligentes"
 * - Frequency selector: Normal / Baixa / Desativado
 * - Description text explaining what tips are
 * - "Resetar dicas dispensadas" button to clear all dismissed tips
 *
 * Uses settingsStore to read/write settings and tipsStore to reset dismissed tips.
 */
export function TipsSettings() {
  const tipsEnabled = useSettingsStore((s) => s.settings.tips_enabled);
  const tipsFrequency = useSettingsStore((s) => s.settings.tips_frequency);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const resetDismissedTips = useTipsStore((s) => s.resetDismissedTips);

  const handleToggle = useCallback(
    (checked: boolean) => {
      updateSetting('tips_enabled', checked);
    },
    [updateSetting],
  );

  const handleFrequencyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting(
        'tips_frequency',
        e.target.value as 'normal' | 'low' | 'off',
      );
    },
    [updateSetting],
  );

  const handleReset = useCallback(() => {
    resetDismissedTips();
  }, [resetDismissedTips]);

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
              bg-amber-50 dark:bg-amber-500/10
              ring-1 ring-amber-200/50 dark:ring-amber-500/20
            "
          >
            <Lightbulb size={18} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Dicas inteligentes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Sugestoes proativas baseadas nos seus arquivos
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
              As dicas inteligentes analisam suas pastas (Desktop, Downloads) e sugerem
              regras de organizacao baseadas em padroes detectados. As dicas sao processadas
              localmente e nenhum dado sai do seu computador.
            </p>
          </div>

          {/* Enable/Disable toggle */}
          <Switch
            checked={tipsEnabled}
            onChange={handleToggle}
            label="Ativar dicas inteligentes"
            description="Receba sugestoes automaticas para organizar seus arquivos"
          />

          {/* Frequency selector */}
          <div
            className={`
              transition-opacity duration-200
              ${tipsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}
            `}
          >
            <Select
              label="Frequencia de avaliacao"
              options={FREQUENCY_OPTIONS}
              value={tipsFrequency}
              onChange={handleFrequencyChange}
              disabled={!tipsEnabled}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Reset dismissed tips */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dicas dispensadas
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Resetar para mostrar dicas que foram dispensadas anteriormente
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={!tipsEnabled}
            >
              Resetar
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

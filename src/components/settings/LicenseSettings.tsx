import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Crown,
  Sparkles,
  Check,
  X,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useSettingsStore } from '@/stores/settingsStore';

type LicenseStatus = 'free' | 'trial' | 'pro';

interface FeatureRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
}

const FEATURE_COMPARISON: FeatureRow[] = [
  { feature: 'Regras de organizacao', free: 'Ate 5', pro: 'Ilimitadas' },
  { feature: 'Pastas monitoradas', free: 'Ate 2', pro: 'Ilimitadas' },
  { feature: 'Perfis de organizacao', free: 'Ate 2', pro: 'Ilimitados' },
  { feature: 'Historico de operacoes', free: '7 dias', pro: 'Ilimitado' },
  { feature: 'Modo tempo real', free: false, pro: true },
  { feature: 'Agendamento', free: false, pro: true },
  { feature: 'Dicas inteligentes', free: true, pro: true },
  { feature: 'Simulacao de regras', free: true, pro: true },
  { feature: 'Exportar diagnostico', free: false, pro: true },
  { feature: 'Suporte prioritario', free: false, pro: true },
];

const TRIAL_DAYS = 14;

/**
 * Determine the current license status based on settings.
 * For now, always returns 'free' since license validation is backend.
 */
function getLicenseStatus(
  licenseKey: string,
  trialStartedAt: string,
): { status: LicenseStatus; trialDaysLeft: number } {
  if (licenseKey && licenseKey.length > 0) {
    return { status: 'pro', trialDaysLeft: 0 };
  }

  if (trialStartedAt) {
    const startDate = new Date(trialStartedAt);
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, TRIAL_DAYS - diffDays);

    if (daysLeft > 0) {
      return { status: 'trial', trialDaysLeft: daysLeft };
    }
  }

  return { status: 'free', trialDaysLeft: 0 };
}

/**
 * LicenseSettings — License management and feature comparison.
 *
 * Provides:
 * - Current license status card (Free/Trial/Pro)
 * - License key input + Ativar button
 * - Feature comparison table (Free vs Pro)
 * - Trial info and progress bar
 */
export function LicenseSettings() {
  const licenseKey = useSettingsStore((s) => s.settings.license_key);
  const trialStartedAt = useSettingsStore((s) => s.settings.trial_started_at);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [inputKey, setInputKey] = useState('');
  const [activating, setActivating] = useState(false);

  const { status, trialDaysLeft } = getLicenseStatus(licenseKey, trialStartedAt);

  const handleActivate = useCallback(async () => {
    if (!inputKey.trim()) return;
    setActivating(true);
    // In the future, this will validate with the backend
    // For now, just save the key
    try {
      await updateSetting('license_key', inputKey.trim());
      setInputKey('');
    } finally {
      setActivating(false);
    }
  }, [inputKey, updateSetting]);

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
              bg-violet-50 dark:bg-violet-500/10
              ring-1 ring-violet-200/50 dark:ring-violet-500/20
            "
          >
            <KeyRound size={18} className="text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Licenca
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Gerencie seu plano e ative funcionalidades Pro
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* License status card */}
          <div
            className={`
              relative overflow-hidden rounded-xl p-5
              border-2 transition-all duration-200
              ${
                status === 'pro'
                  ? 'border-violet-300 dark:border-violet-600 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10'
                  : status === 'trial'
                    ? 'border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {status === 'pro' ? (
                    <Crown size={18} className="text-violet-500 dark:text-violet-400" />
                  ) : status === 'trial' ? (
                    <Sparkles size={18} className="text-amber-500 dark:text-amber-400" />
                  ) : (
                    <Gift size={18} className="text-gray-500 dark:text-gray-400" />
                  )}
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {status === 'pro'
                      ? 'DeskCraft Pro'
                      : status === 'trial'
                        ? 'Periodo de Teste'
                        : 'Plano Gratuito'}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {status === 'pro'
                    ? 'Licenca ativa — todas as funcionalidades desbloqueadas'
                    : status === 'trial'
                      ? `${trialDaysLeft} dia${trialDaysLeft !== 1 ? 's' : ''} restante${trialDaysLeft !== 1 ? 's' : ''}`
                      : 'Funcionalidades basicas ativas com limites'}
                </p>
              </div>
              <Badge
                variant={
                  status === 'pro'
                    ? 'success'
                    : status === 'trial'
                      ? 'warning'
                      : 'default'
                }
              >
                {status === 'pro'
                  ? 'Ativa'
                  : status === 'trial'
                    ? 'Teste'
                    : 'Free'}
              </Badge>
            </div>

            {/* Trial progress bar */}
            {status === 'trial' && (
              <div className="mt-4">
                <Progress
                  value={((TRIAL_DAYS - trialDaysLeft) / TRIAL_DAYS) * 100}
                  size="sm"
                  color={trialDaysLeft <= 3 ? 'red' : 'brand'}
                  label={`${trialDaysLeft} de ${TRIAL_DAYS} dias`}
                  showPercent
                />
              </div>
            )}

            {/* Free plan limits */}
            {status === 'free' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  5 regras
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  2 pastas
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  2 perfis
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  7 dias historico
                </span>
              </div>
            )}
          </div>

          {/* Trial CTA */}
          {status === 'free' && (
            <div
              className="
                px-4 py-3 rounded-lg
                bg-amber-50 dark:bg-amber-500/10
                border border-amber-200 dark:border-amber-500/20
              "
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-500 dark:text-amber-400" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Experimente o DeskCraft Pro
                </p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                Teste todas as funcionalidades Pro por {TRIAL_DAYS} dias, sem compromisso.
                Inclui regras ilimitadas, monitoramento em tempo real e muito mais.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* License key input */}
          {status !== 'pro' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ativar licenca
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    icon={KeyRound}
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleActivate}
                  disabled={!inputKey.trim()}
                  loading={activating}
                >
                  Ativar
                </Button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Insira sua chave de licenca para desbloquear o DeskCraft Pro
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Feature comparison table */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Comparacao de planos
            </h4>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr,80px,80px] bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Funcionalidade
                </div>
                <div className="px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                  Free
                </div>
                <div className="px-3 py-2.5 text-xs font-medium text-violet-600 dark:text-violet-400 text-center">
                  Pro
                </div>
              </div>

              {/* Table rows */}
              {FEATURE_COMPARISON.map((row, index) => (
                <div
                  key={row.feature}
                  className={`
                    grid grid-cols-[1fr,80px,80px]
                    ${index < FEATURE_COMPARISON.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                  `}
                >
                  <div className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">
                    {row.feature}
                  </div>
                  <div className="px-3 py-2.5 flex items-center justify-center">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check
                          size={14}
                          className="text-emerald-500 dark:text-emerald-400"
                        />
                      ) : (
                        <X size={14} className="text-gray-300 dark:text-gray-600" />
                      )
                    ) : (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {row.free}
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-2.5 flex items-center justify-center">
                    {typeof row.pro === 'boolean' ? (
                      row.pro ? (
                        <Check
                          size={14}
                          className="text-emerald-500 dark:text-emerald-400"
                        />
                      ) : (
                        <X size={14} className="text-gray-300 dark:text-gray-600" />
                      )
                    ) : (
                      <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
                        {row.pro}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

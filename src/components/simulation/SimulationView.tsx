import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  FolderOpen,
  Play,
  X,
  CheckCircle2,
  Info,
  FileStack,
  FileCheck2,
  FileX2,
  AlertTriangle,
  History,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/components/ui/Toast';
import { SimulationPreview } from './SimulationPreview';
import { useProfileStore, useAppStore } from '@/stores';
import { tauriInvoke } from '@/lib/tauri';
import { VIEWS } from '@/lib/constants';
import type { SimulationResult, SimulationItem, ExecutionResult } from '@/types/runs';

/* ---------- Types ---------- */

type SimulationState = 'setup' | 'results' | 'executing';

interface ExecutionProgress {
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

/* ---------- Folder dialog helper ---------- */

async function openNativeFolderDialog(): Promise<string | null> {
  try {
    // Try the Tauri dialog plugin first
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      title: 'Selecionar pasta para organizar',
    });
    if (selected && typeof selected === 'string') {
      return selected;
    }
    return null;
  } catch {
    // Fallback: try the backend command
    const selected = await tauriInvoke<string | null>('select_folder', {});
    return selected ?? null;
  }
}

/* ---------- Summary Stat Card ---------- */

function SummaryStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof FileStack;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div
        className={`
          flex items-center justify-center w-9 h-9 rounded-lg
          ${color}
        `}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}

/* ---------- Main SimulationView ---------- */

export function SimulationView() {
  const toast = useToast();
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const setView = useAppStore((s) => s.setView);

  /* --- Local state --- */
  const [state, setState] = useState<SimulationState>('setup');
  const [folderPath, setFolderPath] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(
    activeProfile?.id || '',
  );
  const [isSimulating, setIsSimulating] = useState(false);

  // Results state
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [conflictCount, setConflictCount] = useState(0);

  // Execution state
  const [executionProgress, setExecutionProgress] =
    useState<ExecutionProgress>({
      current: 0,
      total: 0,
      currentFile: '',
      percentage: 0,
    });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);

  // Set default profile when profiles load
  useEffect(() => {
    if (!selectedProfileId && activeProfile) {
      setSelectedProfileId(activeProfile.id);
    }
  }, [activeProfile, selectedProfileId]);

  /* --- Profile options --- */
  const profileOptions = profiles.map((p) => ({
    value: p.id,
    label: `${p.icon} ${p.name}${p.is_active ? ' (ativo)' : ''}`,
  }));

  /* --- Select folder (Tauri dialog plugin -> fallback to backend command) --- */
  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await openNativeFolderDialog();
      if (selected) {
        setFolderPath(selected);
      }
    } catch {
      // If all dialog methods fail, let user type manually
      toast.info('Use o campo de texto para digitar o caminho da pasta.');
    }
  }, [toast]);

  /* --- Run simulation --- */
  const handleSimulate = useCallback(async () => {
    if (!folderPath.trim()) {
      toast.error('Selecione ou digite o caminho de uma pasta.');
      return;
    }
    if (!selectedProfileId) {
      toast.error('Selecione um perfil para a simulação.');
      return;
    }

    setIsSimulating(true);
    try {
      const result = await tauriInvoke<SimulationResult>('simulate_folder', {
        path: folderPath.trim(),
        profileId: selectedProfileId,
      });

      setSimulationResult(result);
      const conflicts = result.items.filter(
        (item: SimulationItem) => item.has_conflict,
      ).length;
      setConflictCount(conflicts);
      setState('results');
      toast.success(
        `Simulação concluída: ${result.matched_files} arquivo${result.matched_files !== 1 ? 's' : ''} correspondente${result.matched_files !== 1 ? 's' : ''}.`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Erro na simulação: ${message}`);
    } finally {
      setIsSimulating(false);
    }
  }, [folderPath, selectedProfileId, toast]);

  /* --- Execute organization --- */
  const handleExecute = useCallback(async () => {
    if (!simulationResult || !selectedProfileId) return;

    setState('executing');
    setIsExecuting(true);
    setExecutionResult(null);

    const total = simulationResult.matched_files;
    setExecutionProgress({
      current: 0,
      total,
      currentFile: 'Preparando...',
      percentage: 0,
    });

    try {
      const result = await tauriInvoke<ExecutionResult>('execute_simulation', {
        simulationJson: JSON.stringify(simulationResult),
      });

      // Simulate incremental progress for UX
      setExecutionProgress({
        current: total,
        total,
        currentFile: '',
        percentage: 100,
      });

      setExecutionResult(result);
      toast.success(
        `Organização concluída! ${result.moved} arquivo${result.moved !== 1 ? 's' : ''} movido${result.moved !== 1 ? 's' : ''}.`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Erro na execução: ${message}`);
      setState('results');
    } finally {
      setIsExecuting(false);
    }
  }, [simulationResult, selectedProfileId, folderPath, toast]);

  /* --- Cancel / Reset --- */
  const handleCancel = useCallback(() => {
    setState('setup');
    setSimulationResult(null);
    setExecutionResult(null);
    setConflictCount(0);
    setExecutionProgress({
      current: 0,
      total: 0,
      currentFile: '',
      percentage: 0,
    });
  }, []);

  const handleGoToHistory = useCallback(() => {
    setView(VIEWS.HISTORY);
  }, [setView]);

  /* ========== RENDER ========== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div
          className="
            flex items-center justify-center
            w-10 h-10 rounded-xl
            bg-gradient-to-br from-blue-500 to-blue-700
            dark:from-blue-400 dark:to-blue-600
            shadow-md shadow-blue-500/20 dark:shadow-blue-500/10
          "
        >
          <FlaskConical size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Simulação
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualize como suas regras organizariam os arquivos
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ===== STATE 1: SETUP ===== */}
        {state === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Folder Selector */}
            <Card padding="lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Pasta para organizar
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        icon={FolderOpen}
                        placeholder="C:\Users\...\Downloads"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleSelectFolder}
                      icon={FolderOpen}
                    >
                      Selecionar Pasta
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Clique em "Selecionar Pasta" ou digite o caminho manualmente.
                  </p>
                </div>

                {/* Profile Selector */}
                <Select
                  label="Perfil de regras"
                  options={[
                    { value: '', label: 'Selecione um perfil...' },
                    ...profileOptions,
                  ]}
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                />

                {/* Simulate Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={FlaskConical}
                    loading={isSimulating}
                    disabled={!folderPath.trim() || !selectedProfileId}
                    onClick={handleSimulate}
                    className="w-full sm:w-auto"
                  >
                    Iniciar Simulação
                  </Button>
                </div>
              </div>
            </Card>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card padding="md">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 shrink-0">
                    <Info size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      O que é a simulação?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      A simulação mostra o que será movido sem alterar nada. É 100% seguro.
                      Você poderá revisar todas as mudanças propostas antes de aplicar a organização.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ===== STATE 2: RESULTS ===== */}
        {state === 'results' && simulationResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Summary Bar */}
            <Card padding="none">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
                <SummaryStat
                  icon={FileStack}
                  label="Total de arquivos"
                  value={simulationResult.total_files}
                  color="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                />
                <SummaryStat
                  icon={FileCheck2}
                  label="Correspondentes"
                  value={simulationResult.matched_files}
                  color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                />
                <SummaryStat
                  icon={FileX2}
                  label="Sem correspondência"
                  value={simulationResult.unmatched_files}
                  color="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                />
                <SummaryStat
                  icon={AlertTriangle}
                  label="Conflitos"
                  value={conflictCount}
                  color={
                    conflictCount > 0
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }
                />
              </div>
            </Card>

            {/* Simulation Preview Table */}
            {simulationResult.items.length > 0 ? (
              <SimulationPreview items={simulationResult.items} />
            ) : (
              <Card padding="lg">
                <div className="text-center py-8">
                  <FileX2
                    size={32}
                    className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhum arquivo correspondeu às regras do perfil selecionado.
                  </p>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={handleExecute}
                disabled={simulationResult.matched_files === 0}
                className="sm:flex-none"
              >
                Executar Organização
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={X}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}

        {/* ===== STATE 3: EXECUTING ===== */}
        {state === 'executing' && (
          <motion.div
            key="executing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {!executionResult ? (
              /* --- In Progress --- */
              <Card padding="lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/30 mb-4"
                    >
                      <Loader2
                        size={24}
                        className="text-brand-600 dark:text-brand-400"
                      />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Organizando arquivos...
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Movendo arquivo {executionProgress.current} de{' '}
                      {executionProgress.total}...
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <Progress
                    value={executionProgress.percentage}
                    showPercent
                    label="Progresso"
                    color="brand"
                  />

                  {/* Current File */}
                  {executionProgress.currentFile && (
                    <motion.div
                      key={executionProgress.currentFile}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {executionProgress.currentFile}
                      </p>
                    </motion.div>
                  )}

                  {/* Cancel */}
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={handleCancel}
                      disabled={isExecuting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              /* --- Completion --- */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card padding="lg">
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30"
                    >
                      <CheckCircle2
                        size={28}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </motion.div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Organização concluída!
                      </h3>
                      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                        <Badge variant="success">
                          {executionResult.moved} movido
                          {executionResult.moved !== 1 ? 's' : ''}
                        </Badge>
                        {executionResult.skipped > 0 && (
                          <Badge variant="default">
                            {executionResult.skipped} ignorado
                            {executionResult.skipped !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {executionResult.errors > 0 && (
                          <Badge variant="danger">
                            {executionResult.errors} erro
                            {executionResult.errors !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        icon={History}
                        onClick={handleGoToHistory}
                      >
                        Ver no Histórico
                      </Button>
                      <Button
                        variant="secondary"
                        icon={FlaskConical}
                        onClick={handleCancel}
                      >
                        Nova Simulação
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

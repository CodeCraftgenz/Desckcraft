import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  SkipForward,
  FolderOpen,
  User,
  Timer,
  FileText,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useHistoryStore, useProfileStore } from '@/stores';
import {
  formatDate,
  formatFileSize,
  truncatePath,
} from '@/lib/formatters';
import { RollbackDialog } from './RollbackDialog';
import type { Run, RunItem } from '@/types/runs';

/* ---------- Status Helpers ---------- */

const statusConfig: Record<
  RunItem['status'],
  { label: string; variant: 'success' | 'danger' | 'warning' | 'default' | 'info'; icon: typeof CheckCircle2 }
> = {
  pending: { label: 'Pendente', variant: 'default', icon: Clock },
  completed: { label: 'Movido', variant: 'success', icon: CheckCircle2 },
  failed: { label: 'Falhou', variant: 'danger', icon: XCircle },
  rolled_back: { label: 'Revertido', variant: 'warning', icon: RotateCcw },
  skipped: { label: 'Ignorado', variant: 'default', icon: SkipForward },
};

const runStatusConfig: Record<
  Run['status'],
  { label: string; variant: 'success' | 'danger' | 'warning' | 'default' | 'info'; icon: typeof CheckCircle2 }
> = {
  pending: { label: 'Pendente', variant: 'default', icon: Clock },
  running: { label: 'Executando', variant: 'info', icon: Loader2 },
  completed: { label: 'Concluído', variant: 'success', icon: CheckCircle2 },
  failed: { label: 'Falhou', variant: 'danger', icon: XCircle },
  rolled_back: { label: 'Revertido', variant: 'warning', icon: RotateCcw },
};

const runTypeLabels: Record<Run['run_type'], string> = {
  manual: 'Manual',
  simulation: 'Simulação',
  watcher: 'Monitoramento',
  scheduled: 'Agendado',
};

/* ---------- Duration Helper ---------- */

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'Em andamento';
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMs = end - start;

  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60000) return `${(diffMs / 1000).toFixed(1)}s`;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.round((diffMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/* ---------- Component Props ---------- */

interface RunDetailProps {
  runId: string;
  onBack: () => void;
}

/* ---------- Component ---------- */

export function RunDetail({ runId, onBack }: RunDetailProps) {
  const fetchRunDetails = useHistoryStore((s) => s.fetchRunDetails);
  const selectedRun = useHistoryStore((s) => s.selectedRun);
  const runItems = useHistoryStore((s) => s.runItems);
  const isLoading = useHistoryStore((s) => s.isLoading);
  const error = useHistoryStore((s) => s.error);
  const profiles = useProfileStore((s) => s.profiles);

  const [showRollback, setShowRollback] = useState(false);

  useEffect(() => {
    fetchRunDetails(runId);
  }, [runId, fetchRunDetails]);

  const handleCloseRollback = useCallback(() => {
    setShowRollback(false);
    // Re-fetch to get updated status
    fetchRunDetails(runId);
  }, [runId, fetchRunDetails]);

  /* --- Loading --- */
  if (isLoading && !selectedRun) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  /* --- Error --- */
  if (error && !selectedRun) {
    return (
      <Card padding="lg">
        <div className="text-center py-8">
          <AlertTriangle size={28} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="ghost" onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </Card>
    );
  }

  if (!selectedRun) return null;

  const run = selectedRun;
  const runStatus = runStatusConfig[run.status];
  const RunStatusIcon = runStatus.icon;
  const profileName =
    profiles.find((p) => p.id === run.profile_id)?.name || 'Desconhecido';
  const canRollback = run.status === 'completed' && run.moved_files > 0;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="
            inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
            hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4
          "
        >
          <ArrowLeft size={14} />
          Voltar ao histórico
        </button>
      </motion.div>

      {/* Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card padding="lg">
          <div className="space-y-5">
            {/* Status + Type Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-lg
                    ${run.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}
                    ${run.status === 'failed' ? 'bg-red-50 dark:bg-red-900/30' : ''}
                    ${run.status === 'rolled_back' ? 'bg-amber-50 dark:bg-amber-900/30' : ''}
                    ${run.status === 'pending' || run.status === 'running' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  `}
                >
                  <RunStatusIcon
                    size={20}
                    className={`
                      ${run.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                      ${run.status === 'failed' ? 'text-red-600 dark:text-red-400' : ''}
                      ${run.status === 'rolled_back' ? 'text-amber-600 dark:text-amber-400' : ''}
                      ${run.status === 'pending' || run.status === 'running' ? 'text-gray-500 dark:text-gray-400' : ''}
                      ${run.status === 'running' ? 'animate-spin' : ''}
                    `}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={runStatus.variant}>{runStatus.label}</Badge>
                    <Badge variant="info">{runTypeLabels[run.run_type]}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ID: {run.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Rollback Button */}
              {canRollback && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => setShowRollback(true)}
                >
                  Desfazer esta execução
                </Button>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <FolderOpen size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Pasta
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-all">
                    {run.source_folder}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Perfil
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {profileName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Iniciado
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(run.started_at)}
                  </p>
                </div>
              </div>

              {run.completed_at && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Concluído
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(run.completed_at)}
                    </p>
                  </div>
                </div>
              )}

              {run.rolled_back_at && (
                <div className="flex items-start gap-2">
                  <RotateCcw size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Revertido em
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(run.rolled_back_at)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Timer size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Duração
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDuration(run.started_at, run.completed_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* File Breakdown */}
            <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Arquivos:
              </span>
              <Badge variant="default">{run.total_files} total</Badge>
              <Badge variant="success">
                {run.moved_files} movido{run.moved_files !== 1 ? 's' : ''}
              </Badge>
              {run.skipped_files > 0 && (
                <Badge variant="default">
                  {run.skipped_files} ignorado{run.skipped_files !== 1 ? 's' : ''}
                </Badge>
              )}
              {run.error_files > 0 && (
                <Badge variant="danger">
                  {run.error_files} erro{run.error_files !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Error Message */}
            {run.error_message && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {run.error_message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Run Items List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Itens da execução ({runItems.length})
          </h3>
        </div>

        <Card padding="none" className="overflow-hidden">
          {runItems.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence initial={true}>
                {runItems.map((item, idx) => {
                  const config = statusConfig[item.status];
                  const StatusIcon = config.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(idx * 0.02, 0.5),
                      }}
                      className="px-4 py-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Status Icon */}
                        <StatusIcon
                          size={16}
                          className={`
                            shrink-0 mt-0.5
                            ${item.status === 'completed' ? 'text-emerald-500' : ''}
                            ${item.status === 'failed' ? 'text-red-500' : ''}
                            ${item.status === 'rolled_back' ? 'text-amber-500' : ''}
                            ${item.status === 'pending' || item.status === 'skipped' ? 'text-gray-400' : ''}
                          `}
                        />

                        {/* Paths */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                              {truncatePath(item.original_path, 45)}
                            </p>
                            <ArrowRight
                              size={12}
                              className="shrink-0 text-gray-300 dark:text-gray-600"
                            />
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {truncatePath(item.destination_path, 45)}
                            </p>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <Badge variant={config.variant} size="sm">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatFileSize(item.file_size)}
                            </span>
                            {item.error_message && (
                              <span className="text-xs text-red-500 dark:text-red-400">
                                {item.error_message}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum item encontrado para esta execução.
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Rollback Dialog */}
      {showRollback && (
        <RollbackDialog
          isOpen={showRollback}
          onClose={handleCloseRollback}
          run={run}
        />
      )}
    </div>
  );
}

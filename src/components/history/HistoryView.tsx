import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
  Eye,
  AlertTriangle,
  FolderOpen,
  Timer,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHistoryStore, useProfileStore } from '@/stores';
import { formatRelativeTime, formatDate } from '@/lib/formatters';
import { RunDetail } from './RunDetail';
import { RollbackDialog } from './RollbackDialog';
import type { Run } from '@/types/runs';

/* ---------- Constants ---------- */

const PAGE_SIZE = 20;

/* ---------- Status Config ---------- */

const statusConfig: Record<
  Run['status'],
  {
    label: string;
    variant: 'success' | 'danger' | 'warning' | 'default' | 'info';
    icon: typeof CheckCircle2;
    color: string;
  }
> = {
  pending: {
    label: 'Pendente',
    variant: 'default',
    icon: Clock,
    color: 'text-gray-500 dark:text-gray-400',
  },
  running: {
    label: 'Executando',
    variant: 'info',
    icon: Loader2,
    color: 'text-blue-500 dark:text-blue-400',
  },
  completed: {
    label: 'Concluído',
    variant: 'success',
    icon: CheckCircle2,
    color: 'text-emerald-500 dark:text-emerald-400',
  },
  failed: {
    label: 'Falhou',
    variant: 'danger',
    icon: XCircle,
    color: 'text-red-500 dark:text-red-400',
  },
  rolled_back: {
    label: 'Revertido',
    variant: 'warning',
    icon: RotateCcw,
    color: 'text-amber-500 dark:text-amber-400',
  },
};

const runTypeConfig: Record<
  Run['run_type'],
  { label: string; variant: 'default' | 'info' | 'success' | 'warning' }
> = {
  manual: { label: 'Manual', variant: 'default' },
  simulation: { label: 'Simulação', variant: 'info' },
  watcher: { label: 'Monitoramento', variant: 'success' },
  scheduled: { label: 'Agendado', variant: 'warning' },
};

/* ---------- Filter Options ---------- */

const statusFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'failed', label: 'Falhou' },
  { value: 'rolled_back', label: 'Revertido' },
  { value: 'simulation', label: 'Simulação' },
  { value: 'pending', label: 'Pendente' },
];

/* ---------- Duration Helper ---------- */

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'em andamento';
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMs = end - start;

  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60000) return `${(diffMs / 1000).toFixed(1)}s`;
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.round((diffMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/* ---------- Run List Item ---------- */

interface RunListItemProps {
  run: Run;
  index: number;
  onViewDetail: (id: string) => void;
  onRollback: (run: Run) => void;
}

function RunListItem({ run, index, onViewDetail, onRollback }: RunListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[run.status];
  const typeConfig = runTypeConfig[run.run_type];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
    >
      {/* Main Row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full text-left px-4 py-3.5 transition-colors
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Status Icon */}
          <div
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg shrink-0
              ${run.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}
              ${run.status === 'failed' ? 'bg-red-50 dark:bg-red-900/30' : ''}
              ${run.status === 'rolled_back' ? 'bg-amber-50 dark:bg-amber-900/30' : ''}
              ${run.status === 'running' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
              ${run.status === 'pending' ? 'bg-gray-100 dark:bg-gray-800' : ''}
            `}
          >
            <StatusIcon
              size={16}
              className={`${config.color} ${run.status === 'running' ? 'animate-spin' : ''}`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={config.variant} size="sm">
                {config.label}
              </Badge>
              <Badge variant={typeConfig.variant} size="sm">
                {typeConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 min-w-0">
              <FolderOpen size={12} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {run.source_folder}
              </p>
            </div>
          </div>

          {/* File Counts */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs">
                {run.moved_files > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {run.moved_files} movido{run.moved_files !== 1 ? 's' : ''}
                  </span>
                )}
                {run.skipped_files > 0 && (
                  <span className="text-gray-400 dark:text-gray-500">
                    {run.skipped_files} ignorado{run.skipped_files !== 1 ? 's' : ''}
                  </span>
                )}
                {run.error_files > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    {run.error_files} erro{run.error_files !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                <span>{formatRelativeTime(run.started_at)}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1">
                  <Timer size={10} />
                  {formatDuration(run.started_at, run.completed_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Expand Chevron */}
          <ChevronDown
            size={14}
            className={`
              shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}
          />
        </div>

        {/* Mobile file counts */}
        <div className="sm:hidden flex items-center gap-3 mt-2 ml-11 text-xs">
          {run.moved_files > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              {run.moved_files} movido{run.moved_files !== 1 ? 's' : ''}
            </span>
          )}
          {run.error_files > 0 && (
            <span className="text-red-500 dark:text-red-400">
              {run.error_files} erro{run.error_files !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-gray-400 dark:text-gray-500">
            {formatRelativeTime(run.started_at)}
          </span>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Pasta:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 break-all mt-0.5">
                    {run.source_folder}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Início:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                    {formatDate(run.started_at)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Arquivos:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                    {run.total_files} total, {run.moved_files} movido{run.moved_files !== 1 ? 's' : ''}, {run.skipped_files} ignorado{run.skipped_files !== 1 ? 's' : ''}, {run.error_files} erro{run.error_files !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {run.error_message && (
                <div className="flex items-start gap-2 mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {run.error_message}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Eye}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(run.id);
                  }}
                >
                  Ver detalhes
                </Button>
                {run.status === 'completed' && run.moved_files > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={RotateCcw}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRollback(run);
                    }}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                  >
                    Desfazer
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- Main HistoryView ---------- */

export function HistoryView() {
  const runs = useHistoryStore((s) => s.runs);
  const isLoading = useHistoryStore((s) => s.isLoading);
  const fetchRuns = useHistoryStore((s) => s.fetchRuns);
  const clearSelected = useHistoryStore((s) => s.clearSelected);
  const fetchProfiles = useProfileStore((s) => s.fetchProfiles);

  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [rollbackRun, setRollbackRun] = useState<Run | null>(null);

  useEffect(() => {
    fetchRuns(200, 0);
    fetchProfiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- Filter runs --- */
  const filteredRuns = useMemo(() => {
    let filtered = [...runs].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );

    if (statusFilter !== 'all') {
      if (statusFilter === 'simulation') {
        filtered = filtered.filter((r) => r.run_type === 'simulation');
      } else {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
    }

    return filtered;
  }, [runs, statusFilter]);

  const visibleRuns = filteredRuns.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRuns.length;

  /* --- Handlers --- */
  const handleViewDetail = useCallback((id: string) => {
    setSelectedRunId(id);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setSelectedRunId(null);
    clearSelected();
    // Re-fetch to pick up any rollback changes
    fetchRuns(200, 0);
  }, [clearSelected, fetchRuns]);

  const handleRollback = useCallback((run: Run) => {
    setRollbackRun(run);
  }, []);

  const handleCloseRollback = useCallback(() => {
    setRollbackRun(null);
    fetchRuns(200, 0);
  }, [fetchRuns]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  /* --- If viewing a run detail, show RunDetail --- */
  if (selectedRunId) {
    return <RunDetail runId={selectedRunId} onBack={handleBackFromDetail} />;
  }

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
            bg-gradient-to-br from-purple-500 to-purple-700
            dark:from-purple-400 dark:to-purple-600
            shadow-md shadow-purple-500/20 dark:shadow-purple-500/10
          "
        >
          <Clock size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Histórico
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {runs.length} execuç{runs.length !== 1 ? 'ões' : 'ão'} registrada{runs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card padding="sm">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <div className="w-48">
              <Select
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {filteredRuns.length} resultado{filteredRuns.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Run List */}
      {isLoading && runs.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : filteredRuns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {runs.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhuma execução registrada ainda"
              description="O histórico de execuções aparecerá aqui depois que você executar suas regras pela primeira vez."
            />
          ) : (
            <EmptyState
              icon={Filter}
              title="Nenhum resultado"
              description="Nenhuma execução corresponde ao filtro selecionado. Tente alterar os filtros."
            />
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card padding="none" className="overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleRuns.map((run, idx) => (
                <RunListItem
                  key={run.id}
                  run={run}
                  index={idx}
                  onViewDetail={handleViewDetail}
                  onRollback={handleRollback}
                />
              ))}
            </div>
          </Card>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="md"
                icon={ChevronDown}
                onClick={handleLoadMore}
              >
                Carregar mais ({filteredRuns.length - visibleCount} restante
                {filteredRuns.length - visibleCount !== 1 ? 's' : ''})
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Rollback Dialog */}
      {rollbackRun && (
        <RollbackDialog
          isOpen={!!rollbackRun}
          onClose={handleCloseRollback}
          run={rollbackRun}
        />
      )}
    </div>
  );
}

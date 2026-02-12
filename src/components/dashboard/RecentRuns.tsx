import { motion } from 'framer-motion';
import {
  History,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FlaskConical,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/stores';
import { VIEWS } from '@/lib/constants';
import { formatRelativeTime, truncatePath } from '@/lib/formatters';
import type { Run } from '@/types/runs';

/* ---------- Status Config ---------- */

interface StatusConfig {
  label: string;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'default';
  icon: typeof CheckCircle2;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  completed: { label: 'Concluido', variant: 'success', icon: CheckCircle2 },
  failed: { label: 'Falhou', variant: 'danger', icon: XCircle },
  rolled_back: { label: 'Revertido', variant: 'warning', icon: RotateCcw },
  running: { label: 'Executando', variant: 'info', icon: Loader2 },
  pending: { label: 'Pendente', variant: 'default', icon: Loader2 },
};

const TYPE_MAP: Record<string, StatusConfig> = {
  simulation: { label: 'Simulacao', variant: 'info', icon: FlaskConical },
};

function getStatusConfig(run: Run): StatusConfig {
  // If it's a simulation, show simulation badge regardless of status
  if (run.run_type === 'simulation') {
    return TYPE_MAP.simulation;
  }
  return STATUS_MAP[run.status] || STATUS_MAP.pending;
}

/* ---------- Run Item ---------- */

interface RunItemRowProps {
  run: Run;
  index: number;
  onViewDetails: (id: string) => void;
}

function RunItemRow({ run, index, onViewDetails }: RunItemRowProps) {
  const statusConfig = getStatusConfig(run);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: 'easeOut' }}
      className="
        group flex items-center gap-3
        py-3 px-1
        border-b border-gray-100 dark:border-gray-800
        last:border-0
        hover:bg-gray-50/50 dark:hover:bg-gray-800/30
        rounded-lg transition-colors duration-150
      "
    >
      {/* Status icon */}
      <div className="shrink-0">
        <StatusIcon
          size={16}
          className={`
            ${statusConfig.variant === 'success' ? 'text-emerald-500 dark:text-emerald-400' : ''}
            ${statusConfig.variant === 'danger' ? 'text-red-500 dark:text-red-400' : ''}
            ${statusConfig.variant === 'warning' ? 'text-amber-500 dark:text-amber-400' : ''}
            ${statusConfig.variant === 'info' ? 'text-blue-500 dark:text-blue-400' : ''}
            ${statusConfig.variant === 'default' ? 'text-gray-400 dark:text-gray-500' : ''}
            ${run.status === 'running' ? 'animate-spin' : ''}
          `}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatRelativeTime(run.started_at)}
          </span>
        </div>
        <p
          className="text-sm text-gray-700 dark:text-gray-300 truncate"
          title={run.source_folder}
        >
          {truncatePath(run.source_folder, 45)}
        </p>
      </div>

      {/* Files moved count */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {run.moved_files}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {run.moved_files === 1 ? 'arquivo' : 'arquivos'}
        </p>
      </div>

      {/* View details arrow */}
      <button
        type="button"
        onClick={() => onViewDetails(run.id)}
        className="
          shrink-0 p-1.5 rounded-md
          text-gray-300 dark:text-gray-600
          group-hover:text-gray-500 dark:group-hover:text-gray-400
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-brand-500
        "
        aria-label="Ver detalhes"
      >
        <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}

/* ---------- Empty State ---------- */

function EmptyRunsState() {
  const setView = useAppStore((s) => s.setView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center py-10 text-center"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
        <Inbox size={22} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Nenhuma execucao ainda
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-[220px]">
        Comece simulando para ver como suas regras organizariam os arquivos.
      </p>
      <button
        type="button"
        onClick={() => setView(VIEWS.SIMULATION)}
        className="
          inline-flex items-center gap-1.5
          text-xs font-semibold
          text-brand-600 hover:text-brand-700
          dark:text-brand-400 dark:hover:text-brand-300
          transition-colors duration-150
          focus:outline-none focus:underline
        "
      >
        <FlaskConical size={14} />
        Iniciar simulacao
      </button>
    </motion.div>
  );
}

/* ---------- Loading Skeleton ---------- */

function RunsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Main Component ---------- */

interface RecentRunsProps {
  runs: Run[];
  isLoading: boolean;
}

/**
 * RecentRuns displays a list of the most recent execution runs on the dashboard.
 * Shows status badges, source folders, file counts, and relative timestamps.
 */
export function RecentRuns({ runs, isLoading }: RecentRunsProps) {
  const setView = useAppStore((s) => s.setView);

  const handleViewAll = () => {
    setView(VIEWS.HISTORY);
  };

  const handleViewDetails = (_id: string) => {
    setView(VIEWS.HISTORY_DETAIL);
  };

  return (
    <Card padding="none" className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <History size={18} className="text-brand-600 dark:text-brand-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Atividade Recente
          </h2>
        </div>
        <button
          type="button"
          onClick={handleViewAll}
          className="
            inline-flex items-center gap-1
            text-xs font-medium
            text-brand-600 hover:text-brand-700
            dark:text-brand-400 dark:hover:text-brand-300
            transition-colors duration-150
            focus:outline-none focus:underline
          "
        >
          Ver tudo
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <RunsSkeleton />
        ) : runs.length === 0 ? (
          <EmptyRunsState />
        ) : (
          <div>
            {runs.slice(0, 5).map((run, i) => (
              <RunItemRow
                key={run.id}
                run={run}
                index={i}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

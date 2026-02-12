import { motion } from 'framer-motion';
import {
  FolderOpen,
  Eye,
  EyeOff,
  Plus,
  Monitor,
  Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/stores';
import { VIEWS } from '@/lib/constants';
import { truncatePath } from '@/lib/formatters';

/* ---------- Types ---------- */

interface FolderInfo {
  path: string;
  icon: LucideIcon;
  fileCount: number;
  isWatching: boolean;
}

/* ---------- Mock Data ---------- */

/** Mock folder data until real watcher integration is available. */
const MOCK_FOLDERS: FolderInfo[] = [
  {
    path: 'C:\\Users\\User\\Desktop',
    icon: Monitor,
    fileCount: 23,
    isWatching: true,
  },
  {
    path: 'C:\\Users\\User\\Downloads',
    icon: Download,
    fileCount: 47,
    isWatching: true,
  },
];

/* ---------- Folder Row ---------- */

interface FolderRowProps {
  folder: FolderInfo;
  index: number;
}

function FolderRow({ folder, index }: FolderRowProps) {
  const Icon = folder.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.25, ease: 'easeOut' }}
      className="
        group flex items-center gap-3
        py-2.5 px-1
        border-b border-gray-100 dark:border-gray-800
        last:border-0
        hover:bg-gray-50/50 dark:hover:bg-gray-800/30
        rounded-lg transition-colors duration-150
      "
    >
      {/* Folder icon */}
      <div
        className="
          flex items-center justify-center shrink-0
          w-8 h-8 rounded-lg
          bg-blue-50 dark:bg-blue-500/10
        "
      >
        <Icon size={16} className="text-blue-500 dark:text-blue-400" />
      </div>

      {/* Folder details */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-gray-700 dark:text-gray-300 truncate"
          title={folder.path}
        >
          {truncatePath(folder.path, 30)}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {folder.fileCount} {folder.fileCount === 1 ? 'arquivo' : 'arquivos'}
        </p>
      </div>

      {/* Watch mode badge */}
      <div className="shrink-0">
        {folder.isWatching ? (
          <Badge variant="success" size="sm">
            <span className="flex items-center gap-1">
              <Eye size={10} />
              Ativo
            </span>
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            <span className="flex items-center gap-1">
              <EyeOff size={10} />
              Parado
            </span>
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- Empty State ---------- */

function EmptyFolders() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center py-6 text-center"
    >
      <FolderOpen size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Nenhuma pasta monitorada
      </p>
    </motion.div>
  );
}

/* ---------- Main Component ---------- */

/**
 * FolderOverview shows a summary of monitored folders in the dashboard sidebar.
 * Displays each folder with its icon, truncated path, file count, and watch status.
 */
export function FolderOverview() {
  const setView = useAppStore((s) => s.setView);
  const folders = MOCK_FOLDERS;

  return (
    <Card padding="none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Pastas Monitoradas
          </h3>
        </div>
      </div>

      {/* Folder list */}
      <div className="px-3 pb-2">
        {folders.length === 0 ? (
          <EmptyFolders />
        ) : (
          folders.map((folder, i) => (
            <FolderRow key={folder.path} folder={folder} index={i} />
          ))
        )}
      </div>

      {/* Add folder button */}
      <div className="px-4 pb-4 pt-1">
        <button
          type="button"
          onClick={() => setView(VIEWS.SETTINGS)}
          className="
            w-full flex items-center justify-center gap-1.5
            py-2 rounded-lg
            text-xs font-medium
            text-gray-500 dark:text-gray-400
            hover:text-brand-600 dark:hover:text-brand-400
            border border-dashed border-gray-200 dark:border-gray-700
            hover:border-brand-300 dark:hover:border-brand-600
            hover:bg-brand-50/50 dark:hover:bg-brand-500/5
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-500
          "
        >
          <Plus size={14} />
          Adicionar pasta
        </button>
      </div>
    </Card>
  );
}

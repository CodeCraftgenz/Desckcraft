import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { SimulationItem } from '@/types/runs';
import { truncatePath } from '@/lib/formatters';

/* ---------- File Icon Resolver ---------- */

const extensionIconMap: Record<string, LucideIcon> = {
  // Documents
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  rtf: FileText,
  odt: FileText,
  xls: FileText,
  xlsx: FileText,
  csv: FileText,
  ppt: FileText,
  pptx: FileText,
  // Images
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  bmp: FileImage,
  svg: FileImage,
  webp: FileImage,
  ico: FileImage,
  // Video
  mp4: FileVideo,
  avi: FileVideo,
  mkv: FileVideo,
  mov: FileVideo,
  wmv: FileVideo,
  flv: FileVideo,
  webm: FileVideo,
  // Audio
  mp3: FileAudio,
  wav: FileAudio,
  flac: FileAudio,
  ogg: FileAudio,
  aac: FileAudio,
  wma: FileAudio,
  // Archives
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  bz2: FileArchive,
  // Code
  js: FileCode,
  ts: FileCode,
  jsx: FileCode,
  tsx: FileCode,
  py: FileCode,
  java: FileCode,
  rs: FileCode,
  go: FileCode,
  html: FileCode,
  css: FileCode,
  json: FileCode,
  xml: FileCode,
  yaml: FileCode,
  yml: FileCode,
  toml: FileCode,
  md: FileCode,
};

function getFileIcon(extension: string): LucideIcon {
  return extensionIconMap[extension.toLowerCase()] || File;
}

function getFileIconColor(extension: string): string {
  const ext = extension.toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'].includes(ext)) {
    return 'text-blue-500 dark:text-blue-400';
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(ext)) {
    return 'text-emerald-500 dark:text-emerald-400';
  }
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
    return 'text-purple-500 dark:text-purple-400';
  }
  if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'wma'].includes(ext)) {
    return 'text-pink-500 dark:text-pink-400';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'text-amber-500 dark:text-amber-400';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'rs', 'go', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'toml', 'md'].includes(ext)) {
    return 'text-orange-500 dark:text-orange-400';
  }
  return 'text-gray-400 dark:text-gray-500';
}

/* ---------- Sort Types ---------- */

type SortField = 'name' | 'rule' | 'conflict';
type SortDirection = 'asc' | 'desc';

/* ---------- SimulationPreview Component ---------- */

interface SimulationPreviewProps {
  items: SimulationItem[];
}

export function SimulationPreview({ items }: SimulationPreviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  const PAGE_SIZE = 50;

  /* ---------- Filter & Sort ---------- */

  const filteredAndSorted = useMemo(() => {
    let filtered = items;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = items.filter(
        (item) =>
          item.file.name.toLowerCase().includes(query) ||
          item.file.path.toLowerCase().includes(query) ||
          item.destination.toLowerCase().includes(query) ||
          item.rule_name.toLowerCase().includes(query),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.file.name.localeCompare(b.file.name);
          break;
        case 'rule':
          cmp = a.rule_name.localeCompare(b.rule_name);
          break;
        case 'conflict':
          cmp = (a.has_conflict ? 1 : 0) - (b.has_conflict ? 1 : 0);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [items, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const paginatedItems = filteredAndSorted.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  /* ---------- Handlers ---------- */

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function toggleExpand(index: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  /* ---------- Sort Button ---------- */

  function SortButton({ field, label }: { field: SortField; label: string }) {
    const isActive = sortField === field;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className={`
          inline-flex items-center gap-1 text-xs font-medium transition-colors
          ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
        `}
      >
        {label}
        {isActive ? (
          sortDirection === 'asc' ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-50" />
        )}
      </button>
    );
  }

  /* ---------- Render ---------- */

  return (
    <div className="space-y-3">
      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 w-full sm:max-w-xs">
          <Input
            icon={Search}
            placeholder="Buscar arquivos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 dark:text-gray-500">Ordenar:</span>
          <SortButton field="name" label="Nome" />
          <SortButton field="rule" label="Regra" />
          <SortButton field="conflict" label="Conflitos" />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {filteredAndSorted.length === items.length
          ? `${items.length} arquivo${items.length !== 1 ? 's' : ''}`
          : `${filteredAndSorted.length} de ${items.length} arquivo${items.length !== 1 ? 's' : ''}`}
      </p>

      {/* Items List */}
      <Card padding="none" className="overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <AnimatePresence initial={true}>
            {paginatedItems.map((item, idx) => {
              const globalIdx = currentPage * PAGE_SIZE + idx;
              const isExpanded = expandedRows.has(globalIdx);
              const FileIcon = getFileIcon(item.file.extension);
              const iconColor = getFileIconColor(item.file.extension);

              return (
                <motion.div
                  key={`${item.file.path}-${globalIdx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(idx * 0.02, 0.5),
                    ease: 'easeOut',
                  }}
                >
                  {/* Main Row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(globalIdx)}
                    className={`
                      w-full text-left px-4 py-3 transition-colors
                      hover:bg-gray-50 dark:hover:bg-gray-800/50
                      ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* File Icon */}
                      <FileIcon size={18} className={`shrink-0 ${iconColor}`} />

                      {/* Original Name + Path */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {truncatePath(item.file.path, 50)}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-gray-300 dark:text-gray-600"
                      />

                      {/* Destination */}
                      <div className="flex-1 min-w-0 hidden sm:block">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {truncatePath(item.destination, 50)}
                        </p>
                      </div>

                      {/* Rule Badge */}
                      <Badge variant="info" size="sm" className="shrink-0">
                        {item.rule_name}
                      </Badge>

                      {/* Conflict Indicator */}
                      {item.has_conflict && (
                        <span className="shrink-0" title="Conflito detectado">
                          <AlertTriangle
                            size={16}
                            className="text-amber-500 dark:text-amber-400"
                          />
                        </span>
                      )}

                      {/* Expand Chevron */}
                      <ChevronDown
                        size={14}
                        className={`
                          shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200
                          ${isExpanded ? 'rotate-180' : ''}
                        `}
                      />
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">
                                Caminho original:
                              </span>
                              <p className="text-gray-700 dark:text-gray-300 break-all mt-0.5">
                                {item.file.path}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">
                                Destino:
                              </span>
                              <p className="text-gray-700 dark:text-gray-300 break-all mt-0.5">
                                {item.destination}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">
                                Regra:
                              </span>
                              <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                                {item.rule_name}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">
                                Tipo de ação:
                              </span>
                              <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                                {item.action_type === 'move' && 'Mover'}
                                {item.action_type === 'rename' && 'Renomear'}
                                {item.action_type === 'move_rename' && 'Mover e Renomear'}
                                {!['move', 'rename', 'move_rename'].includes(item.action_type) && item.action_type}
                              </p>
                            </div>
                            {item.has_conflict && (
                              <div className="sm:col-span-2">
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                  <AlertTriangle size={12} />
                                  <span className="font-medium">
                                    Conflito: já existe um arquivo no destino
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty search result */}
        {paginatedItems.length === 0 && searchQuery.trim() && (
          <div className="py-8 text-center">
            <Search size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum arquivo encontrado para "{searchQuery}"
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}

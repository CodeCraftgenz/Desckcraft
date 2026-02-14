import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  Trash2,
  MonitorDown,
  Download,
  Eye,
  Clock,
  Hand,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { tauriInvoke } from '@/lib/tauri';

type WatchMode = 'manual' | 'realtime' | 'scheduled';

interface WatchedFolder {
  id: string;
  path: string;
  mode: WatchMode;
  profile_id?: string | null;
}

const WATCH_MODE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'realtime', label: 'Tempo real' },
  { value: 'scheduled', label: 'Agendado' },
];

const MODE_BADGE_CONFIG: Record<
  WatchMode,
  { label: string; variant: 'default' | 'success' | 'info'; icon: typeof Eye }
> = {
  manual: { label: 'Manual', variant: 'default', icon: Hand },
  realtime: { label: 'Tempo real', variant: 'success', icon: Eye },
  scheduled: { label: 'Agendado', variant: 'info', icon: Clock },
};

/* ---------- Get default user folders ---------- */

function getDefaultSuggestions(): { path: string; label: string; icon: typeof MonitorDown }[] {
  return [
    { path: 'C:\\Users\\%USERNAME%\\Desktop', label: 'Área de trabalho', icon: MonitorDown },
    { path: 'C:\\Users\\%USERNAME%\\Downloads', label: 'Downloads', icon: Download },
  ];
}

/* ---------- Folder dialog helper ---------- */

async function openNativeFolderDialog(): Promise<string | null> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      title: 'Selecionar pasta para monitorar',
    });
    if (selected && typeof selected === 'string') {
      return selected;
    }
    return null;
  } catch {
    const selected = await tauriInvoke<string | null>('select_folder', {});
    return selected ?? null;
  }
}

/**
 * FolderSettings -- Manage watched folders for file organization.
 *
 * Communicates with the backend via tauriInvoke:
 * - list_watched_folders
 * - add_watched_folder
 * - remove_watched_folder
 * - update_watch_mode
 */
export function FolderSettings() {
  const toast = useToast();
  const [folders, setFolders] = useState<WatchedFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPath, setNewPath] = useState('');
  const [newMode, setNewMode] = useState<WatchMode>('manual');
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const defaultSuggestions = getDefaultSuggestions();

  /* --- Fetch folders on mount --- */
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const result = await tauriInvoke<WatchedFolder[]>('list_watched_folders');
        setFolders(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Silently handle: backend might not be available yet
        console.warn('Erro ao carregar pastas monitoradas:', msg);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  /* --- Add folder via backend --- */
  const handleAddFolder = useCallback(async () => {
    if (!newPath.trim()) return;

    setIsAdding(true);
    try {
      const folder = await tauriInvoke<WatchedFolder>('add_watched_folder', {
        path: newPath.trim(),
        profileId: '',
        watchMode: newMode,
      });
      setFolders((prev) => [...prev, folder]);
      setNewPath('');
      setNewMode('manual');
      setShowForm(false);
      toast.success('Pasta adicionada com sucesso.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Fallback: add locally if backend is not available
      const folder: WatchedFolder = {
        id: crypto.randomUUID(),
        path: newPath.trim(),
        mode: newMode,
      };
      setFolders((prev) => [...prev, folder]);
      setNewPath('');
      setNewMode('manual');
      setShowForm(false);
      toast.info(`Pasta adicionada localmente. Backend: ${msg}`);
    } finally {
      setIsAdding(false);
    }
  }, [newPath, newMode, toast]);

  /* --- Add folder via native dialog --- */
  const handleSelectAndAdd = useCallback(async () => {
    try {
      const selected = await openNativeFolderDialog();
      if (selected) {
        setNewPath(selected);
        setShowForm(true);
      }
    } catch {
      toast.info('Use o campo de texto para digitar o caminho da pasta.');
      setShowForm(true);
    }
  }, [toast]);

  /* --- Remove folder via backend --- */
  const handleRemoveFolder = useCallback(
    async (id: string) => {
      try {
        await tauriInvoke('remove_watched_folder', { id });
        setFolders((prev) => prev.filter((f) => f.id !== id));
        toast.success('Pasta removida com sucesso.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Fallback: remove locally
        setFolders((prev) => prev.filter((f) => f.id !== id));
        toast.info(`Pasta removida localmente. Backend: ${msg}`);
      }
    },
    [toast],
  );

  /* --- Update watch mode via backend --- */
  const handleUpdateMode = useCallback(
    async (id: string, watchMode: WatchMode) => {
      try {
        await tauriInvoke('update_watch_mode', { id, watchMode });
        setFolders((prev) =>
          prev.map((f) => (f.id === id ? { ...f, mode: watchMode } : f)),
        );
        toast.success('Modo de monitoramento atualizado.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Fallback: update locally
        setFolders((prev) =>
          prev.map((f) => (f.id === id ? { ...f, mode: watchMode } : f)),
        );
        toast.info(`Modo atualizado localmente. Backend: ${msg}`);
      }
    },
    [toast],
  );

  /* --- Quick-add suggestions --- */
  const handleAddSuggestion = useCallback(
    async (path: string) => {
      // Avoid duplicates
      if (folders.some((f) => f.path === path)) {
        toast.info('Essa pasta já está na lista.');
        return;
      }

      try {
        const folder = await tauriInvoke<WatchedFolder>('add_watched_folder', {
          path,
          profileId: '',
          watchMode: 'manual' as WatchMode,
        });
        setFolders((prev) => [...prev, folder]);
        toast.success('Pasta adicionada com sucesso.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const folder: WatchedFolder = {
          id: crypto.randomUUID(),
          path,
          mode: 'manual',
        };
        setFolders((prev) => [...prev, folder]);
        toast.info(`Pasta adicionada localmente. Backend: ${msg}`);
      }
    },
    [folders, toast],
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
              bg-emerald-50 dark:bg-emerald-500/10
              ring-1 ring-emerald-200/50 dark:ring-emerald-500/20
            "
          >
            <FolderOpen size={18} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Pastas monitoradas
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Gerencie as pastas que o DeskCraft monitora para organizar
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-gray-400 dark:text-gray-500" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Carregando pastas...
              </span>
            </div>
          )}

          {/* Folder list */}
          {!isLoading && folders.length > 0 && (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {folders.map((folder) => {
                  const modeConfig = MODE_BADGE_CONFIG[folder.mode];
                  const ModeIcon = modeConfig.icon;
                  return (
                    <motion.div
                      key={folder.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg
                        bg-gray-50 dark:bg-gray-800/50
                        border border-gray-100 dark:border-gray-800
                        group"
                    >
                      <FolderOpen
                        size={16}
                        className="text-gray-400 dark:text-gray-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate font-mono">
                          {folder.path}
                        </p>
                      </div>

                      {/* Watch mode selector */}
                      <div className="shrink-0 w-32">
                        <select
                          value={folder.mode}
                          onChange={(e) =>
                            handleUpdateMode(folder.id, e.target.value as WatchMode)
                          }
                          title={`Modo de monitoramento para ${folder.path}`}
                          aria-label={`Modo de monitoramento para ${folder.path}`}
                          className="
                            w-full text-xs px-2 py-1 rounded-md
                            bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700
                            text-gray-700 dark:text-gray-300
                            focus:outline-none focus:ring-1 focus:ring-brand-500
                            cursor-pointer
                          "
                        >
                          {WATCH_MODE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Badge variant={modeConfig.variant} size="sm">
                        <ModeIcon size={10} className="mr-1" />
                        {modeConfig.label}
                      </Badge>

                      <button
                        type="button"
                        onClick={() => handleRemoveFolder(folder.id)}
                        className="
                          p-1.5 rounded-md
                          text-gray-400 hover:text-red-500
                          dark:text-gray-500 dark:hover:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-500/10
                          opacity-0 group-hover:opacity-100
                          transition-all duration-150
                          focus:outline-none focus:ring-2 focus:ring-red-500
                        "
                        aria-label={`Remover pasta ${folder.path}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && folders.length === 0 && (
            <div
              className="
                px-4 py-6 rounded-lg text-center
                bg-gray-50 dark:bg-gray-800/50
                border border-dashed border-gray-200 dark:border-gray-700
              "
            >
              <FolderOpen
                size={24}
                className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma pasta monitorada
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Adicione pastas para o DeskCraft organizar automaticamente
              </p>
            </div>
          )}

          {/* Default folder suggestions */}
          {!isLoading && folders.length === 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Sugestões rápidas
              </p>
              <div className="flex gap-2">
                {defaultSuggestions.map((suggestion) => {
                  const SIcon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.path}
                      type="button"
                      onClick={() => handleAddSuggestion(suggestion.path)}
                      className="
                        flex items-center gap-2 px-3 py-2 rounded-lg
                        border border-gray-200 dark:border-gray-700
                        hover:border-brand-300 dark:hover:border-brand-600
                        hover:bg-brand-50 dark:hover:bg-brand-500/10
                        text-sm text-gray-600 dark:text-gray-400
                        hover:text-brand-600 dark:hover:text-brand-400
                        transition-all duration-150
                        focus:outline-none focus:ring-2 focus:ring-brand-500
                      "
                    >
                      <SIcon size={14} />
                      {suggestion.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Add folder form */}
          <AnimatePresence>
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Caminho da pasta
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="C:\Users\seu-usuario\Documents"
                        value={newPath}
                        onChange={(e) => setNewPath(e.target.value)}
                        icon={FolderOpen}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={FolderOpen}
                      onClick={handleSelectAndAdd}
                    >
                      Selecionar
                    </Button>
                  </div>
                </div>
                <Select
                  label="Modo de monitoramento"
                  options={WATCH_MODE_OPTIONS}
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value as WatchMode)}
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleAddFolder}
                    disabled={!newPath.trim() || isAdding}
                    loading={isAdding}
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      setNewPath('');
                      setNewMode('manual');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowForm(true)}
                >
                  Adicionar pasta
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FolderOpen}
                  onClick={handleSelectAndAdd}
                >
                  Selecionar pasta
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info box */}
          <div
            className="
              px-4 py-3 rounded-lg
              bg-gray-50 dark:bg-gray-800/50
              border border-gray-100 dark:border-gray-800
            "
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-700 dark:text-gray-300">Dica:</strong>{' '}
              O modo "Tempo real" monitora alterações instantaneamente. O modo "Manual"
              só organiza quando você executar. O modo "Agendado" executa em horários
              programados.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

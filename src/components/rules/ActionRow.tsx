import { motion } from 'framer-motion';
import { X, FolderOpen } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ACTION_TYPES } from '@/lib/constants';
import type { ActionType } from '@/types/rules';

/* ---------- Portuguese Labels ---------- */

const ACTION_LABELS: Record<string, string> = {
  move_to_folder: 'Mover para pasta',
  move_to_subfolder: 'Mover para subpasta',
  rename: 'Renomear',
  add_tag: 'Adicionar tag',
};

const actionOptions = ACTION_TYPES.map((a) => ({
  value: a.value,
  label: ACTION_LABELS[a.value] || a.label,
}));

/* ---------- Template Helpers ---------- */

const SUBFOLDER_TEMPLATES = [
  { value: '{extension}', label: 'Por extensão ({extension})' },
  { value: '{year}/{month}', label: 'Por ano/mês ({year}/{month})' },
  { value: '{year}/{month}/{day}', label: 'Por ano/mês/dia ({year}/{month}/{day})' },
];

const RENAME_HELPERS = [
  { token: '{original}', label: 'Nome original' },
  { token: '{date}', label: 'Data atual' },
  { token: '{counter}', label: 'Contador' },
];

/* ---------- Types ---------- */

export interface ActionRowData {
  id: string;
  action_type: ActionType;
  destination: string;
  rename_pattern: string;
  tag_name: string;
}

interface ActionRowProps {
  action: ActionRowData;
  index: number;
  onChange: (id: string, updates: Partial<ActionRowData>) => void;
  onDelete: (id: string) => void;
}

/* ---------- Component ---------- */

export function ActionRow({ action, index, onChange, onDelete }: ActionRowProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ActionType;
    onChange(action.id, {
      action_type: newType,
      destination: '',
      rename_pattern: '',
      tag_name: '',
    });
  };

  const insertRenameToken = (token: string) => {
    const current = action.rename_pattern;
    onChange(action.id, { rename_pattern: current + token });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="
        group relative
        bg-gray-50 dark:bg-gray-800/50
        border border-gray-200 dark:border-gray-700
        rounded-lg p-3
        hover:border-emerald-300 dark:hover:border-emerald-700
        transition-colors
      "
    >
      {/* Row number indicator */}
      <div className="absolute -left-2.5 top-4 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          {index + 1}
        </span>
      </div>

      <div className="space-y-3">
        {/* Top row: action type + delete */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 max-w-xs">
            <Select
              options={actionOptions}
              value={action.action_type}
              onChange={handleTypeChange}
              className="text-sm"
            />
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(action.id)}
            className="
              mt-1 p-1.5 rounded-lg
              text-gray-400 hover:text-red-500
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors shrink-0
              opacity-0 group-hover:opacity-100
              focus:opacity-100
            "
            title="Remover ação"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conditional fields based on action type */}
        {action.action_type === 'move_to_folder' && (
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Input
                label="Pasta de destino"
                placeholder="Ex: C:\Users\Documentos\PDFs"
                value={action.destination}
                onChange={(e) => onChange(action.id, { destination: e.target.value })}
                icon={FolderOpen}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {action.action_type === 'move_to_subfolder' && (
          <div className="space-y-2">
            <div className="flex-1 min-w-0">
              <Input
                label="Pasta base"
                placeholder="Ex: C:\Users\Documentos"
                value={action.destination}
                onChange={(e) => onChange(action.id, { destination: e.target.value })}
                icon={FolderOpen}
                className="text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Template de subpasta
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUBFOLDER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.value}
                    type="button"
                    onClick={() =>
                      onChange(action.id, {
                        rename_pattern: tpl.value,
                      })
                    }
                    className={`
                      px-2.5 py-1 text-xs rounded-md border transition-colors
                      ${
                        action.rename_pattern === tpl.value
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }
                    `}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {action.action_type === 'rename' && (
          <div className="space-y-2">
            <div className="flex-1 min-w-0">
              <Input
                label="Padrão de renomeação"
                placeholder="Ex: {original}_{date}"
                value={action.rename_pattern}
                onChange={(e) => onChange(action.id, { rename_pattern: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Variáveis disponíveis
              </p>
              <div className="flex flex-wrap gap-1.5">
                {RENAME_HELPERS.map((helper) => (
                  <button
                    key={helper.token}
                    type="button"
                    onClick={() => insertRenameToken(helper.token)}
                    className="
                      px-2.5 py-1 text-xs rounded-md border
                      bg-white dark:bg-gray-800
                      border-gray-200 dark:border-gray-700
                      text-gray-600 dark:text-gray-400
                      hover:border-emerald-300 dark:hover:border-emerald-700
                      hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                      transition-colors
                    "
                  >
                    <Badge size="sm" variant="default">
                      {helper.token}
                    </Badge>
                    <span className="ml-1.5">{helper.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {action.action_type === 'add_tag' && (
          <div className="flex-1 min-w-0 max-w-xs">
            <Input
              label="Nome da tag"
              placeholder="Ex: importante, revisar"
              value={action.tag_name}
              onChange={(e) => onChange(action.id, { tag_name: e.target.value })}
              className="text-sm"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

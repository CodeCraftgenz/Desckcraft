import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { CONDITION_FIELDS, CONDITION_OPERATORS } from '@/lib/constants';
import type { ConditionField, ConditionOperator } from '@/types/rules';

/* ---------- Portuguese Labels ---------- */

const FIELD_LABELS: Record<string, string> = {
  extension: 'Extensão do arquivo',
  filename: 'Nome do arquivo',
  size: 'Tamanho do arquivo',
  created_date: 'Data de criação',
  modified_date: 'Data de modificação',
  source_folder: 'Pasta de origem',
  regex: 'Padrão Regex',
};

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'Igual a',
  not_equals: 'Diferente de',
  contains: 'Contém',
  not_contains: 'Não contém',
  starts_with: 'Começa com',
  ends_with: 'Termina com',
  greater_than: 'Maior que',
  less_than: 'Menor que',
  before: 'Antes de',
  after: 'Depois de',
  matches: 'Corresponde (Regex)',
};

/* ---------- Helpers ---------- */

const fieldOptions = CONDITION_FIELDS.map((f) => ({
  value: f.value,
  label: FIELD_LABELS[f.value] || f.label,
}));

function getOperatorsForField(field: ConditionField) {
  const dateFields: ConditionField[] = ['created_date', 'modified_date'];
  const sizeField: ConditionField = 'size';
  const textFields: ConditionField[] = ['extension', 'filename', 'source_folder'];
  const regexField: ConditionField = 'regex';

  if (dateFields.includes(field)) {
    return CONDITION_OPERATORS.filter((o) =>
      ['equals', 'not_equals', 'before', 'after'].includes(o.value),
    ).map((o) => ({ value: o.value, label: OPERATOR_LABELS[o.value] || o.label }));
  }

  if (field === sizeField) {
    return CONDITION_OPERATORS.filter((o) =>
      ['equals', 'not_equals', 'greater_than', 'less_than'].includes(o.value),
    ).map((o) => ({ value: o.value, label: OPERATOR_LABELS[o.value] || o.label }));
  }

  if (field === regexField) {
    return [{ value: 'matches', label: OPERATOR_LABELS['matches'] || 'Matches (Regex)' }];
  }

  if (textFields.includes(field)) {
    return CONDITION_OPERATORS.filter((o) =>
      ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'].includes(
        o.value,
      ),
    ).map((o) => ({ value: o.value, label: OPERATOR_LABELS[o.value] || o.label }));
  }

  // fallback: all operators
  return CONDITION_OPERATORS.map((o) => ({
    value: o.value,
    label: OPERATOR_LABELS[o.value] || o.label,
  }));
}

function getValuePlaceholder(field: ConditionField): string {
  switch (field) {
    case 'extension':
      return 'Ex: .pdf, .docx';
    case 'filename':
      return 'Ex: relatório';
    case 'size':
      return 'Ex: 10MB';
    case 'created_date':
    case 'modified_date':
      return 'AAAA-MM-DD';
    case 'source_folder':
      return 'Ex: C:\\Users\\Downloads';
    case 'regex':
      return 'Ex: ^relat.*\\.pdf$';
    default:
      return 'Valor';
  }
}

function getValueInputType(field: ConditionField): string {
  if (field === 'created_date' || field === 'modified_date') return 'date';
  return 'text';
}

/* ---------- Date Presets (for archiving) ---------- */

function getDatePresets(): { label: string; value: string }[] {
  const now = new Date();
  const presets: { label: string; value: string }[] = [];

  // Last 6 months
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    presets.push({
      label: `${monthNames[d.getMonth()]} ${year}`,
      value: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
    });
  }
  return presets;
}

/* ---------- Extension Presets ---------- */

const EXTENSION_PRESETS: { label: string; extensions: string }[] = [
  { label: 'Imagens', extensions: 'jpg,jpeg,png,gif,bmp,webp,svg,ico,tiff' },
  { label: 'Documentos', extensions: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,rtf' },
  { label: 'Videos', extensions: 'mp4,avi,mkv,mov,wmv,flv,webm,m4v' },
  { label: 'Audio', extensions: 'mp3,wav,flac,aac,ogg,wma,m4a,opus' },
  { label: 'Compactados', extensions: 'zip,rar,7z,tar,gz,bz2,xz,iso' },
  { label: 'Instaladores', extensions: 'exe,msi,dmg,deb,rpm' },
  { label: 'Codigo', extensions: 'py,js,ts,jsx,tsx,html,css,json,java,cpp,c,go,rs,php' },
  { label: 'Fontes', extensions: 'ttf,otf,woff,woff2,eot' },
  { label: 'Design', extensions: 'psd,ai,eps,xd,fig,sketch,blend,raw' },
  { label: 'E-books', extensions: 'epub,mobi,azw,azw3,fb2,djvu,cbr,cbz' },
];

/* ---------- Types ---------- */

export interface ConditionRowData {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
  logic_gate: 'AND' | 'OR';
}

interface ConditionRowProps {
  condition: ConditionRowData;
  index: number;
  isFirst: boolean;
  onChange: (id: string, updates: Partial<ConditionRowData>) => void;
  onDelete: (id: string) => void;
  onToggleLogicGate: (id: string) => void;
}

/* ---------- Component ---------- */

export function ConditionRow({
  condition,
  index,
  isFirst,
  onChange,
  onDelete,
  onToggleLogicGate,
}: ConditionRowProps) {
  const operatorOptions = getOperatorsForField(condition.field);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value as ConditionField;
    const newOps = getOperatorsForField(newField);
    const currentOpValid = newOps.some((o) => o.value === condition.operator);
    onChange(condition.id, {
      field: newField,
      operator: currentOpValid ? condition.operator : (newOps[0]?.value as ConditionOperator),
      value: '',
    });
  };

  return (
    <div>
      {/* Logic gate badge between rows */}
      {!isFirst && (
        <div className="flex justify-center -my-1.5 relative z-10">
          <button
            type="button"
            onClick={() => onToggleLogicGate(condition.id)}
            className="
              px-3 py-1 text-xs font-bold rounded-full
              border-2 border-indigo-200 dark:border-indigo-800
              bg-white dark:bg-gray-900
              text-indigo-600 dark:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-900/30
              hover:border-indigo-300 dark:hover:border-indigo-700
              transition-colors cursor-pointer select-none
              shadow-sm
            "
            title="Clique para alternar entre E / OU"
          >
            {condition.logic_gate === 'AND' ? 'E' : 'OU'}
          </button>
        </div>
      )}

      {/* Condition card */}
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
          hover:border-indigo-300 dark:hover:border-indigo-700
          transition-colors
        "
      >
        {/* Row number indicator */}
        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
            {index + 1}
          </span>
        </div>

        <div className="flex items-start gap-2">
          {/* Field select */}
          <div className="flex-1 min-w-0">
            <Select
              options={fieldOptions}
              value={condition.field}
              onChange={handleFieldChange}
              className="text-sm"
            />
          </div>

          {/* Operator select */}
          <div className="flex-1 min-w-0">
            <Select
              options={operatorOptions}
              value={condition.operator}
              onChange={(e) =>
                onChange(condition.id, {
                  operator: e.target.value as ConditionOperator,
                })
              }
              className="text-sm"
            />
          </div>

          {/* Value input */}
          <div className="flex-1 min-w-0">
            <Input
              type={getValueInputType(condition.field)}
              placeholder={getValuePlaceholder(condition.field)}
              value={condition.value}
              onChange={(e) => onChange(condition.id, { value: e.target.value })}
              className="text-sm"
            />
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(condition.id)}
            className="
              mt-1 p-1.5 rounded-lg
              text-gray-400 hover:text-red-500
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors shrink-0
              opacity-0 group-hover:opacity-100
              focus:opacity-100
            "
            title="Remover condição"
          >
            <X size={16} />
          </button>
        </div>

        {/* Date presets - for archiving rules */}
        {(condition.field === 'modified_date' || condition.field === 'created_date') && (
          <div className="mt-2">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              Arquivar antes de:
            </p>
            <div className="flex flex-wrap gap-1">
              {getDatePresets().map((preset) => {
                const isActive = condition.value === preset.value && condition.operator === 'before';
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      onChange(condition.id, {
                        value: preset.value,
                        operator: 'before' as ConditionOperator,
                      })
                    }
                    className={`
                      px-2 py-0.5 text-[10px] font-medium rounded-md border transition-colors
                      ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600'
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Extension presets - quick select */}
        {condition.field === 'extension' && (
          <div className="mt-2">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              Atalhos de extensao:
            </p>
            <div className="flex flex-wrap gap-1">
              {EXTENSION_PRESETS.map((preset) => {
                const isActive = condition.value === preset.extensions;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange(condition.id, { value: preset.extensions })}
                    className={`
                      px-2 py-0.5 text-[10px] font-medium rounded-md border transition-colors
                      ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600'
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

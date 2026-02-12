import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import type { ConditionRowData } from './ConditionRow';
import type { ActionRowData } from './ActionRow';

/* ---------- Portuguese Translations ---------- */

const FIELD_NAMES: Record<string, string> = {
  extension: 'a extensao',
  filename: 'o nome do arquivo',
  size: 'o tamanho',
  created_date: 'a data de criacao',
  modified_date: 'a data de modificacao',
  source_folder: 'a pasta de origem',
  regex: 'o padrao regex',
};

const OPERATOR_VERBS: Record<string, string> = {
  equals: 'e',
  not_equals: 'nao e',
  contains: 'contem',
  not_contains: 'nao contem',
  starts_with: 'comeca com',
  ends_with: 'termina com',
  greater_than: 'e maior que',
  less_than: 'e menor que',
  before: 'e antes de',
  after: 'e depois de',
  matches: 'corresponde a',
};

const ACTION_DESCRIPTIONS: Record<string, (a: ActionRowData) => string> = {
  move_to_folder: (a) =>
    a.destination ? `mover para ${a.destination}` : 'mover para uma pasta',
  move_to_subfolder: (a) => {
    const base = a.destination || 'uma pasta';
    const tpl = a.rename_pattern || 'subpasta';
    return `mover para ${base}/${tpl}`;
  },
  rename: (a) =>
    a.rename_pattern
      ? `renomear com o padrao "${a.rename_pattern}"`
      : 'renomear o arquivo',
  add_tag: (a) =>
    a.tag_name ? `adicionar a tag "${a.tag_name}"` : 'adicionar uma tag',
};

/* ---------- Types ---------- */

interface RulePreviewProps {
  conditions: ConditionRowData[];
  actions: ActionRowData[];
}

/* ---------- Component ---------- */

export function RulePreview({ conditions, actions }: RulePreviewProps) {
  const previewText = useMemo(() => {
    if (conditions.length === 0 && actions.length === 0) {
      return null;
    }

    // Build conditions text
    let conditionText = '';
    if (conditions.length > 0) {
      const parts = conditions.map((c, i) => {
        const field = FIELD_NAMES[c.field] || c.field;
        const operator = OPERATOR_VERBS[c.operator] || c.operator;
        const value = c.value || '...';

        const clause = `${field} ${operator} "${value}"`;

        if (i === 0) return clause;

        const gate = c.logic_gate === 'AND' ? ' E ' : ' OU ';
        return gate + clause;
      });

      conditionText = parts.join('');
    }

    // Build actions text
    let actionText = '';
    if (actions.length > 0) {
      const parts = actions.map((a) => {
        const descFn = ACTION_DESCRIPTIONS[a.action_type];
        return descFn ? descFn(a) : a.action_type;
      });

      actionText = parts.join(', e ');
    }

    // Assemble
    const segments: string[] = [];
    if (conditionText) {
      segments.push(`SE ${conditionText}`);
    }
    if (actionText) {
      segments.push(`ENTAO ${actionText}`);
    }

    return segments.join(', ') + '.';
  }, [conditions, actions]);

  if (!previewText) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
        <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Adicione condicoes e acoes para ver a previa da regra.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
      <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wide">
          Previa da regra
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          {previewText}
        </p>
      </div>
    </div>
  );
}

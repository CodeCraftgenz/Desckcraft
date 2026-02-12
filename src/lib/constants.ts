import type { AppSettings } from '@/types/settings';
import type { ConditionField, ConditionOperator, ActionType } from '@/types/rules';

export const APP_NAME = 'DeskCraft';

export const VIEWS = {
  DASHBOARD: 'dashboard',
  RULES: 'rules',
  RULE_EDITOR: 'rule-editor',
  PROFILES: 'profiles',
  SIMULATION: 'simulation',
  EXECUTION: 'execution',
  HISTORY: 'history',
  HISTORY_DETAIL: 'history-detail',
  SCHEDULING: 'scheduling',
  SETTINGS: 'settings',
  HELP: 'help',
  HELP_ARTICLE: 'help-article',
} as const;

export type ViewName = (typeof VIEWS)[keyof typeof VIEWS];

export const CONDITION_FIELDS: { value: ConditionField; label: string }[] = [
  { value: 'extension', label: 'Extensão do arquivo' },
  { value: 'filename', label: 'Nome do arquivo' },
  { value: 'size', label: 'Tamanho' },
  { value: 'created_date', label: 'Data de criação' },
  { value: 'modified_date', label: 'Data de modificação' },
  { value: 'source_folder', label: 'Pasta de origem' },
  { value: 'regex', label: 'Expressão regular' },
];

export const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'contains', label: 'Contém' },
  { value: 'not_contains', label: 'Não contém' },
  { value: 'starts_with', label: 'Começa com' },
  { value: 'ends_with', label: 'Termina com' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'before', label: 'Antes de' },
  { value: 'after', label: 'Depois de' },
  { value: 'matches', label: 'Corresponde (Regex)' },
];

export const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'move_to_folder', label: 'Mover para pasta' },
  { value: 'move_to_subfolder', label: 'Mover para subpasta' },
  { value: 'rename', label: 'Renomear' },
  { value: 'add_tag', label: 'Adicionar tag' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'pt-BR',
  conflict_strategy: 'suffix',
  start_minimized: false,
  start_with_os: false,
  log_level: 'info',
  tips_enabled: true,
  tips_frequency: 'normal',
  license_key: '',
  trial_started_at: '',
  first_launch: true,
};

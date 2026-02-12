export interface Rule {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  priority: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RuleCondition {
  id: string;
  rule_id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
  logic_gate: 'AND' | 'OR';
  sort_order: number;
  created_at: string;
}

export type ConditionField =
  | 'extension'
  | 'filename'
  | 'size'
  | 'created_date'
  | 'modified_date'
  | 'source_folder'
  | 'regex';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'before'
  | 'after'
  | 'matches';

export interface RuleAction {
  id: string;
  rule_id: string;
  action_type: ActionType;
  destination: string | null;
  rename_pattern: string | null;
  tag_name: string | null;
  sort_order: number;
  created_at: string;
}

export type ActionType =
  | 'move_to_folder'
  | 'move_to_subfolder'
  | 'rename'
  | 'add_tag';

export interface RuleWithDetails extends Rule {
  conditions: RuleCondition[];
  actions: RuleAction[];
}

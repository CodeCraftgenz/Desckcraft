import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import type {
  Rule,
  RuleWithDetails,
  RuleCondition,
  RuleAction,
  ConditionField,
  ConditionOperator,
  ActionType,
} from '@/types/rules';

interface RuleState {
  rules: Rule[];
  selectedRule: RuleWithDetails | null;
  isLoading: boolean;
  error: string | null;

  fetchRules: () => Promise<void>;
  fetchRuleDetails: (id: string) => Promise<void>;
  createRule: (name: string, description: string | null) => Promise<Rule>;
  updateRule: (id: string, data: Partial<Pick<Rule, 'name' | 'description' | 'is_enabled' | 'priority' | 'sort_order'>>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  addCondition: (
    ruleId: string,
    field: ConditionField,
    operator: ConditionOperator,
    value: string,
    logicGate: 'AND' | 'OR',
  ) => Promise<void>;
  deleteCondition: (id: string) => Promise<void>;
  addAction: (
    ruleId: string,
    actionType: ActionType,
    destination: string | null,
    renamePattern: string | null,
    tagName: string | null,
  ) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useRuleStore = create<RuleState>()((set, get) => ({
  rules: [],
  selectedRule: null,
  isLoading: false,
  error: null,

  fetchRules: async () => {
    set({ isLoading: true, error: null });
    try {
      const rules = await tauriInvoke<Rule[]>('list_rules');
      set({ rules, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  fetchRuleDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const [rule, conditions, actions] = await Promise.all([
        tauriInvoke<Rule>('get_rule', { id }),
        tauriInvoke<RuleCondition[]>('get_rule_conditions', { ruleId: id }),
        tauriInvoke<RuleAction[]>('get_rule_actions', { ruleId: id }),
      ]);
      set({
        selectedRule: { ...rule, conditions, actions },
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  createRule: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      const rule = await tauriInvoke<Rule>('create_rule', { name, description });
      set((state) => ({
        rules: [...state.rules, rule],
        isLoading: false,
      }));
      return rule;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateRule: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tauriInvoke<Rule>('update_rule', { id, ...data });
      set((state) => ({
        rules: state.rules.map((r) => (r.id === id ? updated : r)),
        selectedRule:
          state.selectedRule?.id === id
            ? { ...state.selectedRule, ...updated }
            : state.selectedRule,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  deleteRule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tauriInvoke('delete_rule', { id });
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== id),
        selectedRule: state.selectedRule?.id === id ? null : state.selectedRule,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  addCondition: async (ruleId, field, operator, value, logicGate) => {
    set({ error: null });
    try {
      const condition = await tauriInvoke<RuleCondition>('add_rule_condition', {
        ruleId,
        field,
        operator,
        value,
        logicGate,
      });
      const { selectedRule } = get();
      if (selectedRule && selectedRule.id === ruleId) {
        set({
          selectedRule: {
            ...selectedRule,
            conditions: [...selectedRule.conditions, condition],
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  deleteCondition: async (id) => {
    set({ error: null });
    try {
      await tauriInvoke('delete_rule_condition', { id });
      const { selectedRule } = get();
      if (selectedRule) {
        set({
          selectedRule: {
            ...selectedRule,
            conditions: selectedRule.conditions.filter((c) => c.id !== id),
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  addAction: async (ruleId, actionType, destination, renamePattern, tagName) => {
    set({ error: null });
    try {
      const action = await tauriInvoke<RuleAction>('add_rule_action', {
        ruleId,
        actionType,
        destination,
        renamePattern,
        tagName,
      });
      const { selectedRule } = get();
      if (selectedRule && selectedRule.id === ruleId) {
        set({
          selectedRule: {
            ...selectedRule,
            actions: [...selectedRule.actions, action],
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  deleteAction: async (id) => {
    set({ error: null });
    try {
      await tauriInvoke('delete_rule_action', { id });
      const { selectedRule } = get();
      if (selectedRule) {
        set({
          selectedRule: {
            ...selectedRule,
            actions: selectedRule.actions.filter((a) => a.id !== id),
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  clearSelected: () => set({ selectedRule: null }),
}));

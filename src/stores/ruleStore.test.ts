import { describe, it, expect, beforeEach } from 'vitest';
import { useRuleStore } from './ruleStore';
import { setMockInvokeHandler, clearMockInvokeHandlers } from '@/test/setup';
import { createMockRule, createMockRules } from '@/test/fixtures';

describe('ruleStore', () => {
  beforeEach(() => {
    clearMockInvokeHandlers();
    useRuleStore.setState({
      rules: [],
      selectedRule: null,
      isLoading: false,
      error: null,
    });
  });

  describe('fetchRules', () => {
    it('should load rules from backend', async () => {
      const mockRules = createMockRules(3);
      setMockInvokeHandler('list_rules', () => mockRules);

      await useRuleStore.getState().fetchRules();

      const state = useRuleStore.getState();
      expect(state.rules).toHaveLength(3);
      expect(state.rules[0].name).toBe('Regra 1');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on failure', async () => {
      setMockInvokeHandler('list_rules', () => {
        throw new Error('DB error');
      });

      await useRuleStore.getState().fetchRules();

      const state = useRuleStore.getState();
      expect(state.rules).toHaveLength(0);
      expect(state.error).toBe('DB error');
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading while fetching', async () => {
      let resolve: (v: unknown) => void;
      const promise = new Promise((r) => { resolve = r; });
      setMockInvokeHandler('list_rules', () => promise);

      const fetchPromise = useRuleStore.getState().fetchRules();
      expect(useRuleStore.getState().isLoading).toBe(true);

      resolve!(createMockRules(1));
      await fetchPromise;
      expect(useRuleStore.getState().isLoading).toBe(false);
    });
  });

  describe('toggleRule', () => {
    it('should toggle a rule enabled state', async () => {
      const rule = createMockRule({ id: 'r1', is_enabled: true });
      const toggled = { ...rule, is_enabled: false };
      useRuleStore.setState({ rules: [rule] });

      setMockInvokeHandler('toggle_rule', (args: unknown) => {
        const a = args as { id: string; isEnabled: boolean };
        expect(a.id).toBe('r1');
        expect(a.isEnabled).toBe(false);
        return toggled;
      });

      await useRuleStore.getState().toggleRule('r1', false);

      const state = useRuleStore.getState();
      expect(state.rules[0].is_enabled).toBe(false);
    });

    it('should throw on toggle error', async () => {
      const rule = createMockRule({ id: 'r1' });
      useRuleStore.setState({ rules: [rule] });

      setMockInvokeHandler('toggle_rule', () => {
        throw new Error('Toggle failed');
      });

      await expect(
        useRuleStore.getState().toggleRule('r1', false),
      ).rejects.toThrow('Toggle failed');

      expect(useRuleStore.getState().error).toBe('Toggle failed');
    });

    it('should update selectedRule if it matches toggled rule', async () => {
      const rule = createMockRule({ id: 'r1', is_enabled: true });
      const toggled = { ...rule, is_enabled: false };
      useRuleStore.setState({
        rules: [rule],
        selectedRule: { ...rule, conditions: [], actions: [] },
      });

      setMockInvokeHandler('toggle_rule', () => toggled);

      await useRuleStore.getState().toggleRule('r1', false);

      expect(useRuleStore.getState().selectedRule?.is_enabled).toBe(false);
    });
  });

  describe('createRule', () => {
    it('should create a rule and add to list', async () => {
      const newRule = createMockRule({ id: 'new-1', name: 'Nova Regra' });
      setMockInvokeHandler('create_rule', () => newRule);

      const result = await useRuleStore.getState().createRule('Nova Regra', null);

      expect(result.id).toBe('new-1');
      expect(useRuleStore.getState().rules).toHaveLength(1);
      expect(useRuleStore.getState().rules[0].name).toBe('Nova Regra');
    });

    it('should throw on create error', async () => {
      setMockInvokeHandler('create_rule', () => {
        throw new Error('Create failed');
      });

      await expect(
        useRuleStore.getState().createRule('Test', null),
      ).rejects.toThrow('Create failed');
    });
  });

  describe('deleteRule', () => {
    it('should remove rule from list', async () => {
      const rules = createMockRules(3);
      useRuleStore.setState({ rules });
      setMockInvokeHandler('delete_rule', () => undefined);

      await useRuleStore.getState().deleteRule('rule-2');

      const state = useRuleStore.getState();
      expect(state.rules).toHaveLength(2);
      expect(state.rules.find((r) => r.id === 'rule-2')).toBeUndefined();
    });

    it('should clear selectedRule if deleted', async () => {
      const rule = createMockRule({ id: 'r1' });
      useRuleStore.setState({
        rules: [rule],
        selectedRule: { ...rule, conditions: [], actions: [] },
      });
      setMockInvokeHandler('delete_rule', () => undefined);

      await useRuleStore.getState().deleteRule('r1');

      expect(useRuleStore.getState().selectedRule).toBeNull();
    });
  });

  describe('updateRule', () => {
    it('should update rule in list', async () => {
      const rule = createMockRule({ id: 'r1', name: 'Old Name' });
      const updated = { ...rule, name: 'New Name' };
      useRuleStore.setState({ rules: [rule] });

      setMockInvokeHandler('update_rule', () => updated);

      await useRuleStore.getState().updateRule('r1', { name: 'New Name' });

      expect(useRuleStore.getState().rules[0].name).toBe('New Name');
    });
  });

  describe('fetchRuleDetails', () => {
    it('should load rule with conditions and actions', async () => {
      const rule = createMockRule({ id: 'r1' });
      const conditions = [
        { id: 'c1', rule_id: 'r1', field: 'extension', operator: 'equals', value: '.pdf', logic_gate: 'AND', sort_order: 0, created_at: '' },
      ];
      const actions = [
        { id: 'a1', rule_id: 'r1', action_type: 'move_to_folder', destination: '/docs', rename_pattern: '', tag_name: '', sort_order: 0, created_at: '' },
      ];

      setMockInvokeHandler('get_rule', () => rule);
      setMockInvokeHandler('get_rule_conditions', () => conditions);
      setMockInvokeHandler('get_rule_actions', () => actions);

      await useRuleStore.getState().fetchRuleDetails('r1');

      const selected = useRuleStore.getState().selectedRule;
      expect(selected).not.toBeNull();
      expect(selected?.id).toBe('r1');
      expect(selected?.conditions).toHaveLength(1);
      expect(selected?.actions).toHaveLength(1);
    });
  });

  describe('clearSelected', () => {
    it('should clear selectedRule', () => {
      const rule = createMockRule({ id: 'r1' });
      useRuleStore.setState({
        selectedRule: { ...rule, conditions: [], actions: [] },
      });

      useRuleStore.getState().clearSelected();

      expect(useRuleStore.getState().selectedRule).toBeNull();
    });
  });
});

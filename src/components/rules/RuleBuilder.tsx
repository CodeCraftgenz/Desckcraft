import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Plus,
  Filter,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore, useRuleStore } from '@/stores';
import { useToast } from '@/components/ui/Toast';
import { VIEWS } from '@/lib/constants';
import { ConditionRow, type ConditionRowData } from './ConditionRow';
import { ActionRow, type ActionRowData } from './ActionRow';
import { RulePreview } from './RulePreview';
import type { ConditionField, ConditionOperator, ActionType } from '@/types/rules';

/* ---------- Helpers ---------- */

let localIdCounter = 0;
function localId(): string {
  return `local-${++localIdCounter}-${Date.now()}`;
}

function createEmptyCondition(): ConditionRowData {
  return {
    id: localId(),
    field: 'extension' as ConditionField,
    operator: 'equals' as ConditionOperator,
    value: '',
    logic_gate: 'AND',
  };
}

function createEmptyAction(): ActionRowData {
  return {
    id: localId(),
    action_type: 'move_to_folder' as ActionType,
    destination: '',
    rename_pattern: '',
    tag_name: '',
  };
}

/* ---------- Types ---------- */

interface RuleBuilderProps {
  ruleId?: string | null;
}

/* ---------- Component ---------- */

export function RuleBuilder({ ruleId }: RuleBuilderProps) {
  const setView = useAppStore((s) => s.setView);
  const toast = useToast();

  const {
    selectedRule,
    isLoading,
    fetchRuleDetails,
    createRule,
    updateRule,
    addCondition,
    deleteCondition,
    addAction,
    deleteAction,
    clearSelected,
  } = useRuleStore();

  const isEditing = Boolean(ruleId);

  /* ---------- Local State ---------- */

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<ConditionRowData[]>([createEmptyCondition()]);
  const [actions, setActions] = useState<ActionRowData[]>([createEmptyAction()]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  /* ---------- Load existing rule ---------- */

  useEffect(() => {
    if (ruleId) {
      fetchRuleDetails(ruleId);
    }
    return () => {
      clearSelected();
    };
  }, [ruleId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedRule && ruleId) {
      setName(selectedRule.name);
      setDescription(selectedRule.description || '');

      if (selectedRule.conditions.length > 0) {
        setConditions(
          selectedRule.conditions.map((c) => ({
            id: c.id,
            field: c.field,
            operator: c.operator,
            value: c.value,
            logic_gate: c.logic_gate,
          })),
        );
      }

      if (selectedRule.actions.length > 0) {
        setActions(
          selectedRule.actions.map((a) => ({
            id: a.id,
            action_type: a.action_type,
            destination: a.destination || '',
            rename_pattern: a.rename_pattern || '',
            tag_name: a.tag_name || '',
          })),
        );
      }
    }
  }, [selectedRule, ruleId]);

  /* ---------- Condition Handlers ---------- */

  const handleConditionChange = useCallback(
    (id: string, updates: Partial<ConditionRowData>) => {
      setConditions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [],
  );

  const handleConditionDelete = useCallback(
    (id: string) => {
      setConditions((prev) => {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((c) => c.id !== id);
      });
    },
    [],
  );

  const handleToggleLogicGate = useCallback((id: string) => {
    setConditions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, logic_gate: c.logic_gate === 'AND' ? 'OR' : 'AND' }
          : c,
      ),
    );
  }, []);

  const addConditionRow = useCallback(() => {
    setConditions((prev) => [...prev, createEmptyCondition()]);
  }, []);

  /* ---------- Action Handlers ---------- */

  const handleActionChange = useCallback(
    (id: string, updates: Partial<ActionRowData>) => {
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  const handleActionDelete = useCallback(
    (id: string) => {
      setActions((prev) => {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((a) => a.id !== id);
      });
    },
    [],
  );

  const addActionRow = useCallback(() => {
    setActions((prev) => [...prev, createEmptyAction()]);
  }, []);

  /* ---------- Validation ---------- */

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'O nome da regra e obrigatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Save ---------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);

    try {
      let targetRuleId = ruleId;

      if (isEditing && targetRuleId) {
        // Update existing rule
        await updateRule(targetRuleId, {
          name: name.trim(),
          description: description.trim() || null,
        });

        // Delete existing conditions and actions, then re-create
        if (selectedRule) {
          for (const c of selectedRule.conditions) {
            await deleteCondition(c.id);
          }
          for (const a of selectedRule.actions) {
            await deleteAction(a.id);
          }
        }
      } else {
        // Create new rule
        const newRule = await createRule(
          name.trim(),
          description.trim() || null,
        );
        targetRuleId = newRule.id;
      }

      // Save conditions
      for (const c of conditions) {
        if (c.value.trim()) {
          await addCondition(
            targetRuleId!,
            c.field,
            c.operator,
            c.value.trim(),
            c.logic_gate,
          );
        }
      }

      // Save actions
      for (const a of actions) {
        const destination =
          a.action_type === 'move_to_folder' || a.action_type === 'move_to_subfolder'
            ? a.destination || null
            : null;
        const renamePattern =
          a.action_type === 'rename'
            ? a.rename_pattern || null
            : a.action_type === 'move_to_subfolder'
              ? a.rename_pattern || null
              : null;
        const tagName = a.action_type === 'add_tag' ? a.tag_name || null : null;

        await addAction(
          targetRuleId!,
          a.action_type,
          destination,
          renamePattern,
          tagName,
        );
      }

      toast.success(
        isEditing ? 'Regra atualizada com sucesso!' : 'Regra criada com sucesso!',
      );
      setView(VIEWS.RULES);
    } catch {
      toast.error('Erro ao salvar a regra. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- Cancel ---------- */

  const handleCancel = () => {
    setView(VIEWS.RULES);
  };

  /* ---------- Render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="
              p-2 rounded-lg
              text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors
            "
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Editar Regra' : 'Nova Regra'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing
                ? 'Modifique as condicoes e acoes desta regra'
                : 'Configure as condicoes e acoes para organizar seus arquivos'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSave}
            loading={isSaving}
            disabled={isLoading}
          >
            Salvar
          </Button>
        </div>
      </div>

      {/* Rule name & description */}
      <Card padding="md">
        <div className="space-y-4">
          <Input
            label="Nome da regra"
            placeholder="Ex: Organizar PDFs do Downloads"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="rule-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Descricao (opcional)
            </label>
            <textarea
              id="rule-description"
              rows={2}
              placeholder="Descreva o que esta regra faz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="
                input-field resize-none
                w-full
              "
            />
          </div>
        </div>
      </Card>

      {/* IF Section (Conditions) */}
      <Card padding="none" className="overflow-visible">
        <div className="border-l-4 border-indigo-500 dark:border-indigo-400">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <Filter size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    SE (Condicoes)
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Defina quando esta regra deve ser aplicada
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={addConditionRow}
              >
                Adicionar condicao
              </Button>
            </div>
          </div>

          {/* Condition rows */}
          <div className="px-5 py-4 pl-8 space-y-1">
            <AnimatePresence mode="popLayout">
              {conditions.map((condition, index) => (
                <ConditionRow
                  key={condition.id}
                  condition={condition}
                  index={index}
                  isFirst={index === 0}
                  onChange={handleConditionChange}
                  onDelete={handleConditionDelete}
                  onToggleLogicGate={handleToggleLogicGate}
                />
              ))}
            </AnimatePresence>

            {conditions.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                Nenhuma condicao adicionada. Clique em "Adicionar condicao" acima.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* THEN Section (Actions) */}
      <Card padding="none" className="overflow-visible">
        <div className="border-l-4 border-emerald-500 dark:border-emerald-400">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <Zap size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    ENTAO (Acoes)
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Defina o que fazer quando as condicoes forem atendidas
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={addActionRow}
              >
                Adicionar acao
              </Button>
            </div>
          </div>

          {/* Action rows */}
          <div className="px-5 py-4 pl-8 space-y-3">
            <AnimatePresence mode="popLayout">
              {actions.map((action, index) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  index={index}
                  onChange={handleActionChange}
                  onDelete={handleActionDelete}
                />
              ))}
            </AnimatePresence>

            {actions.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                Nenhuma acao adicionada. Clique em "Adicionar acao" acima.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <RulePreview conditions={conditions} actions={actions} />
      </motion.div>
    </div>
  );
}

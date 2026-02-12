import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FileText,
  GripVertical,
  Pencil,
  Trash2,
  Filter,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore, useRuleStore } from '@/stores';
import { useToast } from '@/components/ui/Toast';
import { VIEWS } from '@/lib/constants';
import type { Rule } from '@/types/rules';

/* ---------- Filter Options ---------- */

type FilterStatus = 'all' | 'enabled' | 'disabled';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'enabled', label: 'Ativas' },
  { value: 'disabled', label: 'Inativas' },
];

/* ---------- Skeleton ---------- */

function RuleCardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-8 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-72 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

/* ---------- Rule Card ---------- */

interface RuleCardProps {
  rule: Rule;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (rule: Rule) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

function RuleCard({ rule, index, onEdit, onDelete, onToggle }: RuleCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Card
        padding="none"
        className={`
          group cursor-pointer
          hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800
          transition-all duration-200
          ${!rule.is_enabled ? 'opacity-60' : ''}
        `}
      >
        <div className="flex items-center gap-3 p-4">
          {/* Drag handle */}
          <div
            className="
              shrink-0 cursor-grab
              text-gray-300 dark:text-gray-600
              hover:text-gray-400 dark:hover:text-gray-500
              transition-colors
            "
            title="Arrastar para reordenar"
          >
            <GripVertical size={18} />
          </div>

          {/* Rule info - click to edit */}
          <div
            className="flex-1 min-w-0"
            onClick={() => onEdit(rule.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEdit(rule.id);
              }
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {rule.name}
              </h3>
              {rule.priority > 0 && (
                <Badge
                  variant={rule.priority <= 3 ? 'info' : rule.priority <= 7 ? 'warning' : 'danger'}
                  size="sm"
                >
                  P{rule.priority}
                </Badge>
              )}
            </div>
            {rule.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {rule.description}
              </p>
            )}
          </div>

          {/* Summary chips - these are visual placeholders; will be filled when details are loaded */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Badge variant="info" size="sm">
              <Filter size={10} className="mr-1" />
              Condicoes
            </Badge>
            <Badge variant="success" size="sm">
              <Zap size={10} className="mr-1" />
              Acoes
            </Badge>
          </div>

          {/* Toggle */}
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Switch
              checked={rule.is_enabled}
              onChange={(checked) => onToggle(rule.id, checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(rule.id);
              }}
              className="
                p-1.5 rounded-lg
                text-gray-400 hover:text-brand-600 dark:hover:text-brand-400
                hover:bg-brand-50 dark:hover:bg-brand-900/20
                transition-colors
              "
              title="Editar regra"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(rule);
              }}
              className="
                p-1.5 rounded-lg
                text-gray-400 hover:text-red-500
                hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors
              "
              title="Excluir regra"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ---------- Main Component ---------- */

export function RuleListView() {
  const setView = useAppStore((s) => s.setView);
  const toast = useToast();

  const {
    rules,
    isLoading,
    fetchRules,
    updateRule,
    deleteRule,
  } = useRuleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------- Fetch on mount ---------- */

  useEffect(() => {
    fetchRules();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Filtered rules ---------- */

  const filteredRules = useMemo(() => {
    let result = [...rules];

    // Filter by status
    if (filterStatus === 'enabled') {
      result = result.filter((r) => r.is_enabled);
    } else if (filterStatus === 'disabled') {
      result = result.filter((r) => !r.is_enabled);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query)),
      );
    }

    // Sort by sort_order then priority
    result.sort((a, b) => a.sort_order - b.sort_order || b.priority - a.priority);

    return result;
  }, [rules, searchQuery, filterStatus]);

  /* ---------- Handlers ---------- */

  const handleCreateRule = useCallback(() => {
    sessionStorage.removeItem('editing_rule_id');
    setView(VIEWS.RULE_EDITOR);
  }, [setView]);

  const handleEditRule = useCallback(
    (id: string) => {
      // Store the rule id in the app store for the editor to pick up
      // We use a convention: set view to RULE_EDITOR, the id is stored via the ruleStore
      useRuleStore.setState({ selectedRule: null });
      // We'll use a simple approach: store the editing rule id in sessionStorage
      sessionStorage.setItem('editing_rule_id', id);
      setView(VIEWS.RULE_EDITOR);
    },
    [setView],
  );

  const handleToggle = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        await updateRule(id, { is_enabled: enabled });
        toast.success(enabled ? 'Regra ativada' : 'Regra desativada');
      } catch {
        toast.error('Erro ao alterar o estado da regra');
      }
    },
    [updateRule, toast],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteRule(deleteTarget.id);
      toast.success('Regra excluida com sucesso');
      setDeleteTarget(null);
    } catch {
      toast.error('Erro ao excluir a regra');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteRule, toast]);

  /* ---------- Render ---------- */

  const showEmpty = !isLoading && filteredRules.length === 0;
  const hasRulesButFiltered = !isLoading && rules.length > 0 && filteredRules.length === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Regras
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {rules.length > 0
              ? `${rules.length} regra${rules.length !== 1 ? 's' : ''} configurada${rules.length !== 1 ? 's' : ''}`
              : 'Gerencie suas regras de organizacao de arquivos'}
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleCreateRule}>
          Nova Regra
        </Button>
      </div>

      {/* Search & Filter bar */}
      {rules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card padding="sm">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Buscar regras..."
                  icon={Search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Filter buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <SlidersHorizontal
                  size={14}
                  className="text-gray-400 dark:text-gray-500 mr-1"
                />
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilterStatus(opt.value)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                      ${
                        filterStatus === opt.value
                          ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          <RuleCardSkeleton />
          <RuleCardSkeleton />
          <RuleCardSkeleton />
        </div>
      )}

      {/* Rule list */}
      {!isLoading && filteredRules.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredRules.map((rule, index) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                index={index}
                onEdit={handleEditRule}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state - no rules at all */}
      {showEmpty && !hasRulesButFiltered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState
            icon={FileText}
            title="Nenhuma regra criada"
            description="Crie sua primeira regra para organizar arquivos automaticamente."
            action={{ label: 'Criar regra', onClick: handleCreateRule }}
          />
        </motion.div>
      )}

      {/* Empty state - filter yielded no results */}
      {hasRulesButFiltered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyState
            icon={Search}
            title="Nenhuma regra encontrada"
            description="Tente ajustar os filtros ou o termo de busca."
            action={{
              label: 'Limpar filtros',
              onClick: () => {
                setSearchQuery('');
                setFilterStatus('all');
              },
            }}
          />
        </motion.div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Excluir regra"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tem certeza que deseja excluir a regra{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              "{deleteTarget?.name}"
            </span>
            ? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

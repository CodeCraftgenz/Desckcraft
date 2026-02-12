import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Clock,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Switch } from '@/components/ui/Switch';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useProfileStore } from '@/stores';
import { tauriInvoke } from '@/lib/tauri';
import type { Schedule } from '@/types/schedules';

/* ---------- Constants ---------- */

type Frequency = 'hourly' | 'daily' | 'weekly';

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'hourly', label: 'A cada hora' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
];

const DAY_OF_WEEK_OPTIONS = [
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
];

const FREQUENCY_BADGE_MAP: Record<string, { label: string; variant: 'info' | 'success' | 'warning' }> = {
  hourly: { label: 'A cada hora', variant: 'info' },
  daily: { label: 'Diário', variant: 'success' },
  weekly: { label: 'Semanal', variant: 'warning' },
};

/* ---------- Helpers ---------- */

function parseCronToFrequency(cron: string): { frequency: Frequency; time: string; dayOfWeek: string } {
  const parts = cron.split(' ');
  // cron format: minute hour dayOfMonth month dayOfWeek
  if (parts.length < 5) return { frequency: 'daily', time: '08:00', dayOfWeek: '1' };

  const [minute, hour, , , dow] = parts;

  if (hour === '*') {
    return { frequency: 'hourly', time: '00:00', dayOfWeek: '1' };
  }

  if (dow !== '*' && dow !== '?') {
    return {
      frequency: 'weekly',
      time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
      dayOfWeek: dow,
    };
  }

  return {
    frequency: 'daily',
    time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
    dayOfWeek: '1',
  };
}

function buildCronExpr(frequency: Frequency, time: string, dayOfWeek: string): string {
  const [hours, minutes] = time.split(':').map((v) => parseInt(v, 10));
  const h = isNaN(hours) ? 8 : hours;
  const m = isNaN(minutes) ? 0 : minutes;

  switch (frequency) {
    case 'hourly':
      return `0 * * * *`;
    case 'daily':
      return `${m} ${h} * * *`;
    case 'weekly':
      return `${m} ${h} * * ${dayOfWeek}`;
    default:
      return `${m} ${h} * * *`;
  }
}

function getFrequencyKey(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length < 5) return 'daily';
  const [, hour, , , dow] = parts;
  if (hour === '*') return 'hourly';
  if (dow !== '*' && dow !== '?') return 'weekly';
  return 'daily';
}

function getFrequencyDescription(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length < 5) return cron;

  const [minute, hour, , , dow] = parts;

  if (hour === '*') {
    return 'A cada hora';
  }

  const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  if (dow !== '*' && dow !== '?') {
    const dayLabel = DAY_OF_WEEK_OPTIONS.find((d) => d.value === dow)?.label || dow;
    return `Semanal - ${dayLabel} às ${timeStr}`;
  }

  return `Diário às ${timeStr}`;
}

function formatNextRun(dateStr: string | null): string {
  if (!dateStr) return 'Não agendado';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/* ---------- Folder dialog helper ---------- */

async function openNativeFolderDialog(): Promise<string | null> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      title: 'Selecionar pasta para agendamento',
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

/* ---------- Schedule Form Dialog ---------- */

interface ScheduleFormData {
  profileId: string;
  folderPath: string;
  frequency: Frequency;
  time: string;
  dayOfWeek: string;
  isEnabled: boolean;
}

function ScheduleFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => void;
  initialData?: ScheduleFormData;
  isEditing: boolean;
}) {
  const profiles = useProfileStore((s) => s.profiles);
  const toast = useToast();

  const [formData, setFormData] = useState<ScheduleFormData>(
    initialData || {
      profileId: '',
      folderPath: '',
      frequency: 'daily',
      time: '08:00',
      dayOfWeek: '1',
      isEnabled: true,
    },
  );

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      setFormData({
        profileId: profiles[0]?.id || '',
        folderPath: '',
        frequency: 'daily',
        time: '08:00',
        dayOfWeek: '1',
        isEnabled: true,
      });
    }
  }, [isOpen, initialData, profiles]);

  const profileOptions = useMemo(
    () => [
      { value: '', label: 'Selecione um perfil...' },
      ...profiles.map((p) => ({
        value: p.id,
        label: `${p.icon} ${p.name}`,
      })),
    ],
    [profiles],
  );

  const handleSelectFolder = useCallback(async () => {
    try {
      const selected = await openNativeFolderDialog();
      if (selected) {
        setFormData((prev) => ({ ...prev, folderPath: selected }));
      }
    } catch {
      toast.info('Use o campo de texto para digitar o caminho da pasta.');
    }
  }, [toast]);

  const handleSubmit = useCallback(() => {
    if (!formData.profileId) {
      toast.error('Selecione um perfil.');
      return;
    }
    if (!formData.folderPath.trim()) {
      toast.error('Informe o caminho da pasta.');
      return;
    }
    onSubmit(formData);
  }, [formData, onSubmit, toast]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
      size="md"
    >
      <div className="space-y-5">
        {/* Profile selector */}
        <Select
          label="Perfil de regras"
          options={profileOptions}
          value={formData.profileId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, profileId: e.target.value }))
          }
        />

        {/* Folder path */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Pasta para organizar
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                icon={FolderOpen}
                placeholder="C:\Users\...\Downloads"
                value={formData.folderPath}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, folderPath: e.target.value }))
                }
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={FolderOpen}
              onClick={handleSelectFolder}
            >
              Selecionar
            </Button>
          </div>
        </div>

        {/* Frequency selector */}
        <Select
          label="Frequência"
          options={FREQUENCY_OPTIONS}
          value={formData.frequency}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              frequency: e.target.value as Frequency,
            }))
          }
        />

        {/* Time input for daily/weekly */}
        {(formData.frequency === 'daily' || formData.frequency === 'weekly') && (
          <Input
            label="Horário"
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
          />
        )}

        {/* Day of week for weekly */}
        {formData.frequency === 'weekly' && (
          <Select
            label="Dia da semana"
            options={DAY_OF_WEEK_OPTIONS}
            value={formData.dayOfWeek}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dayOfWeek: e.target.value }))
            }
          />
        )}

        {/* Enable/disable toggle */}
        <Switch
          checked={formData.isEnabled}
          onChange={(checked) =>
            setFormData((prev) => ({ ...prev, isEnabled: checked }))
          }
          label="Ativo"
          description="O agendamento será executado automaticamente quando ativo."
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.profileId || !formData.folderPath.trim()}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Agendamento'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ---------- Schedule Item Card ---------- */

function ScheduleCard({
  schedule,
  profileName,
  onEdit,
  onDelete,
  onToggle,
}: {
  schedule: Schedule;
  profileName: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const freqKey = getFrequencyKey(schedule.cron_expr);
  const badgeConfig = FREQUENCY_BADGE_MAP[freqKey] || FREQUENCY_BADGE_MAP.daily;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`
        px-5 py-4 rounded-xl border transition-colors
        ${
          schedule.is_enabled
            ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800/50 opacity-60'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Left: icon */}
        <div
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg shrink-0
            ${
              schedule.is_enabled
                ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            }
          `}
        >
          <CalendarClock size={20} />
        </div>

        {/* Center: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={badgeConfig.variant} size="sm">
              {badgeConfig.label}
            </Badge>
            {!schedule.is_enabled && (
              <Badge variant="default" size="sm">
                Desativado
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {getFrequencyDescription(schedule.cron_expr)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Perfil: {profileName} | Pasta: {schedule.folder_id}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock size={12} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Próxima execução: {formatNextRun(schedule.next_run_at)}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={schedule.is_enabled}
            onChange={onToggle}
          />
          <button
            type="button"
            onClick={onEdit}
            className="
              p-1.5 rounded-lg
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors
            "
            aria-label="Editar agendamento"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="
              p-1.5 rounded-lg
              text-gray-400 hover:text-red-500 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10
              transition-colors
            "
            aria-label="Excluir agendamento"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Main SchedulingView ---------- */

export function SchedulingView() {
  const toast = useToast();
  const { schedules, isLoading, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } =
    useScheduleStore();
  const profiles = useProfileStore((s) => s.profiles);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Build a map from profile ID to profile name
  const profileNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    profiles.forEach((p) => {
      map[p.id] = `${p.icon} ${p.name}`;
    });
    return map;
  }, [profiles]);

  /* --- Handlers --- */

  const handleCreate = useCallback(() => {
    setEditingSchedule(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((schedule: Schedule) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteSchedule(id);
        toast.success('Agendamento excluído com sucesso.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erro ao excluir: ${msg}`);
      }
    },
    [deleteSchedule, toast],
  );

  const handleToggle = useCallback(
    async (schedule: Schedule, enabled: boolean) => {
      try {
        await updateSchedule(schedule.id, schedule.cron_expr, enabled);
        toast.success(enabled ? 'Agendamento ativado.' : 'Agendamento desativado.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erro ao atualizar: ${msg}`);
      }
    },
    [updateSchedule, toast],
  );

  const handleFormSubmit = useCallback(
    async (data: ScheduleFormData) => {
      const cronExpr = buildCronExpr(data.frequency, data.time, data.dayOfWeek);

      try {
        if (editingSchedule) {
          await updateSchedule(editingSchedule.id, cronExpr, data.isEnabled);
          toast.success('Agendamento atualizado com sucesso.');
        } else {
          await createSchedule(data.profileId, data.folderPath, cronExpr);
          toast.success('Agendamento criado com sucesso.');
        }
        setDialogOpen(false);
        setEditingSchedule(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erro: ${msg}`);
      }
    },
    [editingSchedule, createSchedule, updateSchedule, toast],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingSchedule(null);
  }, []);

  // Build initial form data for editing
  const editFormData: ScheduleFormData | undefined = editingSchedule
    ? (() => {
        const parsed = parseCronToFrequency(editingSchedule.cron_expr);
        return {
          profileId: editingSchedule.profile_id,
          folderPath: editingSchedule.folder_id,
          frequency: parsed.frequency,
          time: parsed.time,
          dayOfWeek: parsed.dayOfWeek,
          isEnabled: editingSchedule.is_enabled,
        };
      })()
    : undefined;

  /* ========== RENDER ========== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex items-center justify-center
              w-10 h-10 rounded-xl
              bg-gradient-to-br from-violet-500 to-violet-700
              dark:from-violet-400 dark:to-violet-600
              shadow-md shadow-violet-500/20 dark:shadow-violet-500/10
            "
          >
            <CalendarClock size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Agendamento
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure a organização automática de arquivos
            </p>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleCreate}>
          Novo Agendamento
        </Button>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card padding="md">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 shrink-0">
              <Info size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Como funciona o agendamento?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Configure horários e frequências para que o DeskCraft organize seus arquivos
                automaticamente. Escolha um perfil de regras, selecione a pasta e defina quando
                a organização deve ocorrer.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Loading */}
      {isLoading && schedules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <Loader2 size={24} className="animate-spin text-gray-400 dark:text-gray-500" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
            Carregando agendamentos...
          </span>
        </motion.div>
      )}

      {/* Schedule List */}
      {!isLoading && schedules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                profileName={profileNameMap[schedule.profile_id] || 'Perfil desconhecido'}
                onEdit={() => handleEdit(schedule)}
                onDelete={() => handleDelete(schedule.id)}
                onToggle={(enabled) => handleToggle(schedule, enabled)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && schedules.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <EmptyState
            icon={CalendarClock}
            title="Nenhum agendamento"
            description="Crie um agendamento para organizar seus arquivos automaticamente em horários programados."
            action={{
              label: 'Criar Agendamento',
              onClick: handleCreate,
            }}
          />
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <ScheduleFormDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        initialData={editFormData}
        isEditing={!!editingSchedule}
      />
    </div>
  );
}

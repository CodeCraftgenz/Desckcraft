import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import type { Schedule } from '@/types/schedules';

interface ScheduleState {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;

  fetchSchedules: () => Promise<void>;
  createSchedule: (
    profileId: string,
    folderId: string,
    cronExpr: string,
  ) => Promise<Schedule>;
  updateSchedule: (
    id: string,
    cronExpr: string,
    isEnabled: boolean,
  ) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>()((set) => ({
  schedules: [],
  isLoading: false,
  error: null,

  fetchSchedules: async () => {
    set({ isLoading: true, error: null });
    try {
      const schedules = await tauriInvoke<Schedule[]>('list_schedules');
      set({ schedules, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  createSchedule: async (profileId, folderId, cronExpr) => {
    set({ isLoading: true, error: null });
    try {
      const schedule = await tauriInvoke<Schedule>('create_schedule', {
        profileId,
        folderId,
        cronExpr,
      });
      set((state) => ({
        schedules: [...state.schedules, schedule],
        isLoading: false,
      }));
      return schedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateSchedule: async (id, cronExpr, isEnabled) => {
    set({ isLoading: true, error: null });
    try {
      await tauriInvoke('update_schedule', { id, cronExpr, isEnabled });
      set((state) => ({
        schedules: state.schedules.map((s) =>
          s.id === id ? { ...s, cron_expr: cronExpr, is_enabled: isEnabled } : s,
        ),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  deleteSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tauriInvoke('delete_schedule', { id });
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },
}));

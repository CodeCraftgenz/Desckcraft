import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import type { Run, RunItem } from '@/types/runs';

interface HistoryState {
  runs: Run[];
  selectedRun: Run | null;
  runItems: RunItem[];
  isLoading: boolean;
  error: string | null;

  fetchRuns: (limit?: number, offset?: number) => Promise<void>;
  fetchRunDetails: (id: string) => Promise<void>;
  rollbackRun: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  runs: [],
  selectedRun: null,
  runItems: [],
  isLoading: false,
  error: null,

  fetchRuns: async (limit = 50, offset = 0) => {
    set({ isLoading: true, error: null });
    try {
      const runs = await tauriInvoke<Run[]>('list_runs', { limit, offset });
      set({ runs, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  fetchRunDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const [run, runItems] = await Promise.all([
        tauriInvoke<Run>('get_run', { id }),
        tauriInvoke<RunItem[]>('list_run_items', { runId: id }),
      ]);
      set({ selectedRun: run, runItems, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  rollbackRun: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tauriInvoke('rollback_run', { runId: id });
      // Re-fetch the run to get the updated status
      const run = await tauriInvoke<Run>('get_run', { id });
      set((state) => ({
        runs: state.runs.map((r) => (r.id === id ? run : r)),
        selectedRun: state.selectedRun?.id === id ? run : state.selectedRun,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  clearSelected: () => set({ selectedRun: null, runItems: [] }),
}));

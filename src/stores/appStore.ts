import { create } from 'zustand';
import { VIEWS } from '@/lib/constants';

interface AppState {
  currentView: string;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  error: string | null;

  setView: (view: string) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  currentView: VIEWS.DASHBOARD,
  sidebarCollapsed: false,
  isLoading: false,
  error: null,

  setView: (view) => set({ currentView: view, error: null }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));

import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import type { TourState, TourStep } from '@/types/tour';
import tourStepsData from '@/content/tour/steps.json';

interface TourStoreState {
  tourState: TourState | null;
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  totalSteps: number;
  isLoading: boolean;
  error: string | null;

  fetchTourState: () => Promise<void>;
  startTour: () => Promise<void>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  skipTour: () => Promise<void>;
  completeTour: () => Promise<void>;
  resetTour: () => Promise<void>;
  updateTourStep: (step: number) => Promise<void>;
}

const steps = (tourStepsData as TourStep[]).sort((a, b) => a.order - b.order);

export const useTourStore = create<TourStoreState>()((set, get) => ({
  tourState: null,
  isActive: false,
  currentStep: 0,
  steps,
  totalSteps: steps.length,
  isLoading: false,
  error: null,

  fetchTourState: async () => {
    set({ isLoading: true, error: null });
    try {
      const tourState = await tauriInvoke<TourState>('get_tour_state');
      set({
        tourState,
        currentStep: tourState.current_step,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  startTour: async () => {
    set({ isActive: true, currentStep: 0, error: null });
    try {
      await tauriInvoke('update_tour_step', { step: 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  nextStep: async () => {
    const { currentStep, totalSteps } = get();
    if (currentStep >= totalSteps - 1) {
      await get().completeTour();
      return;
    }
    const nextStep = currentStep + 1;
    set({ currentStep: nextStep });
    try {
      await tauriInvoke('update_tour_step', { step: nextStep });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  skipTour: async () => {
    set({ isActive: false, error: null });
    try {
      await tauriInvoke('skip_tour');
      const tourState = get().tourState;
      if (tourState) {
        set({
          tourState: {
            ...tourState,
            skipped_at: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  completeTour: async () => {
    set({ isActive: false, error: null });
    try {
      await tauriInvoke('complete_tour');
      const tourState = get().tourState;
      if (tourState) {
        set({
          tourState: {
            ...tourState,
            completed_at: new Date().toISOString(),
            times_completed: tourState.times_completed + 1,
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  resetTour: async () => {
    set({ isActive: false, currentStep: 0, error: null });
    try {
      await tauriInvoke('reset_tour');
      await get().fetchTourState();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  updateTourStep: async (step: number) => {
    set({ currentStep: step });
    try {
      await tauriInvoke('update_tour_step', { step });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },
}));

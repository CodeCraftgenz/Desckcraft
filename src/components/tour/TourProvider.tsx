import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useTourStore } from '@/stores';
import { TourController } from './TourController';
import type { TourStep } from '@/types/tour';

/* ---------- Context ---------- */

interface TourContextValue {
  /** Whether the tour is currently active/visible */
  isActive: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps in the tour */
  totalSteps: number;
  /** All step definitions */
  steps: TourStep[];
  /** Start the tour from the beginning */
  start: () => Promise<void>;
  /** Go to the next step (or complete if on last step) */
  next: () => Promise<void>;
  /** Go to the previous step */
  prev: () => void;
  /** Skip/dismiss the tour without completing */
  skip: () => Promise<void>;
  /** Mark the tour as completed */
  complete: () => Promise<void>;
}

const TourContext = createContext<TourContextValue | null>(null);

/* ---------- Hook ---------- */

/**
 * useTour provides access to the tour state and controls.
 * Must be used within a TourProvider.
 */
export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within a <TourProvider>');
  }
  return ctx;
}

/* ---------- Provider ---------- */

interface TourProviderProps {
  children: ReactNode;
}

/**
 * TourProvider wraps the application and manages the onboarding tour.
 *
 * On mount it checks the persisted tour state from tourStore.
 * If the user has never seen the tour (`has_seen === false`),
 * it auto-starts after a 1-second delay so the UI has time to render.
 *
 * It renders the TourController which handles the overlay, tooltips,
 * and step navigation.
 */
export function TourProvider({ children }: TourProviderProps) {
  const {
    isActive,
    currentStep,
    totalSteps,
    steps,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    fetchTourState,
  } = useTourStore();

  const hasAutoStarted = useRef(false);

  // On mount: fetch tour state and auto-start if first launch
  useEffect(() => {
    let autoStartTimer: ReturnType<typeof setTimeout>;

    async function init() {
      try {
        await fetchTourState();
      } catch {
        // tourStore captures its own errors
      }

      const state = useTourStore.getState();

      // Auto-start the tour for first-time users after a 1-second delay
      if (
        state.tourState &&
        !state.tourState.has_seen &&
        !state.tourState.completed_at &&
        !state.tourState.skipped_at &&
        !hasAutoStarted.current
      ) {
        hasAutoStarted.current = true;
        autoStartTimer = setTimeout(() => {
          startTour();
        }, 1000);
      }
    }

    init();

    return () => {
      clearTimeout(autoStartTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: TourContextValue = {
    isActive,
    currentStep,
    totalSteps,
    steps,
    start: startTour,
    next: nextStep,
    prev: prevStep,
    skip: skipTour,
    complete: completeTour,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <TourController />
    </TourContext.Provider>
  );
}

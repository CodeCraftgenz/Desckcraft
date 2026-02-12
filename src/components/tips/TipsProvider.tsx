import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useTipsStore } from '@/stores/tipsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { TipSuggestion } from '@/types/tips';

/* ---------- Context ---------- */

interface TipsContextValue {
  /** All current tip suggestions */
  tips: TipSuggestion[];
  /** Whether the tips system is enabled */
  isEnabled: boolean;
  /** Accept a tip (act on the suggestion) */
  acceptTip: (tipId: string) => Promise<void>;
  /** Dismiss a tip (hide with 24h cooldown) */
  dismissTip: (tipId: string) => Promise<void>;
}

const TipsContext = createContext<TipsContextValue | null>(null);

/* ---------- Hook ---------- */

/**
 * useTipsContext provides access to the tips engine state and controls.
 * Must be used within a TipsProvider.
 */
export function useTipsContext(): TipsContextValue {
  const ctx = useContext(TipsContext);
  if (!ctx) {
    throw new Error('useTipsContext must be used within a <TipsProvider>');
  }
  return ctx;
}

/* ---------- Interval Config ---------- */

/** Re-evaluation interval based on tips_frequency setting */
const FREQUENCY_INTERVALS: Record<string, number> = {
  normal: 5 * 60 * 1000,  // 5 minutes
  low: 15 * 60 * 1000,    // 15 minutes
  off: 0,                  // disabled
};

/* ---------- Provider ---------- */

interface TipsProviderProps {
  children: ReactNode;
}

/**
 * TipsProvider wraps the application and manages the smart tips engine.
 *
 * On mount, it evaluates tips for known folders (Desktop, Downloads)
 * via tipsStore.evaluateTips(). It then re-evaluates at an interval
 * determined by the tips_frequency setting (every 5 min for "normal",
 * 15 min for "low", disabled for "off").
 *
 * Only evaluates when tips_enabled is true and tips_frequency is not "off".
 */
export function TipsProvider({ children }: TipsProviderProps) {
  const tips = useTipsStore((s) => s.tips);
  const evaluateTips = useTipsStore((s) => s.evaluateTips);
  const acceptTip = useTipsStore((s) => s.acceptTip);
  const dismissTip = useTipsStore((s) => s.dismissTip);

  const tipsEnabled = useSettingsStore((s) => s.settings.tips_enabled);
  const tipsFrequency = useSettingsStore((s) => s.settings.tips_frequency);

  const isEnabled = tipsEnabled && tipsFrequency !== 'off';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial evaluation on mount (when enabled)
  useEffect(() => {
    if (isEnabled) {
      // Small delay to let the UI settle before evaluating
      const timer = setTimeout(() => {
        evaluateTips();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic re-evaluation based on frequency setting
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isEnabled) return;

    const intervalMs = FREQUENCY_INTERVALS[tipsFrequency] || FREQUENCY_INTERVALS.normal;
    if (intervalMs <= 0) return;

    intervalRef.current = setInterval(() => {
      evaluateTips();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isEnabled, tipsFrequency]); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: TipsContextValue = {
    tips,
    isEnabled,
    acceptTip,
    dismissTip,
  };

  return (
    <TipsContext.Provider value={contextValue}>
      {children}
    </TipsContext.Provider>
  );
}

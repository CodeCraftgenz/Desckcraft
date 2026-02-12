import { useCallback, useMemo } from 'react';
import { useTipsStore } from '@/stores/tipsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { TipSuggestion } from '@/types/tips';

/**
 * Custom hook that provides tips state and actions.
 *
 * Reads tips from the tipsStore and tips_enabled/tips_frequency
 * from the settingsStore. Provides convenience accessors for
 * the current (first) tip and memoized action handlers.
 */
export function useTips() {
  const tips = useTipsStore((s) => s.tips);
  const isLoading = useTipsStore((s) => s.isLoading);
  const error = useTipsStore((s) => s.error);
  const storeAcceptTip = useTipsStore((s) => s.acceptTip);
  const storeDismissTip = useTipsStore((s) => s.dismissTip);
  const storeEvaluateTips = useTipsStore((s) => s.evaluateTips);
  const resetDismissedTips = useTipsStore((s) => s.resetDismissedTips);

  const tipsEnabled = useSettingsStore((s) => s.settings.tips_enabled);
  const tipsFrequency = useSettingsStore((s) => s.settings.tips_frequency);

  /** Whether tips are effectively enabled (setting on + frequency not off) */
  const isEnabled = useMemo(
    () => tipsEnabled && tipsFrequency !== 'off',
    [tipsEnabled, tipsFrequency],
  );

  /** The first tip in the queue (to display as current) */
  const currentTip: TipSuggestion | null = useMemo(
    () => (isEnabled && tips.length > 0 ? tips[0] : null),
    [tips, isEnabled],
  );

  /** Accept a tip — removes it from the list and could navigate to rule builder */
  const acceptTip = useCallback(
    async (tipId: string) => {
      await storeAcceptTip(tipId);
      // Future: navigate to rule builder with pre-filled data based on tipId
    },
    [storeAcceptTip],
  );

  /** Dismiss a tip — removes it from list and records in store with cooldown */
  const dismissTip = useCallback(
    async (tipId: string) => {
      await storeDismissTip(tipId);
    },
    [storeDismissTip],
  );

  /** Manually refresh tips evaluation */
  const refresh = useCallback(async () => {
    if (isEnabled) {
      await storeEvaluateTips();
    }
  }, [isEnabled, storeEvaluateTips]);

  return {
    /** All current tips */
    tips,
    /** The first/current tip to display */
    currentTip,
    /** Whether tips system is enabled */
    isEnabled,
    /** Whether tips are currently loading */
    isLoading,
    /** Any error from tips evaluation */
    error,
    /** Accept a tip (act on suggestion) */
    acceptTip,
    /** Dismiss a tip (hide with cooldown) */
    dismissTip,
    /** Manually trigger tips re-evaluation */
    refresh,
    /** Reset all dismissed tips so they can appear again */
    resetDismissedTips,
  };
}

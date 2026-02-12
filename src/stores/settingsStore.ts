import { create } from 'zustand';
import { tauriInvoke } from '@/lib/tauri';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import type { AppSettings, Setting } from '@/types/settings';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => Promise<void>;
  applyTheme: () => void;
}

/**
 * Parse raw Setting[] from the backend into a typed AppSettings object.
 * Falls back to DEFAULT_SETTINGS for any missing keys.
 */
function parseSettings(raw: Setting[]): AppSettings {
  const map = new Map(raw.map((s) => [s.key, s.value]));

  const parseBool = (val: string | undefined, fallback: boolean): boolean => {
    if (val === undefined) return fallback;
    return val === 'true' || val === '1';
  };

  return {
    theme: (map.get('theme') as AppSettings['theme']) ?? DEFAULT_SETTINGS.theme,
    language: map.get('language') ?? DEFAULT_SETTINGS.language,
    conflict_strategy:
      (map.get('conflict_strategy') as AppSettings['conflict_strategy']) ??
      DEFAULT_SETTINGS.conflict_strategy,
    start_minimized: parseBool(
      map.get('start_minimized'),
      DEFAULT_SETTINGS.start_minimized,
    ),
    start_with_os: parseBool(
      map.get('start_with_os'),
      DEFAULT_SETTINGS.start_with_os,
    ),
    log_level: map.get('log_level') ?? DEFAULT_SETTINGS.log_level,
    tips_enabled: parseBool(
      map.get('tips_enabled'),
      DEFAULT_SETTINGS.tips_enabled,
    ),
    tips_frequency:
      (map.get('tips_frequency') as AppSettings['tips_frequency']) ??
      DEFAULT_SETTINGS.tips_frequency,
    license_key: map.get('license_key') ?? DEFAULT_SETTINGS.license_key,
    trial_started_at:
      map.get('trial_started_at') ?? DEFAULT_SETTINGS.trial_started_at,
    first_launch: parseBool(
      map.get('first_launch'),
      DEFAULT_SETTINGS.first_launch,
    ),
  };
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw = await tauriInvoke<Setting[]>('get_all_settings');
      const settings = parseSettings(raw);
      set({ settings, isLoading: false });
      // Apply theme immediately after fetching
      get().applyTheme();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  updateSetting: async (key, value) => {
    set({ error: null });
    try {
      const stringValue = String(value);
      await tauriInvoke('set_setting', { key: String(key), value: stringValue });
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));
      // Re-apply theme if the theme setting changed
      if (key === 'theme') {
        get().applyTheme();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  applyTheme: () => {
    const { theme } = get().settings;
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      root.classList.toggle('dark', prefersDark);
      root.classList.toggle('light', !prefersDark);
    }
  },
}));

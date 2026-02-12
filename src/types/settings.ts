export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  language: string;
  conflict_strategy: 'suffix' | 'conflict_folder' | 'ask';
  start_minimized: boolean;
  start_with_os: boolean;
  log_level: string;
  tips_enabled: boolean;
  tips_frequency: 'normal' | 'low' | 'off';
  license_key: string;
  trial_started_at: string;
  first_launch: boolean;
}

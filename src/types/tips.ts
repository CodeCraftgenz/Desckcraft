export interface TipState {
  id: string;
  times_shown: number;
  last_shown_at: string | null;
  accepted: boolean;
  dismissed: boolean;
  dismissed_at: string | null;
  cooldown_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface TipSuggestion {
  id: string;
  title: string;
  message: string;
  action_label: string;
  action_type: string;
}

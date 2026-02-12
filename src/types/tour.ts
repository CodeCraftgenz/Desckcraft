export interface TourState {
  id: string;
  has_seen: boolean;
  current_step: number;
  completed_at: string | null;
  skipped_at: string | null;
  times_completed: number;
  updated_at: string;
}

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  placement: 'top' | 'bottom' | 'left' | 'right';
  order: number;
}

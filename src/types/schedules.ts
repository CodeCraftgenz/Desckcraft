export interface Schedule {
  id: string;
  profile_id: string;
  folder_id: string;
  cron_expr: string;
  is_enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

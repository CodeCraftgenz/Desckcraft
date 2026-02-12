export interface Run {
  id: string;
  profile_id: string | null;
  run_type: 'manual' | 'simulation' | 'watcher' | 'scheduled';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  source_folder: string;
  total_files: number;
  moved_files: number;
  skipped_files: number;
  error_files: number;
  started_at: string;
  completed_at: string | null;
  rolled_back_at: string | null;
  error_message: string | null;
}

export interface RunItem {
  id: string;
  run_id: string;
  rule_id: string | null;
  original_path: string;
  destination_path: string;
  file_size: number;
  action_type: 'move' | 'rename' | 'move_rename';
  status: 'pending' | 'completed' | 'failed' | 'rolled_back' | 'skipped';
  conflict_strategy: string | null;
  error_message: string | null;
  executed_at: string | null;
  rolled_back_at: string | null;
}

export interface FileEntry {
  path: string;
  name: string;
  extension: string;
  size: number;
  created_at: string;
  modified_at: string;
}

export interface SimulationResult {
  items: SimulationItem[];
  total_files: number;
  matched_files: number;
  unmatched_files: number;
}

export interface SimulationItem {
  file: FileEntry;
  rule_id: string;
  rule_name: string;
  action_type: string;
  destination: string;
  has_conflict: boolean;
}

export interface ExecutionResult {
  run_id: string;
  total: number;
  moved: number;
  skipped: number;
  errors: number;
}

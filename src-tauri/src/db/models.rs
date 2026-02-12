use serde::{Deserialize, Serialize};

// ── Profiles ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub is_active: bool,
    pub is_default: bool,
    pub created_at: String,
    pub updated_at: String,
}

// ── Rules ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub is_enabled: bool,
    pub priority: i32,
    pub sort_order: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleCondition {
    pub id: String,
    pub rule_id: String,
    pub field: String,
    pub operator: String,
    pub value: String,
    pub logic_gate: String,
    pub sort_order: i32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleAction {
    pub id: String,
    pub rule_id: String,
    pub action_type: String,
    pub destination: String,
    pub rename_pattern: String,
    pub tag_name: String,
    pub sort_order: i32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileRule {
    pub id: String,
    pub profile_id: String,
    pub rule_id: String,
    pub sort_order: i32,
    pub created_at: String,
}

// ── Watched Folders ───────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchedFolder {
    pub id: String,
    pub path: String,
    pub profile_id: String,
    pub is_enabled: bool,
    pub watch_mode: String,
    pub created_at: String,
    pub updated_at: String,
}

// ── Runs ──────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Run {
    pub id: String,
    pub profile_id: String,
    pub run_type: String,
    pub status: String,
    pub source_folder: String,
    pub total_files: i32,
    pub moved_files: i32,
    pub skipped_files: i32,
    pub error_files: i32,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub rolled_back_at: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunItem {
    pub id: String,
    pub run_id: String,
    pub rule_id: Option<String>,
    pub original_path: String,
    pub destination_path: String,
    pub file_size: i64,
    pub action_type: String,
    pub status: String,
    pub conflict_strategy: String,
    pub error_message: Option<String>,
    pub executed_at: Option<String>,
    pub rolled_back_at: Option<String>,
}

// ── Schedules ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub id: String,
    pub profile_id: String,
    pub folder_id: String,
    pub cron_expr: String,
    pub is_enabled: bool,
    pub last_run_at: Option<String>,
    pub next_run_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// ── Settings ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

// ── Tags ──────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

// ── Shortcuts ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shortcut {
    pub id: String,
    pub name: String,
    pub shortcut_type: String,
    pub target: String,
    pub hotkey: String,
    pub sort_order: i32,
    pub created_at: String,
}

// ── Help & Tour ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HelpFavorite {
    pub id: String,
    pub article_slug: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HelpView {
    pub id: String,
    pub article_slug: String,
    pub viewed_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TourState {
    pub id: String,
    pub has_seen: bool,
    pub current_step: i32,
    pub completed_at: Option<String>,
    pub skipped_at: Option<String>,
    pub times_completed: i32,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TipState {
    pub id: String,
    pub times_shown: i32,
    pub last_shown_at: Option<String>,
    pub accepted: bool,
    pub dismissed: bool,
    pub dismissed_at: Option<String>,
    pub cooldown_until: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// ── File & Organizer Models ───────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub created_at: String,
    pub modified_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationResult {
    pub items: Vec<SimulationItem>,
    pub total_files: u32,
    pub matched_files: u32,
    pub unmatched_files: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationItem {
    pub file: FileEntry,
    pub rule_id: String,
    pub rule_name: String,
    pub action_type: String,
    pub destination: String,
    #[serde(rename = "has_conflict")]
    pub conflict: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub run_id: String,
    pub total: u32,
    pub moved: u32,
    pub skipped: u32,
    pub errors: u32,
    pub error_messages: Vec<String>,
}

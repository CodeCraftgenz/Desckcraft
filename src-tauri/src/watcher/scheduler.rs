use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A scheduled task entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleEntry {
    pub id: String,
    pub profile_id: String,
    pub folder_id: String,
    pub folder_path: String,
    pub cron_expr: String,
    pub is_enabled: bool,
    pub last_run_at: Option<String>,
    pub next_run_at: Option<String>,
}

/// Represents a schedule that is due for execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DueSchedule {
    pub schedule_id: String,
    pub profile_id: String,
    pub folder_path: String,
}

/// Manages scheduled organization tasks.
pub struct Scheduler {
    schedules: HashMap<String, ScheduleEntry>,
}

impl Scheduler {
    /// Creates a new empty scheduler.
    pub fn new() -> Self {
        Scheduler {
            schedules: HashMap::new(),
        }
    }

    /// Adds or updates a schedule entry.
    pub fn add_schedule(&mut self, entry: ScheduleEntry) {
        log::info!("Adding schedule: {} (cron: {})", entry.id, entry.cron_expr);
        self.schedules.insert(entry.id.clone(), entry);
    }

    /// Removes a schedule entry by ID.
    pub fn remove_schedule(&mut self, id: &str) {
        if self.schedules.remove(id).is_some() {
            log::info!("Removed schedule: {}", id);
        }
    }

    /// Checks which schedules are currently due for execution.
    ///
    /// A schedule is considered due if:
    /// 1. It is enabled
    /// 2. Its `next_run_at` is in the past or not set (first run)
    ///
    /// Returns a list of `DueSchedule` entries for schedules that should run now.
    pub fn check_due(&self) -> Vec<DueSchedule> {
        let now = Utc::now().naive_utc();
        let mut due = Vec::new();

        for entry in self.schedules.values() {
            if !entry.is_enabled {
                continue;
            }

            let is_due = match &entry.next_run_at {
                Some(next_run_str) => {
                    match NaiveDateTime::parse_from_str(next_run_str, "%Y-%m-%d %H:%M:%S") {
                        Ok(next_run) => now >= next_run,
                        Err(_) => {
                            log::warn!(
                                "Invalid next_run_at format for schedule {}: '{}'",
                                entry.id,
                                next_run_str
                            );
                            false
                        }
                    }
                }
                None => true, // No next_run_at means it has never run — consider it due
            };

            if is_due {
                due.push(DueSchedule {
                    schedule_id: entry.id.clone(),
                    profile_id: entry.profile_id.clone(),
                    folder_path: entry.folder_path.clone(),
                });
            }
        }

        due
    }

    /// Updates the last_run_at and calculates the next_run_at for a schedule.
    /// This is a simple implementation that adds a fixed interval parsed from
    /// a simplified cron expression.
    pub fn mark_run(&mut self, schedule_id: &str) {
        let now = Utc::now().naive_utc();
        let now_str = now.format("%Y-%m-%d %H:%M:%S").to_string();

        if let Some(entry) = self.schedules.get_mut(schedule_id) {
            entry.last_run_at = Some(now_str);

            // Simple interval calculation from cron-like expressions.
            // Supports: "@hourly", "@daily", "@weekly", "@monthly" or
            // a number representing interval in minutes.
            let next = match entry.cron_expr.as_str() {
                "@hourly" => now + chrono::Duration::hours(1),
                "@daily" => now + chrono::Duration::days(1),
                "@weekly" => now + chrono::Duration::weeks(1),
                "@monthly" => now + chrono::Duration::days(30),
                other => {
                    // Try to parse as minutes interval
                    if let Ok(minutes) = other.parse::<i64>() {
                        now + chrono::Duration::minutes(minutes)
                    } else {
                        // Default to daily
                        log::warn!(
                            "Unrecognized cron expression '{}', defaulting to daily",
                            other
                        );
                        now + chrono::Duration::days(1)
                    }
                }
            };

            entry.next_run_at = Some(next.format("%Y-%m-%d %H:%M:%S").to_string());
            log::info!(
                "Schedule {} ran at {}, next run at {:?}",
                schedule_id,
                entry.last_run_at.as_deref().unwrap_or("?"),
                entry.next_run_at
            );
        }
    }

    /// Returns the number of active schedules.
    pub fn count(&self) -> usize {
        self.schedules.len()
    }
}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_and_check_due() {
        let mut scheduler = Scheduler::new();

        scheduler.add_schedule(ScheduleEntry {
            id: "s1".to_string(),
            profile_id: "p1".to_string(),
            folder_id: "f1".to_string(),
            folder_path: "/downloads".to_string(),
            cron_expr: "@daily".to_string(),
            is_enabled: true,
            last_run_at: None,
            next_run_at: None, // Never run = due
        });

        let due = scheduler.check_due();
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].schedule_id, "s1");
    }

    #[test]
    fn test_disabled_schedule_not_due() {
        let mut scheduler = Scheduler::new();

        scheduler.add_schedule(ScheduleEntry {
            id: "s1".to_string(),
            profile_id: "p1".to_string(),
            folder_id: "f1".to_string(),
            folder_path: "/downloads".to_string(),
            cron_expr: "@daily".to_string(),
            is_enabled: false,
            last_run_at: None,
            next_run_at: None,
        });

        let due = scheduler.check_due();
        assert_eq!(due.len(), 0);
    }

    #[test]
    fn test_mark_run_updates_next() {
        let mut scheduler = Scheduler::new();

        scheduler.add_schedule(ScheduleEntry {
            id: "s1".to_string(),
            profile_id: "p1".to_string(),
            folder_id: "f1".to_string(),
            folder_path: "/downloads".to_string(),
            cron_expr: "@hourly".to_string(),
            is_enabled: true,
            last_run_at: None,
            next_run_at: None,
        });

        scheduler.mark_run("s1");

        let entry = scheduler.schedules.get("s1").unwrap();
        assert!(entry.last_run_at.is_some());
        assert!(entry.next_run_at.is_some());
    }
}

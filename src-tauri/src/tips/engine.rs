use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::db::models::TipState;
use crate::tips::heuristics;

/// A tip suggestion to be displayed to the user.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TipSuggestion {
    pub id: String,
    pub title: String,
    pub message: String,
    pub action_label: String,
    pub action_type: String,
}

/// Evaluates all heuristics against a folder path and returns applicable tip suggestions,
/// filtering out tips that have been dismissed or are under cooldown.
pub fn evaluate_tips(folder_path: &str, tip_states: &[TipState]) -> Vec<TipSuggestion> {
    let all_tips = gather_heuristics(folder_path);
    let now = Utc::now().naive_utc();

    all_tips
        .into_iter()
        .filter(|tip| should_show_tip(tip, tip_states, &now))
        .collect()
}

/// Runs all heuristic checks against the folder and collects suggestions.
fn gather_heuristics(folder_path: &str) -> Vec<TipSuggestion> {
    let mut tips = Vec::new();

    if let Some(tip) = heuristics::check_desktop_clutter(folder_path) {
        tips.push(tip);
    }

    if let Some(tip) = heuristics::check_pdf_accumulation(folder_path) {
        tips.push(tip);
    }

    if let Some(tip) = heuristics::check_installer_pileup(folder_path) {
        tips.push(tip);
    }

    tips
}

/// Determines whether a tip should be shown based on its state.
///
/// A tip should NOT be shown if:
/// - It has been accepted (the user already acted on it)
/// - It has been dismissed and the cooldown period has not expired
fn should_show_tip(tip: &TipSuggestion, tip_states: &[TipState], now: &NaiveDateTime) -> bool {
    let state = tip_states.iter().find(|s| s.id == tip.id);

    match state {
        None => true, // Never seen — show it
        Some(state) => {
            // If accepted, don't show again
            if state.accepted {
                return false;
            }

            // If dismissed with a cooldown, check if cooldown expired
            if state.dismissed {
                if let Some(ref cooldown_until) = state.cooldown_until {
                    if let Ok(cooldown_dt) =
                        NaiveDateTime::parse_from_str(cooldown_until, "%Y-%m-%d %H:%M:%S")
                    {
                        if now < &cooldown_dt {
                            return false; // Still under cooldown
                        }
                    }
                } else {
                    // Dismissed without cooldown = permanently dismissed
                    return false;
                }
            }

            true
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_accepted_tip_not_shown() {
        let tip = TipSuggestion {
            id: "tip_desktop_clutter".to_string(),
            title: "Test".to_string(),
            message: "Test".to_string(),
            action_label: "Fix".to_string(),
            action_type: "organize".to_string(),
        };

        let state = TipState {
            id: "tip_desktop_clutter".to_string(),
            times_shown: 1,
            last_shown_at: None,
            accepted: true,
            dismissed: false,
            dismissed_at: None,
            cooldown_until: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let now = Utc::now().naive_utc();
        assert!(!should_show_tip(&tip, &[state], &now));
    }

    #[test]
    fn test_new_tip_shown() {
        let tip = TipSuggestion {
            id: "tip_new".to_string(),
            title: "Test".to_string(),
            message: "Test".to_string(),
            action_label: "Fix".to_string(),
            action_type: "organize".to_string(),
        };

        let now = Utc::now().naive_utc();
        assert!(should_show_tip(&tip, &[], &now));
    }
}

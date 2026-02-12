use std::collections::HashMap;
use std::path::Path;

use crate::db::models::{FileEntry, RuleAction, RuleCondition, SimulationItem, SimulationResult};
use crate::rules::engine::evaluate_rules;

/// Simulates file organization without moving anything.
/// Takes a list of files and rules with their conditions/actions,
/// evaluates which rules match each file, and builds a simulation result.
pub fn simulate(
    files: &[FileEntry],
    rules: &[crate::db::models::Rule],
    conditions: &HashMap<String, Vec<RuleCondition>>,
    actions: &HashMap<String, Vec<RuleAction>>,
) -> SimulationResult {
    let mut items = Vec::new();
    let mut matched: u32 = 0;
    let mut unmatched: u32 = 0;

    for file in files {
        match evaluate_rules(file, rules, conditions, actions) {
            Some((rule_id, matched_actions)) => {
                let rule_name = rules
                    .iter()
                    .find(|r| r.id == rule_id)
                    .map(|r| r.name.clone())
                    .unwrap_or_default();

                for action in &matched_actions {
                    let destination = crate::rules::actions::resolve_action(file, action)
                        .map(|p| p.to_string_lossy().to_string())
                        .unwrap_or_default();

                    let conflict = if !destination.is_empty() {
                        Path::new(&destination).exists()
                    } else {
                        false
                    };

                    items.push(SimulationItem {
                        file: file.clone(),
                        rule_id: rule_id.clone(),
                        rule_name: rule_name.clone(),
                        action_type: action.action_type.clone(),
                        destination,
                        conflict,
                    });
                }
                matched += 1;
            }
            None => {
                unmatched += 1;
            }
        }
    }

    SimulationResult {
        total_files: files.len() as u32,
        matched_files: matched,
        unmatched_files: unmatched,
        items,
    }
}

use std::collections::HashMap;

use crate::db::models::{FileEntry, Rule, RuleAction, RuleCondition};
use crate::rules::conditions::evaluate_conditions;

/// Evaluates all rules against a file and returns the first matching rule's ID
/// along with its associated actions.
///
/// Rules are evaluated in order (they should be pre-sorted by sort_order/priority).
/// Only enabled rules are considered.
pub fn evaluate_rules(
    file: &FileEntry,
    rules: &[Rule],
    conditions: &HashMap<String, Vec<RuleCondition>>,
    actions: &HashMap<String, Vec<RuleAction>>,
) -> Option<(String, Vec<RuleAction>)> {
    for rule in rules {
        // Skip disabled rules
        if !rule.is_enabled {
            continue;
        }

        // Get conditions for this rule
        let rule_conditions = match conditions.get(&rule.id) {
            Some(conds) if !conds.is_empty() => conds,
            _ => {
                // A rule with no conditions matches nothing
                continue;
            }
        };

        // Evaluate all conditions
        if evaluate_conditions(file, rule_conditions) {
            // Rule matched — get its actions
            let rule_actions = actions.get(&rule.id).cloned().unwrap_or_default();
            if rule_actions.is_empty() {
                log::debug!(
                    "Rule '{}' matched file '{}' but has no actions, skipping",
                    rule.name,
                    file.name
                );
                continue;
            }

            log::debug!(
                "Rule '{}' matched file '{}' with {} actions",
                rule.name,
                file.name,
                rule_actions.len()
            );
            return Some((rule.id.clone(), rule_actions));
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_file(name: &str, ext: &str, size: u64) -> FileEntry {
        FileEntry {
            path: format!("/test/{}", name),
            name: name.to_string(),
            extension: ext.to_string(),
            size,
            created_at: "2025-01-01 00:00:00".to_string(),
            modified_at: "2025-01-01 00:00:00".to_string(),
        }
    }

    #[test]
    fn test_no_rules_returns_none() {
        let file = make_file("test.txt", "txt", 100);
        let result = evaluate_rules(&file, &[], &HashMap::new(), &HashMap::new());
        assert!(result.is_none());
    }

    #[test]
    fn test_matching_rule_returns_actions() {
        let file = make_file("report.pdf", "pdf", 1024);

        let rule = Rule {
            id: "rule-1".to_string(),
            name: "PDF Rule".to_string(),
            description: "".to_string(),
            is_enabled: true,
            priority: 0,
            sort_order: 0,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let condition = RuleCondition {
            id: "cond-1".to_string(),
            rule_id: "rule-1".to_string(),
            field: "extension".to_string(),
            operator: "equals".to_string(),
            value: "pdf".to_string(),
            logic_gate: "AND".to_string(),
            sort_order: 0,
            created_at: "".to_string(),
        };

        let action = RuleAction {
            id: "act-1".to_string(),
            rule_id: "rule-1".to_string(),
            action_type: "move".to_string(),
            destination: "/documents/pdfs".to_string(),
            rename_pattern: "".to_string(),
            tag_name: "".to_string(),
            sort_order: 0,
            created_at: "".to_string(),
        };

        let mut conditions = HashMap::new();
        conditions.insert("rule-1".to_string(), vec![condition]);

        let mut actions = HashMap::new();
        actions.insert("rule-1".to_string(), vec![action]);

        let result = evaluate_rules(&file, &[rule], &conditions, &actions);
        assert!(result.is_some());
        let (rule_id, rule_actions) = result.unwrap();
        assert_eq!(rule_id, "rule-1");
        assert_eq!(rule_actions.len(), 1);
    }
}

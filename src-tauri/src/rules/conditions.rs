use regex::Regex;

use crate::db::models::{FileEntry, RuleCondition};

/// Evaluates a single condition against a file entry.
///
/// Supported fields: `extension`, `filename`, `size`, `created_date`,
/// `modified_date`, `source_folder`, `regex`.
///
/// Supported operators: `equals`, `not_equals`, `contains`, `not_contains`,
/// `starts_with`, `ends_with`, `greater_than`, `less_than`, `matches` (regex).
pub fn evaluate_condition(file: &FileEntry, condition: &RuleCondition) -> bool {
    let file_value = get_field_value(file, &condition.field);
    let cond_value = &condition.value;

    match condition.operator.as_str() {
        "equals" => file_value.eq_ignore_ascii_case(cond_value),
        "not_equals" => !file_value.eq_ignore_ascii_case(cond_value),
        "contains" => file_value.to_lowercase().contains(&cond_value.to_lowercase()),
        "not_contains" => !file_value.to_lowercase().contains(&cond_value.to_lowercase()),
        "starts_with" => file_value
            .to_lowercase()
            .starts_with(&cond_value.to_lowercase()),
        "ends_with" => file_value
            .to_lowercase()
            .ends_with(&cond_value.to_lowercase()),
        "greater_than" => {
            let file_num = parse_numeric(&file_value);
            let cond_num = parse_numeric(cond_value);
            file_num > cond_num
        }
        "less_than" => {
            let file_num = parse_numeric(&file_value);
            let cond_num = parse_numeric(cond_value);
            file_num < cond_num
        }
        "matches" => match Regex::new(cond_value) {
            Ok(re) => re.is_match(&file_value),
            Err(e) => {
                log::warn!("Invalid regex pattern '{}': {}", cond_value, e);
                false
            }
        },
        unknown => {
            log::warn!("Unknown operator: '{}'", unknown);
            false
        }
    }
}

/// Evaluates multiple conditions with AND/OR logic gates.
///
/// The first condition's `logic_gate` is ignored (it is implicitly the start).
/// Subsequent conditions use their `logic_gate` to determine how they combine
/// with the previous result.
pub fn evaluate_conditions(file: &FileEntry, conditions: &[RuleCondition]) -> bool {
    if conditions.is_empty() {
        return false;
    }

    let mut result = evaluate_condition(file, &conditions[0]);

    for condition in &conditions[1..] {
        let current = evaluate_condition(file, condition);

        match condition.logic_gate.to_uppercase().as_str() {
            "OR" => {
                result = result || current;
            }
            _ => {
                // Default to AND
                result = result && current;
            }
        }
    }

    result
}

/// Extracts the value of a field from a file entry for comparison.
fn get_field_value(file: &FileEntry, field: &str) -> String {
    match field {
        "extension" => file.extension.clone(),
        "filename" | "name" => file.name.clone(),
        "size" => file.size.to_string(),
        "created_date" | "created_at" => file.created_at.clone(),
        "modified_date" | "modified_at" => file.modified_at.clone(),
        "source_folder" | "path" => {
            // Extract the parent directory from the path
            std::path::Path::new(&file.path)
                .parent()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_default()
        }
        "regex" => file.name.clone(), // regex field matches against filename
        _ => {
            log::warn!("Unknown field: '{}', using filename", field);
            file.name.clone()
        }
    }
}

/// Parses a string as a floating-point number, returning 0.0 on failure.
fn parse_numeric(s: &str) -> f64 {
    s.parse::<f64>().unwrap_or(0.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_file() -> FileEntry {
        FileEntry {
            path: "/home/user/downloads/report.pdf".to_string(),
            name: "report.pdf".to_string(),
            extension: "pdf".to_string(),
            size: 2048,
            created_at: "2025-06-15 10:30:00".to_string(),
            modified_at: "2025-06-15 12:00:00".to_string(),
        }
    }

    fn make_condition(field: &str, operator: &str, value: &str) -> RuleCondition {
        RuleCondition {
            id: "c1".to_string(),
            rule_id: "r1".to_string(),
            field: field.to_string(),
            operator: operator.to_string(),
            value: value.to_string(),
            logic_gate: "AND".to_string(),
            sort_order: 0,
            created_at: "".to_string(),
        }
    }

    #[test]
    fn test_extension_equals() {
        let file = make_file();
        assert!(evaluate_condition(&file, &make_condition("extension", "equals", "pdf")));
        assert!(!evaluate_condition(&file, &make_condition("extension", "equals", "docx")));
    }

    #[test]
    fn test_filename_contains() {
        let file = make_file();
        assert!(evaluate_condition(&file, &make_condition("filename", "contains", "report")));
    }

    #[test]
    fn test_size_greater_than() {
        let file = make_file();
        assert!(evaluate_condition(&file, &make_condition("size", "greater_than", "1024")));
        assert!(!evaluate_condition(&file, &make_condition("size", "greater_than", "4096")));
    }

    #[test]
    fn test_regex_match() {
        let file = make_file();
        assert!(evaluate_condition(&file, &make_condition("regex", "matches", r"^report\.\w+")));
        assert!(!evaluate_condition(&file, &make_condition("regex", "matches", r"^image\.\w+")));
    }

    #[test]
    fn test_and_logic() {
        let file = make_file();
        let c1 = make_condition("extension", "equals", "pdf");
        let mut c2 = make_condition("size", "greater_than", "1024");
        c2.logic_gate = "AND".to_string();

        assert!(evaluate_conditions(&file, &[c1, c2]));
    }

    #[test]
    fn test_or_logic() {
        let file = make_file();
        let c1 = make_condition("extension", "equals", "docx"); // false
        let mut c2 = make_condition("extension", "equals", "pdf"); // true
        c2.logic_gate = "OR".to_string();

        assert!(evaluate_conditions(&file, &[c1, c2]));
    }
}

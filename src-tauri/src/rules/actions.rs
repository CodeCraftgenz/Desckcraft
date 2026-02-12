use std::path::PathBuf;

use crate::db::models::{FileEntry, RuleAction};

/// Resolves an action to compute the final destination path for a file.
///
/// The destination string and rename_pattern can contain template placeholders:
/// - `{extension}` — the file's extension (e.g., "pdf")
/// - `{year}` — year from the file's modified_at date
/// - `{month}` — two-digit month from the file's modified_at date
/// - `{day}` — two-digit day from the file's modified_at date
/// - `{original}` — the original filename without extension
/// - `{counter}` — a simple counter placeholder (resolved as 1 by default)
///
/// Returns `None` if the action type does not produce a path (e.g., tag-only actions).
pub fn resolve_action(file: &FileEntry, action: &RuleAction) -> Option<PathBuf> {
    match action.action_type.as_str() {
        "move" | "copy" | "move_to_folder" => {
            if action.destination.is_empty() {
                return None;
            }

            let dest_dir = expand_template(&action.destination, file);

            if action.rename_pattern.is_empty() {
                Some(PathBuf::from(&dest_dir).join(&file.name))
            } else {
                let new_name = expand_template(&action.rename_pattern, file);
                Some(PathBuf::from(&dest_dir).join(&new_name))
            }
        }
        "move_to_subfolder" => {
            if action.destination.is_empty() {
                return None;
            }

            // Create a subfolder relative to the file's current parent directory
            let parent = std::path::Path::new(&file.path)
                .parent()
                .unwrap_or_else(|| std::path::Path::new("."));

            let subfolder_name = expand_template(&action.destination, file);
            let dest_dir = parent.join(&subfolder_name);

            if action.rename_pattern.is_empty() {
                Some(dest_dir.join(&file.name))
            } else {
                let new_name = expand_template(&action.rename_pattern, file);
                Some(dest_dir.join(&new_name))
            }
        }
        "rename" => {
            if action.rename_pattern.is_empty() {
                return None;
            }

            let parent = std::path::Path::new(&file.path)
                .parent()
                .unwrap_or_else(|| std::path::Path::new("."));

            let new_name = expand_template(&action.rename_pattern, file);
            Some(parent.join(&new_name))
        }
        "tag" | "add_tag" => {
            // Tag actions don't produce a destination path
            None
        }
        "delete" => {
            // Delete actions don't move the file
            None
        }
        other => {
            log::warn!("Unknown action type: '{}', treating as no-op", other);
            None
        }
    }
}

/// Expands template placeholders in a string using file metadata.
fn expand_template(template: &str, file: &FileEntry) -> String {
    let stem = std::path::Path::new(&file.name)
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let (year, month, day) = extract_date_parts(&file.modified_at);

    template
        .replace("{extension}", &file.extension)
        .replace("{year}", &year)
        .replace("{month}", &month)
        .replace("{day}", &day)
        .replace("{original}", &stem)
        .replace("{counter}", "1")
}

/// Extracts year, month, day strings from a datetime string formatted as
/// "YYYY-MM-DD HH:MM:SS" or similar. Returns ("0000", "00", "00") on failure.
fn extract_date_parts(datetime: &str) -> (String, String, String) {
    if datetime.len() >= 10 {
        let parts: Vec<&str> = datetime[..10].split('-').collect();
        if parts.len() == 3 {
            return (
                parts[0].to_string(),
                parts[1].to_string(),
                parts[2].to_string(),
            );
        }
    }

    // Try parsing with chrono as a fallback
    if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(datetime, "%Y-%m-%d %H:%M:%S") {
        return (
            format!("{}", dt.format("%Y")),
            format!("{}", dt.format("%m")),
            format!("{}", dt.format("%d")),
        );
    }

    ("0000".to_string(), "00".to_string(), "00".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_file() -> FileEntry {
        FileEntry {
            path: "/downloads/report.pdf".to_string(),
            name: "report.pdf".to_string(),
            extension: "pdf".to_string(),
            size: 2048,
            created_at: "2025-06-15 10:30:00".to_string(),
            modified_at: "2025-06-15 10:30:00".to_string(),
        }
    }

    #[test]
    fn test_move_action() {
        let file = make_file();
        let action = RuleAction {
            id: "a1".to_string(),
            rule_id: "r1".to_string(),
            action_type: "move".to_string(),
            destination: "/sorted/{extension}".to_string(),
            rename_pattern: "".to_string(),
            tag_name: "".to_string(),
            sort_order: 0,
            created_at: "".to_string(),
        };

        let result = resolve_action(&file, &action).unwrap();
        assert_eq!(result, PathBuf::from("/sorted/pdf/report.pdf"));
    }

    #[test]
    fn test_move_with_rename() {
        let file = make_file();
        let action = RuleAction {
            id: "a1".to_string(),
            rule_id: "r1".to_string(),
            action_type: "move".to_string(),
            destination: "/archive/{year}/{month}".to_string(),
            rename_pattern: "{original}_{year}{month}{day}.{extension}".to_string(),
            tag_name: "".to_string(),
            sort_order: 0,
            created_at: "".to_string(),
        };

        let result = resolve_action(&file, &action).unwrap();
        assert_eq!(
            result,
            PathBuf::from("/archive/2025/06/report_20250615.pdf")
        );
    }

    #[test]
    fn test_tag_action_returns_none() {
        let file = make_file();
        let action = RuleAction {
            id: "a1".to_string(),
            rule_id: "r1".to_string(),
            action_type: "tag".to_string(),
            destination: "".to_string(),
            rename_pattern: "".to_string(),
            tag_name: "important".to_string(),
            sort_order: 0,
            created_at: "".to_string(),
        };

        assert!(resolve_action(&file, &action).is_none());
    }
}

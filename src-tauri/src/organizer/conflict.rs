use std::path::{Path, PathBuf};

/// Resolves a file conflict at the given path based on the specified strategy.
///
/// Strategies:
/// - `"suffix"`: Appends `_1`, `_2`, etc. to the filename until no conflict exists.
/// - `"conflict_folder"`: Moves the file into a `Conflicts/` subfolder in the same directory.
/// - `"skip"`: Returns the original path unchanged (caller should check and skip).
pub fn resolve_conflict(path: &Path, strategy: &str) -> PathBuf {
    match strategy {
        "suffix" => resolve_suffix(path),
        "conflict_folder" => resolve_conflict_folder(path),
        "skip" => path.to_path_buf(),
        _ => {
            log::warn!("Unknown conflict strategy '{}', defaulting to suffix", strategy);
            resolve_suffix(path)
        }
    }
}

/// Adds a numeric suffix (`_1`, `_2`, ...) to the file stem until no file with
/// that name exists at the target location.
fn resolve_suffix(path: &Path) -> PathBuf {
    let parent = path.parent().unwrap_or_else(|| Path::new("."));
    let stem = path
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let ext = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy()))
        .unwrap_or_default();

    let mut counter = 1u32;
    loop {
        let new_name = format!("{}_{}{}", stem, counter, ext);
        let candidate = parent.join(&new_name);
        if !candidate.exists() {
            return candidate;
        }
        counter += 1;
        if counter > 10_000 {
            // Safety valve — extremely unlikely but prevents infinite loop
            log::error!("Suffix conflict resolution exceeded 10,000 attempts for {}", path.display());
            return candidate;
        }
    }
}

/// Moves the file into a `Conflicts` subfolder within the same parent directory.
/// If a file with the same name already exists in the Conflicts folder, applies
/// suffix resolution inside it.
fn resolve_conflict_folder(path: &Path) -> PathBuf {
    let parent = path.parent().unwrap_or_else(|| Path::new("."));
    let conflicts_dir = parent.join("Conflicts");

    // Create the Conflicts directory if needed
    if !conflicts_dir.exists() {
        std::fs::create_dir_all(&conflicts_dir).ok();
    }

    let file_name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let candidate = conflicts_dir.join(&file_name);

    if candidate.exists() {
        // Apply suffix within the Conflicts folder
        resolve_suffix(&candidate)
    } else {
        candidate
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_suffix_strategy_no_conflict() {
        let temp = std::env::temp_dir().join("deskcraft_conflict_test");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&temp).unwrap();

        let file = temp.join("test.txt");
        fs::write(&file, "hello").unwrap();

        let resolved = resolve_suffix(&file);
        assert_eq!(resolved, temp.join("test_1.txt"));

        let _ = fs::remove_dir_all(&temp);
    }

    #[test]
    fn test_skip_strategy() {
        let path = Path::new("/some/file.txt");
        let resolved = resolve_conflict(path, "skip");
        assert_eq!(resolved, path.to_path_buf());
    }
}

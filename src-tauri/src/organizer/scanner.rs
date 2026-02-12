use anyhow::{Context, Result};
use std::fs;
use std::path::Path;

use crate::db::models::FileEntry;

/// Scans a folder and returns a list of file entries with metadata.
/// If `recursive` is true, sub-directories are also scanned.
pub fn scan_folder(path: &str, recursive: bool) -> Result<Vec<FileEntry>> {
    let dir = Path::new(path);
    if !dir.exists() {
        return Err(anyhow::anyhow!("Directory does not exist: {}", path));
    }
    if !dir.is_dir() {
        return Err(anyhow::anyhow!("Path is not a directory: {}", path));
    }

    let mut entries = Vec::new();
    collect_files(dir, recursive, &mut entries)?;

    log::info!("Scanned {} files in '{}'", entries.len(), path);
    Ok(entries)
}

/// Recursively (or not) collects file entries from a directory.
fn collect_files(dir: &Path, recursive: bool, entries: &mut Vec<FileEntry>) -> Result<()> {
    let read_dir = fs::read_dir(dir)
        .with_context(|| format!("Failed to read directory: {}", dir.display()))?;

    for entry_result in read_dir {
        let entry = match entry_result {
            Ok(e) => e,
            Err(e) => {
                log::warn!("Skipping unreadable entry in {}: {}", dir.display(), e);
                continue;
            }
        };

        let file_type = match entry.file_type() {
            Ok(ft) => ft,
            Err(e) => {
                log::warn!("Could not determine file type for {:?}: {}", entry.path(), e);
                continue;
            }
        };

        if file_type.is_dir() {
            if recursive {
                collect_files(&entry.path(), true, entries)?;
            }
            continue;
        }

        if !file_type.is_file() {
            continue; // skip symlinks etc.
        }

        match build_file_entry(&entry) {
            Ok(fe) => entries.push(fe),
            Err(e) => {
                log::warn!("Skipping file {:?}: {}", entry.path(), e);
            }
        }
    }

    Ok(())
}

/// Builds a `FileEntry` from a directory entry.
fn build_file_entry(entry: &fs::DirEntry) -> Result<FileEntry> {
    let path = entry.path();
    let metadata = entry.metadata().context("Failed to read file metadata")?;

    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let extension = path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();

    let size = metadata.len();

    let created_at = metadata
        .created()
        .ok()
        .and_then(|t| {
            let dt: chrono::DateTime<chrono::Utc> = t.into();
            Some(dt.format("%Y-%m-%d %H:%M:%S").to_string())
        })
        .unwrap_or_default();

    let modified_at = metadata
        .modified()
        .ok()
        .and_then(|t| {
            let dt: chrono::DateTime<chrono::Utc> = t.into();
            Some(dt.format("%Y-%m-%d %H:%M:%S").to_string())
        })
        .unwrap_or_default();

    Ok(FileEntry {
        path: path.to_string_lossy().to_string(),
        name,
        extension,
        size,
        created_at,
        modified_at,
    })
}

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

/// A simple file logger that writes log entries to daily log files
/// in `{app_data}/logs/deskcraft-{date}.log`.
pub struct FileLogger {
    log_dir: PathBuf,
}

impl FileLogger {
    /// Creates a new `FileLogger` that writes to the given app data directory.
    pub fn new(app_data_dir: &str) -> anyhow::Result<Self> {
        let log_dir = Path::new(app_data_dir).join("logs");
        fs::create_dir_all(&log_dir)?;
        Ok(FileLogger { log_dir })
    }

    /// Writes a log entry to today's log file.
    pub fn log(&self, level: &str, message: &str) -> anyhow::Result<()> {
        let now = chrono::Utc::now();
        let date_str = now.format("%Y-%m-%d").to_string();
        let timestamp = now.format("%Y-%m-%d %H:%M:%S%.3f").to_string();

        let log_file = self.log_dir.join(format!("deskcraft-{}.log", date_str));

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_file)?;

        writeln!(file, "[{}] [{}] {}", timestamp, level.to_uppercase(), message)?;

        Ok(())
    }

    /// Writes an info-level log entry.
    pub fn info(&self, message: &str) -> anyhow::Result<()> {
        self.log("INFO", message)
    }

    /// Writes a warning-level log entry.
    pub fn warn(&self, message: &str) -> anyhow::Result<()> {
        self.log("WARN", message)
    }

    /// Writes an error-level log entry.
    pub fn error(&self, message: &str) -> anyhow::Result<()> {
        self.log("ERROR", message)
    }

    /// Writes a debug-level log entry.
    pub fn debug(&self, message: &str) -> anyhow::Result<()> {
        self.log("DEBUG", message)
    }

    /// Cleans up log files older than the given number of days.
    pub fn cleanup_old_logs(&self, max_days: u32) -> anyhow::Result<u32> {
        let mut removed: u32 = 0;
        let cutoff = chrono::Utc::now() - chrono::Duration::days(max_days as i64);
        let cutoff_str = cutoff.format("%Y-%m-%d").to_string();

        if let Ok(entries) = fs::read_dir(&self.log_dir) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with("deskcraft-") && name.ends_with(".log") {
                    // Extract date part: "deskcraft-YYYY-MM-DD.log"
                    let date_part = &name[10..name.len() - 4];
                    if date_part < cutoff_str.as_str() {
                        if fs::remove_file(entry.path()).is_ok() {
                            removed += 1;
                        }
                    }
                }
            }
        }

        Ok(removed)
    }

    /// Returns the path to the log directory.
    pub fn log_dir(&self) -> &Path {
        &self.log_dir
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_logger_creates_file() {
        let temp = std::env::temp_dir().join("deskcraft_logger_test");
        let _ = fs::remove_dir_all(&temp);

        let logger = FileLogger::new(temp.to_str().unwrap()).unwrap();
        logger.info("Test log message").unwrap();

        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        let log_file = temp.join("logs").join(format!("deskcraft-{}.log", today));
        assert!(log_file.exists());

        let contents = fs::read_to_string(&log_file).unwrap();
        assert!(contents.contains("Test log message"));

        let _ = fs::remove_dir_all(&temp);
    }
}

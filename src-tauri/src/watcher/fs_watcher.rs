use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::{Arc, Mutex};

/// A filesystem event emitted by the watcher.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchEvent {
    pub kind: String,
    pub paths: Vec<String>,
}

/// Watches filesystem folders for changes using the `notify` crate.
pub struct FsWatcher {
    watcher: Arc<Mutex<Option<RecommendedWatcher>>>,
}

impl FsWatcher {
    /// Creates a new `FsWatcher`. Call `start()` to begin watching.
    pub fn new() -> Self {
        FsWatcher {
            watcher: Arc::new(Mutex::new(None)),
        }
    }

    /// Starts watching the given folders. File change events are sent through
    /// the returned `Receiver<WatchEvent>`.
    pub fn start(&self, folders: Vec<String>) -> anyhow::Result<Receiver<WatchEvent>> {
        let (tx, rx): (Sender<WatchEvent>, Receiver<WatchEvent>) = mpsc::channel();

        let event_tx = tx.clone();
        let watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
            match res {
                Ok(event) => {
                    let watch_event = WatchEvent {
                        kind: format!("{:?}", event.kind),
                        paths: event
                            .paths
                            .iter()
                            .map(|p| p.to_string_lossy().to_string())
                            .collect(),
                    };
                    if let Err(e) = event_tx.send(watch_event) {
                        log::warn!("Failed to send watch event: {}", e);
                    }
                }
                Err(e) => {
                    log::error!("Watch error: {}", e);
                }
            }
        })?;

        // Store the watcher so it isn't dropped
        {
            let mut w = self.watcher.lock().map_err(|e| anyhow::anyhow!("Lock error: {}", e))?;
            *w = Some(watcher);
        }

        // Add all watched paths
        {
            let mut w = self.watcher.lock().map_err(|e| anyhow::anyhow!("Lock error: {}", e))?;
            if let Some(ref mut watcher) = *w {
                for folder in &folders {
                    let path = Path::new(folder);
                    if path.exists() && path.is_dir() {
                        if let Err(e) = watcher.watch(path, RecursiveMode::NonRecursive) {
                            log::error!("Failed to watch folder '{}': {}", folder, e);
                        } else {
                            log::info!("Watching folder: {}", folder);
                        }
                    } else {
                        log::warn!("Folder does not exist or is not a directory: {}", folder);
                    }
                }
            }
        }

        Ok(rx)
    }

    /// Stops watching all folders by dropping the internal watcher.
    pub fn stop(&self) {
        if let Ok(mut w) = self.watcher.lock() {
            *w = None;
            log::info!("File watcher stopped");
        }
    }
}

impl Default for FsWatcher {
    fn default() -> Self {
        Self::new()
    }
}

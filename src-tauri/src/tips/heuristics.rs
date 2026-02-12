use std::fs;
use std::path::Path;

use crate::tips::engine::TipSuggestion;

/// Checks if a folder has too many items (desktop clutter).
/// Triggers if the folder contains more than 30 items.
pub fn check_desktop_clutter(path: &str) -> Option<TipSuggestion> {
    let dir = Path::new(path);
    if !dir.exists() || !dir.is_dir() {
        return None;
    }

    let count = match fs::read_dir(dir) {
        Ok(entries) => entries.count(),
        Err(_) => return None,
    };

    if count > 30 {
        Some(TipSuggestion {
            id: "tip_desktop_clutter".to_string(),
            title: "Pasta com muitos arquivos".to_string(),
            message: format!(
                "Esta pasta contém {} itens. Considere organizar seus arquivos em subpastas para melhor produtividade.",
                count
            ),
            action_label: "Organizar agora".to_string(),
            action_type: "organize_folder".to_string(),
        })
    } else {
        None
    }
}

/// Checks if a folder has accumulated too many PDF files.
/// Triggers if there are more than 10 PDF files.
pub fn check_pdf_accumulation(path: &str) -> Option<TipSuggestion> {
    let dir = Path::new(path);
    if !dir.exists() || !dir.is_dir() {
        return None;
    }

    let pdf_count = match fs::read_dir(dir) {
        Ok(entries) => entries
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.path()
                    .extension()
                    .map(|ext| ext.to_string_lossy().to_lowercase() == "pdf")
                    .unwrap_or(false)
            })
            .count(),
        Err(_) => return None,
    };

    if pdf_count > 10 {
        Some(TipSuggestion {
            id: "tip_pdf_accumulation".to_string(),
            title: "Acúmulo de PDFs detectado".to_string(),
            message: format!(
                "Foram encontrados {} arquivos PDF nesta pasta. Crie uma regra para organizá-los automaticamente.",
                pdf_count
            ),
            action_label: "Criar regra para PDFs".to_string(),
            action_type: "create_rule".to_string(),
        })
    } else {
        None
    }
}

/// Checks if a folder has accumulated installer files.
/// Triggers if there are more than 5 installer files (.exe, .msi, .dmg, .deb, .AppImage).
pub fn check_installer_pileup(path: &str) -> Option<TipSuggestion> {
    let dir = Path::new(path);
    if !dir.exists() || !dir.is_dir() {
        return None;
    }

    let installer_extensions = ["exe", "msi", "dmg", "deb", "appimage"];

    let installer_count = match fs::read_dir(dir) {
        Ok(entries) => entries
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.path()
                    .extension()
                    .map(|ext| {
                        let ext_lower = ext.to_string_lossy().to_lowercase();
                        installer_extensions.contains(&ext_lower.as_str())
                    })
                    .unwrap_or(false)
            })
            .count(),
        Err(_) => return None,
    };

    if installer_count > 5 {
        Some(TipSuggestion {
            id: "tip_installer_pileup".to_string(),
            title: "Instaladores acumulados".to_string(),
            message: format!(
                "Existem {} instaladores nesta pasta. Instaladores antigos podem ser removidos com segurança após a instalação.",
                installer_count
            ),
            action_label: "Limpar instaladores".to_string(),
            action_type: "cleanup_installers".to_string(),
        })
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_desktop_clutter_below_threshold() {
        let temp = std::env::temp_dir().join("deskcraft_heuristic_test_clutter");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&temp).unwrap();

        // Create 10 files (below threshold)
        for i in 0..10 {
            fs::write(temp.join(format!("file_{}.txt", i)), "data").unwrap();
        }

        let result = check_desktop_clutter(temp.to_str().unwrap());
        assert!(result.is_none());

        let _ = fs::remove_dir_all(&temp);
    }

    #[test]
    fn test_nonexistent_folder() {
        let result = check_desktop_clutter("/nonexistent/path/12345");
        assert!(result.is_none());
    }
}

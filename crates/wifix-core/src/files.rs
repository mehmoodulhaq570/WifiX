use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::models::FileInfo;
use crate::pin::has_file_pin;
use crate::WifixState;

pub fn allowed_file(filename: &str) -> bool {
    !filename.trim().is_empty()
}

pub fn safe_filename(filename: &str) -> String {
    let cleaned: String = filename
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-' | '_') {
                ch
            } else {
                '_'
            }
        })
        .collect();

    let cleaned = cleaned.trim_matches('.').trim_matches('_').to_string();
    if cleaned.is_empty() {
        "upload.bin".to_string()
    } else {
        cleaned
    }
}

pub fn resolve_upload_path(upload_dir: &Path, filename: &str) -> io::Result<PathBuf> {
    let upload_dir = upload_dir.canonicalize()?;
    let candidate = upload_dir.join(filename);
    let parent = candidate.parent().unwrap_or(&upload_dir);
    let parent = parent.canonicalize()?;

    if !parent.starts_with(&upload_dir) {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "file path escapes upload directory",
        ));
    }

    Ok(candidate)
}

pub fn list_files(state: &WifixState) -> io::Result<Vec<FileInfo>> {
    let upload_dir = state.upload_dir();
    let mut files = Vec::new();

    if !upload_dir.exists() {
        return Ok(files);
    }

    for entry in fs::read_dir(upload_dir)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        if !metadata.is_file() {
            continue;
        }

        let name = entry.file_name().to_string_lossy().to_string();
        let modified = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs());
        let mtime = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs_f64());
        let file_type = entry
            .path()
            .extension()
            .map(|extension| extension.to_string_lossy().to_ascii_lowercase())
            .unwrap_or_default();

        files.push(FileInfo {
            filename: name.clone(),
            url: format!("/download/{name}"),
            has_pin: has_file_pin(state, &name),
            name,
            size: metadata.len(),
            mtime,
            modified,
            r#type: file_type,
        });
    }

    files.sort_by(|a, b| b.modified.cmp(&a.modified));
    Ok(files)
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    #[test]
    fn safe_filename_keeps_common_file_name_characters() {
        assert_eq!(safe_filename("photo-01_final.png"), "photo-01_final.png");
    }

    #[test]
    fn safe_filename_replaces_unsafe_characters() {
        assert_eq!(safe_filename("../my file?.zip"), "my_file_.zip");
    }

    #[test]
    fn allowed_file_rejects_empty_names() {
        assert!(allowed_file("report.pdf"));
        assert!(!allowed_file(""));
        assert!(!allowed_file("   "));
    }

    #[test]
    fn list_files_returns_sorted_metadata() {
        let root = std::env::temp_dir().join(format!(
            "wifix-core-files-test-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("zeta.txt"), b"123").unwrap();
        fs::write(root.join("alpha.txt"), b"12345").unwrap();

        let state = WifixState::new(&root);
        let files = list_files(&state).unwrap();

        assert_eq!(files.len(), 2);
        assert!(files.iter().any(|file| {
            file.name == "alpha.txt"
                && file.filename == "alpha.txt"
                && file.size == 5
                && file.url == "/download/alpha.txt"
                && file.r#type == "txt"
        }));
        assert!(files.iter().any(|file| file.name == "zeta.txt"));

        fs::remove_dir_all(root).unwrap();
    }
}

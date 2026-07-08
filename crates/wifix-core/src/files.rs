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

        files.push(FileInfo {
            url: format!("/download/{name}"),
            has_pin: has_file_pin(state, &name),
            name,
            size: metadata.len(),
            modified,
        });
    }

    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(files)
}

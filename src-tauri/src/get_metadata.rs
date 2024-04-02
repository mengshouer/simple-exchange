use std::{fs, path::Path};

#[tauri::command]
pub fn get_file_metadata(path: &Path) -> Result<serde_json::Value, String> {
    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
    let file_type = metadata.file_type();
    let is_dir = file_type.is_dir();
    let is_file = file_type.is_file();
    let is_symlink = file_type.is_symlink();
    let size = metadata.len();
    let modified = metadata.modified().unwrap().elapsed().unwrap().as_secs();
    let created = metadata.created().unwrap().elapsed().unwrap().as_secs();
    let metadata = serde_json::json!({
      "is_dir": is_dir,
      "is_file": is_file,
      "is_symlink": is_symlink,
      "size": size,
      "modified": modified,
      "created": created,
    });
    Ok(metadata)
}

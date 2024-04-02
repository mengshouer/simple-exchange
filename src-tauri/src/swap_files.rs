use std::{fs, path::Path};

#[tauri::command]
pub fn swap_files(
    file1_path: &Path,
    file2_path: &Path,
    is_exchange_names: bool,
    is_exchange_suffixes: bool,
) -> (String, String) {
    let temp_file = tempfile::NamedTempFile::new().unwrap();
    let temp_path = temp_file.path();

    let file1_stem = file1_path.file_stem().unwrap();
    let file1_suffix = file1_path.extension().unwrap();
    let file2_stem = file2_path.file_stem().unwrap();
    let file2_suffix = file2_path.extension().unwrap();
    let file1_dir = file1_path.parent().unwrap();
    let file2_dir = file2_path.parent().unwrap();

    let mut file1_new_path = if is_exchange_names {
        file1_dir.join(file2_stem)
    } else {
        file1_dir.join(file1_stem)
    };

    let mut file2_new_path = if is_exchange_names {
        file2_dir.join(file1_stem)
    } else {
        file2_dir.join(file2_stem)
    };

    if is_exchange_suffixes {
        file1_new_path = file1_new_path.with_extension(file2_suffix);
        file2_new_path = file2_new_path.with_extension(file1_suffix);
    } else {
        file1_new_path = file1_new_path.with_extension(file1_suffix);
        file2_new_path = file2_new_path.with_extension(file2_suffix);
    }

    fs::copy(&file2_path, &temp_file).unwrap();
    fs::copy(&file1_path, &file2_new_path).unwrap();
    fs::copy(&temp_file, &file1_new_path).unwrap();
    fs::remove_file(temp_path).unwrap();
    if is_exchange_suffixes || is_exchange_names {
        fs::remove_file(file1_path).unwrap();
        fs::remove_file(file2_path).unwrap();
    }

    (
        file1_new_path.to_str().unwrap().to_string(),
        file2_new_path.to_str().unwrap().to_string(),
    )
}

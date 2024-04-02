// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod get_metadata;
mod mouse;
mod swap_files;

use get_metadata::get_file_metadata;
use mouse::get_cursor_in_left;
use once_cell::sync::OnceCell;
use swap_files::swap_files;

// Global AppHandle
pub static APP: OnceCell<tauri::AppHandle> = OnceCell::new();

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Global AppHandle
            APP.get_or_init(|| app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_cursor_in_left,
            swap_files,
            get_file_metadata
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

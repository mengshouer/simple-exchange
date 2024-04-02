use crate::APP;
use tauri::Manager;

fn get_mouse_position() -> (i32, i32) {
    use mouse_position::mouse_position::{Mouse, Position};

    let mouse_position = match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => Position { x, y },
        Mouse::Error => Position { x: 0, y: 0 },
    };

    (mouse_position.x, mouse_position.y)
}

fn get_tauri_window_info() -> (i32, i32, i32, i32) {
    let app_handle = APP.get().unwrap();

    match app_handle.get_window("main") {
        Some(window) => {
            let position = window.inner_position().unwrap();
            let dpi = window.scale_factor().unwrap();
            let x = (position.x as f64 / dpi) as i32;
            let y = (position.y as f64 / dpi) as i32;

            let size = window.inner_size().unwrap();
            let width = (size.width as f64 / dpi) as i32;
            let height = (size.height as f64 / dpi) as i32;

            (x, y, width, height)
        }
        None => (0, 0, 0, 0),
    }
}

#[tauri::command]
pub fn get_cursor_in_left() -> bool {
    let (mouse_x, _) = get_mouse_position();
    let (app_x, _, width, _) = get_tauri_window_info();
    mouse_x < (app_x + width / 2)
}

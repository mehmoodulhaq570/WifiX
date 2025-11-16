use tauri::Manager;
use std::process::{Command, Child};
use std::sync::Mutex;

struct BackendProcess(Mutex<Option<Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Start Python backend server
      let backend_process = start_backend();
      app.manage(BackendProcess(Mutex::new(backend_process)));

      Ok(())
    })
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { .. } = event {
        // Stop backend when window closes
        if let Some(backend) = window.app_handle().try_state::<BackendProcess>() {
          if let Ok(mut process) = backend.0.lock() {
            if let Some(mut child) = process.take() {
              let _ = child.kill();
            }
          }
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn start_backend() -> Option<Child> {
  // Always run Python directly from backend folder
  let backend_path = std::env::current_dir()
    .ok()?
    .parent()?.parent()?.parent()?
    .join("backend");
  
  println!("Starting backend from: {:?}", backend_path);
  
  Command::new("python")
    .arg("app.py")
    .current_dir(backend_path)
    .spawn()
    .ok()
}

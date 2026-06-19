use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::Manager;

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

            // Start Python backend server.
            let backend_process = start_backend(app);
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

fn start_backend(app: &tauri::App) -> Option<Child> {
    if let Some(child) = start_bundled_backend(app) {
        return Some(child);
    }

    start_python_backend(app)
}

fn start_bundled_backend(app: &tauri::App) -> Option<Child> {
    let backend_exe = app
        .path()
        .resource_dir()
        .ok()
        .map(|dir| dir.join("wifix-backend").join("wifix-backend.exe"))
        .filter(|path| path.exists())?;

    println!("Starting bundled WifiX backend: {:?}", backend_exe);

    Command::new(backend_exe).spawn().ok()
}

fn start_python_backend(app: &tauri::App) -> Option<Child> {
    let backend_path = app
        .path()
        .resource_dir()
        .ok()
        .map(|dir| dir.join("backend"))
        .filter(|path| path.exists())
        .or_else(dev_backend_path)?;

    println!("Starting Python WifiX backend from: {:?}", backend_path);

    Command::new("python")
        .args([
            "-m",
            "waitress",
            "--listen=0.0.0.0:5000",
            "--threads=100",
            "production:app",
        ])
        .current_dir(backend_path)
        .spawn()
        .ok()
}

fn dev_backend_path() -> Option<std::path::PathBuf> {
    std::env::current_dir()
        .ok()?
        .parent()?
        .parent()?
        .parent()
        .map(|path| path.join("backend"))
        .filter(|path| path.exists())
}

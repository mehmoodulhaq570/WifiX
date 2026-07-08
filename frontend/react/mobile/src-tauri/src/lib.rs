use std::sync::Mutex;
use std::time::Duration;

use tauri::Manager;

#[derive(Default)]
struct MobileBackendState {
  handle: Mutex<Option<wifix_server::ServerHandle>>,
}

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
      app.manage(MobileBackendState::default());
      start_mobile_backend(app)?;
      Ok(())
    })
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { .. } = event {
        let state = window.state::<MobileBackendState>();
        let mut backend = if let Ok(mut handle) = state.handle.lock() {
          handle.take()
        } else {
          None
        };
        if let Some(mut backend) = backend.take() {
          backend.shutdown();
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn start_mobile_backend(app: &tauri::App) -> tauri::Result<()> {
  let upload_dir = app
    .path()
    .app_data_dir()?
    .join("uploads");
  std::fs::create_dir_all(&upload_dir)?;

  let config = wifix_server::ServerConfig {
    host: "0.0.0.0".to_string(),
    port: 5000,
    upload_dir,
  };
  let (handle_tx, handle_rx) = std::sync::mpsc::channel();

  std::thread::spawn(move || {
    let runtime = match tokio::runtime::Builder::new_multi_thread()
      .enable_all()
      .build()
    {
      Ok(runtime) => runtime,
      Err(error) => {
        let _ = handle_tx.send(Err(format!("failed to create backend runtime: {error}")));
        return;
      }
    };

    runtime.block_on(async move {
      match wifix_server::serve_with_shutdown(config).await {
        Ok((handle, server)) => {
          let _ = handle_tx.send(Ok(handle));
          if let Err(error) = server.await {
            log::error!("WifiX mobile backend stopped with error: {error}");
          }
        }
        Err(error) => {
          let _ = handle_tx.send(Err(format!("failed to start backend: {error}")));
        }
      }
    });
  });

  match handle_rx.recv_timeout(Duration::from_secs(3)) {
    Ok(Ok(handle)) => {
      log::info!("WifiX mobile backend listening on {}", handle.addr);
      let state = app.state::<MobileBackendState>();
      {
        if let Ok(mut current_handle) = state.handle.lock() {
          *current_handle = Some(handle);
        };
      }
    }
    Ok(Err(error)) => {
      log::error!("{error}");
    }
    Err(error) => {
      log::error!("timed out waiting for WifiX mobile backend: {error}");
    }
  }

  Ok(())
}

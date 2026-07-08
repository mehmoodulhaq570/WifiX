use std::net::SocketAddr;
use std::path::PathBuf;

use axum::Router;
use thiserror::Error;
use tokio::net::TcpListener;
use tokio::sync::oneshot;

use crate::routes;
use wifix_core::WifixState;

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub upload_dir: PathBuf,
}

impl ServerConfig {
    pub fn new(upload_dir: impl Into<PathBuf>) -> Self {
        Self {
            host: "0.0.0.0".to_string(),
            port: 5000,
            upload_dir: upload_dir.into(),
        }
    }

    pub fn bind_addr(&self) -> Result<SocketAddr, ServerStartError> {
        format!("{}:{}", self.host, self.port)
            .parse()
            .map_err(ServerStartError::InvalidBindAddress)
    }
}

#[derive(Debug)]
pub struct ServerHandle {
    pub addr: SocketAddr,
    shutdown_tx: Option<oneshot::Sender<()>>,
}

impl ServerHandle {
    pub fn shutdown(&mut self) {
        if let Some(shutdown_tx) = self.shutdown_tx.take() {
            let _ = shutdown_tx.send(());
        }
    }
}

#[derive(Debug, Error)]
pub enum ServerStartError {
    #[error("invalid bind address")]
    InvalidBindAddress(#[source] std::net::AddrParseError),
    #[error("failed to bind HTTP server to {addr}")]
    Bind {
        addr: SocketAddr,
        #[source]
        source: std::io::Error,
    },
    #[error("HTTP server failed")]
    Serve(#[source] std::io::Error),
}

pub fn build_app(config: &ServerConfig) -> Router {
    let state = WifixState::new(&config.upload_dir);
    routes::app(state)
}

pub async fn serve(config: ServerConfig) -> Result<ServerHandle, ServerStartError> {
    serve_with_shutdown(config).await.map(|(handle, _)| handle)
}

pub async fn serve_with_shutdown(
    config: ServerConfig,
) -> Result<(ServerHandle, impl std::future::Future<Output = Result<(), ServerStartError>>), ServerStartError>
{
    let addr = config.bind_addr()?;
    let listener = TcpListener::bind(addr)
        .await
        .map_err(|source| ServerStartError::Bind { addr, source })?;
    let actual_addr = listener
        .local_addr()
        .map_err(|source| ServerStartError::Bind { addr, source })?;
    let app = build_app(&config);
    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();

    let server = async move {
        axum::serve(listener, app)
            .with_graceful_shutdown(async {
                let _ = shutdown_rx.await;
            })
            .await
            .map_err(ServerStartError::Serve)
    };

    Ok((
        ServerHandle {
            addr: actual_addr,
            shutdown_tx: Some(shutdown_tx),
        },
        server,
    ))
}

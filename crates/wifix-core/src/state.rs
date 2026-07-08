use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};

use crate::models::{ConnectionRequest, ConnectionStatus};

#[derive(Debug, Clone)]
pub struct WifixState {
    inner: Arc<RwLock<WifixStateInner>>,
}

#[derive(Debug)]
struct WifixStateInner {
    upload_dir: PathBuf,
    file_pins: HashMap<String, String>,
    host_sid: Option<String>,
    pending_connections: HashMap<String, ConnectionRequest>,
    connection_status: HashMap<String, ConnectionStatus>,
}

impl WifixState {
    pub fn new(upload_dir: impl Into<PathBuf>) -> Self {
        Self {
            inner: Arc::new(RwLock::new(WifixStateInner {
                upload_dir: upload_dir.into(),
                file_pins: HashMap::new(),
                host_sid: None,
                pending_connections: HashMap::new(),
                connection_status: HashMap::new(),
            })),
        }
    }

    pub fn upload_dir(&self) -> PathBuf {
        self.inner.read().expect("wifix state poisoned").upload_dir.clone()
    }

    pub fn set_host_sid(&self, sid: impl Into<String>) {
        self.inner.write().expect("wifix state poisoned").host_sid = Some(sid.into());
    }

    pub fn clear_host_sid(&self, sid: &str) {
        let mut inner = self.inner.write().expect("wifix state poisoned");
        if inner.host_sid.as_deref() == Some(sid) {
            inner.host_sid = None;
        }
    }

    pub fn host_sid(&self) -> Option<String> {
        self.inner.read().expect("wifix state poisoned").host_sid.clone()
    }

    pub fn insert_connection_request(&self, request: ConnectionRequest) {
        let mut inner = self.inner.write().expect("wifix state poisoned");
        inner
            .connection_status
            .insert(request.id.clone(), ConnectionStatus::Pending);
        inner.pending_connections.insert(request.id.clone(), request);
    }

    pub fn pending_connections(&self) -> Vec<ConnectionRequest> {
        self.inner
            .read()
            .expect("wifix state poisoned")
            .pending_connections
            .values()
            .cloned()
            .collect()
    }

    pub fn take_connection_request(&self, id: &str) -> Option<ConnectionRequest> {
        self.inner
            .write()
            .expect("wifix state poisoned")
            .pending_connections
            .remove(id)
    }

    pub fn set_connection_status(&self, id: impl Into<String>, status: ConnectionStatus) {
        self.inner
            .write()
            .expect("wifix state poisoned")
            .connection_status
            .insert(id.into(), status);
    }

    pub fn connection_status(&self, id: &str) -> ConnectionStatus {
        self.inner
            .read()
            .expect("wifix state poisoned")
            .connection_status
            .get(id)
            .cloned()
            .unwrap_or(ConnectionStatus::Unknown)
    }

    pub(crate) fn set_pin(&self, filename: String, pin: String) {
        self.inner
            .write()
            .expect("wifix state poisoned")
            .file_pins
            .insert(filename, pin);
    }

    pub(crate) fn remove_pin(&self, filename: &str) {
        self.inner
            .write()
            .expect("wifix state poisoned")
            .file_pins
            .remove(filename);
    }

    pub(crate) fn get_pin(&self, filename: &str) -> Option<String> {
        self.inner
            .read()
            .expect("wifix state poisoned")
            .file_pins
            .get(filename)
            .cloned()
    }
}

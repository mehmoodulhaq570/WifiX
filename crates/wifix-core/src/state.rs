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
    access_pin: Option<String>,
    event_revision: u64,
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
                access_pin: None,
                event_revision: 0,
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

    pub fn with_access_pin(self, pin: impl Into<String>) -> Self {
        let pin = pin.into();
        if !pin.trim().is_empty() {
            self.inner.write().expect("wifix state poisoned").access_pin = Some(pin);
        }
        self
    }

    pub fn pin_required(&self) -> bool {
        self.inner
            .read()
            .expect("wifix state poisoned")
            .access_pin
            .is_some()
    }

    pub fn verify_access_pin(&self, pin: &str) -> bool {
        match self
            .inner
            .read()
            .expect("wifix state poisoned")
            .access_pin
            .as_deref()
        {
            Some(expected_pin) => expected_pin == pin,
            None => true,
        }
    }

    pub fn event_revision(&self) -> u64 {
        self.inner
            .read()
            .expect("wifix state poisoned")
            .event_revision
    }

    pub fn touch_event(&self) -> u64 {
        let mut inner = self.inner.write().expect("wifix state poisoned");
        inner.event_revision = inner.event_revision.saturating_add(1);
        inner.event_revision
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
        inner.event_revision = inner.event_revision.saturating_add(1);
    }

    pub fn create_connection_request(&self, id: impl Into<String>, name: impl Into<String>) -> ConnectionRequest {
        let request = ConnectionRequest {
            id: id.into(),
            sid: None,
            name: name.into(),
        };
        self.insert_connection_request(request.clone());
        request
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

    pub fn respond_connection_request(
        &self,
        id: &str,
        status: ConnectionStatus,
    ) -> Option<ConnectionRequest> {
        let request = self.take_connection_request(id)?;
        self.set_connection_status(id.to_string(), status);
        Some(request)
    }

    pub fn set_connection_status(&self, id: impl Into<String>, status: ConnectionStatus) {
        let mut inner = self.inner.write().expect("wifix state poisoned");
        inner.connection_status.insert(id.into(), status);
        inner.event_revision = inner.event_revision.saturating_add(1);
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
        let mut inner = self.inner.write().expect("wifix state poisoned");
        inner.file_pins.insert(filename, pin);
        inner.event_revision = inner.event_revision.saturating_add(1);
    }

    pub(crate) fn remove_pin(&self, filename: &str) {
        let mut inner = self.inner.write().expect("wifix state poisoned");
        if inner.file_pins.remove(filename).is_some() {
            inner.event_revision = inner.event_revision.saturating_add(1);
        }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host_sid_can_be_set_and_cleared_by_owner() {
        let state = WifixState::new("uploads");

        state.set_host_sid("host-1");
        assert_eq!(state.host_sid().as_deref(), Some("host-1"));

        state.clear_host_sid("other");
        assert_eq!(state.host_sid().as_deref(), Some("host-1"));

        state.clear_host_sid("host-1");
        assert_eq!(state.host_sid(), None);
    }

    #[test]
    fn connection_requests_track_pending_and_decision_status() {
        let state = WifixState::new("uploads");
        let request = ConnectionRequest {
            id: "req-1".to_string(),
            sid: Some("client-1".to_string()),
            name: "Phone".to_string(),
        };

        state.insert_connection_request(request.clone());

        assert_eq!(state.connection_status("req-1"), ConnectionStatus::Pending);
        assert_eq!(state.pending_connections(), vec![request]);

        let taken = state.take_connection_request("req-1").unwrap();
        assert_eq!(taken.name, "Phone");
        state.set_connection_status("req-1", ConnectionStatus::Approved);

        assert!(state.pending_connections().is_empty());
        assert_eq!(state.connection_status("req-1"), ConnectionStatus::Approved);
        assert_eq!(state.connection_status("missing"), ConnectionStatus::Unknown);
    }

    #[test]
    fn connection_requests_can_be_created_and_answered() {
        let state = WifixState::new("uploads");

        let request = state.create_connection_request("req-2", "Tablet");

        assert_eq!(request.id, "req-2");
        assert_eq!(request.name, "Tablet");
        assert_eq!(state.connection_status("req-2"), ConnectionStatus::Pending);

        let answered = state
            .respond_connection_request("req-2", ConnectionStatus::Denied)
            .unwrap();

        assert_eq!(answered.name, "Tablet");
        assert_eq!(state.connection_status("req-2"), ConnectionStatus::Denied);
        assert!(state.pending_connections().is_empty());
    }

    #[test]
    fn optional_access_pin_can_be_verified() {
        let state = WifixState::new("uploads");
        assert!(!state.pin_required());
        assert!(state.verify_access_pin(""));

        let state = WifixState::new("uploads").with_access_pin("1234");
        assert!(state.pin_required());
        assert!(state.verify_access_pin("1234"));
        assert!(!state.verify_access_pin("0000"));
    }

    #[test]
    fn event_revision_increases_when_state_changes() {
        let state = WifixState::new("uploads");
        assert_eq!(state.event_revision(), 0);

        state.touch_event();
        assert_eq!(state.event_revision(), 1);

        state.create_connection_request("req-3", "Phone");
        assert_eq!(state.event_revision(), 2);

        state.set_connection_status("req-3", ConnectionStatus::Approved);
        assert_eq!(state.event_revision(), 3);
    }
}

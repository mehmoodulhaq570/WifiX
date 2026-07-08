use crate::WifixState;

pub fn set_file_pin(state: &WifixState, filename: impl Into<String>, pin: impl Into<String>) {
    let filename = filename.into();
    let pin = pin.into();
    if pin.trim().is_empty() {
        state.remove_pin(&filename);
    } else {
        state.set_pin(filename, pin);
    }
}

pub fn remove_file_pin(state: &WifixState, filename: &str) {
    state.remove_pin(filename);
}

pub fn has_file_pin(state: &WifixState, filename: &str) -> bool {
    state.get_pin(filename).is_some()
}

pub fn verify_file_pin(state: &WifixState, filename: &str, provided_pin: &str) -> bool {
    match state.get_pin(filename) {
        Some(expected_pin) => expected_pin == provided_pin.trim(),
        None => true,
    }
}

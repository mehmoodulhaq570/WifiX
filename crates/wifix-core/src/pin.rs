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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn files_without_pin_verify_successfully() {
        let state = WifixState::new("uploads");

        assert!(verify_file_pin(&state, "demo.txt", ""));
        assert!(!has_file_pin(&state, "demo.txt"));
    }

    #[test]
    fn files_with_pin_require_matching_pin() {
        let state = WifixState::new("uploads");

        set_file_pin(&state, "demo.txt", "1234");

        assert!(has_file_pin(&state, "demo.txt"));
        assert!(verify_file_pin(&state, "demo.txt", "1234"));
        assert!(verify_file_pin(&state, "demo.txt", " 1234 "));
        assert!(!verify_file_pin(&state, "demo.txt", "0000"));
    }

    #[test]
    fn empty_pin_removes_existing_pin() {
        let state = WifixState::new("uploads");

        set_file_pin(&state, "demo.txt", "1234");
        set_file_pin(&state, "demo.txt", "");

        assert!(!has_file_pin(&state, "demo.txt"));
        assert!(verify_file_pin(&state, "demo.txt", ""));
    }
}

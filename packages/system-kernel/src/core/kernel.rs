// system-kernel/src/core/kernel.rs
//
// System Kernel Core
// ------------------
// This module is the root authority of the system runtime.
// It enforces invariants, owns global state transitions,
// and guarantees deterministic, auditable behavior.
//
// This is NOT an OS kernel.
// It IS a production-grade coordination runtime suitable
// for regulated environments with human-in-the-loop control.

use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KernelMode {
    Booting,
    Normal,
    Maintenance,
    Degraded,
    Emergency,
    Shutdown,
}

#[derive(Debug)]
pub struct KernelState {
    pub mode: KernelMode,
    pub started_at: Instant,
    pub last_heartbeat: Instant,
}

impl KernelState {
    fn new() -> Self {
        let now = Instant::now();
        Self {
            mode: KernelMode::Booting,
            started_at: now,
            last_heartbeat: now,
        }
    }
}

#[derive(Debug)]
pub enum KernelError {
    InvalidTransition { from: KernelMode, to: KernelMode },
    EmergencyStop(String),
}

/// The Kernel is a singleton authority.
/// All other system components must interact
/// through explicit interfaces.
#[derive(Clone)]
pub struct Kernel {
    state: Arc<RwLock<KernelState>>,
}

impl Kernel {
    /// Initialize the kernel in BOOTING mode.
    pub fn initialize() -> Self {
        Kernel {
            state: Arc::new(RwLock::new(KernelState::new())),
        }
    }

    /// Returns the current kernel mode.
    pub fn mode(&self) -> KernelMode {
        self.state.read().unwrap().mode
    }

    /// Heartbeat must be called periodically by the system runtime.
    /// Missing heartbeats will trigger degradation elsewhere.
    pub fn heartbeat(&self) {
        let mut state = self.state.write().unwrap();
        state.last_heartbeat = Instant::now();
    }

    /// Transition kernel mode with strict validation.
    pub fn transition(&self, next: KernelMode) -> Result<(), KernelError> {
        let mut state = self.state.write().unwrap();
        let current = state.mode;

        if !Self::valid_transition(current, next) {
            return Err(KernelError::InvalidTransition {
                from: current,
                to: next,
            });
        }

        state.mode = next;
        Ok(())
    }

    /// Emergency stop halts the system immediately.
    /// This is intentionally irreversible without restart.
    pub fn emergency_stop(&self, reason: &str) -> Result<(), KernelError> {
        let mut state = self.state.write().unwrap();
        state.mode = KernelMode::Emergency;
        Err(KernelError::EmergencyStop(reason.to_string()))
    }

    /// Valid kernel mode transitions.
    fn valid_transition(from: KernelMode, to: KernelMode) -> bool {
        use KernelMode::*;

        matches!(
            (from, to),
            (Booting, Normal)
                | (Normal, Maintenance)
                | (Maintenance, Normal)
                | (Normal, Degraded)
                | (Degraded, Maintenance)
                | (Degraded, Emergency)
                | (Normal, Shutdown)
                | (Maintenance, Shutdown)
        )
    }

    /// Returns uptime in seconds.
    pub fn uptime(&self) -> Duration {
        let state = self.state.read().unwrap();
        Instant::now() - state.started_at
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_transitions() {
        let k = Kernel::initialize();
        assert_eq!(k.mode(), KernelMode::Booting);
        assert!(k.transition(KernelMode::Normal).is_ok());
        assert!(k.transition(KernelMode::Maintenance).is_ok());
    }

    #[test]
    fn test_invalid_transition() {
        let k = Kernel::initialize();
        let res = k.transition(KernelMode::Shutdown);
        assert!(res.is_err());
    }

    #[test]
    fn test_emergency_stop() {
        let k = Kernel::initialize();
        let res = k.emergency_stop("test");
        assert!(res.is_err());
        assert_eq!(k.mode(), KernelMode::Emergency);
    }
}

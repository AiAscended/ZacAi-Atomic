// system-kernel/src/core/clock.rs
//
// System Clock Authority
// ----------------------
// Provides deterministic time services for the entire system.
// Combines a monotonic clock (ordering & safety) with wall clock
// (audit, compliance, human interpretation).
//
// Guarantees:
// - Monotonic time never goes backwards
// - Drift detection against wall clock
// - Explicit failure signaling (never silent)

use std::time::{Duration, Instant, SystemTime};

#[derive(Debug)]
pub struct Clock {
    boot_instant: Instant,
    boot_wall: SystemTime,
    max_drift: Duration,
}

#[derive(Debug)]
pub enum ClockError {
    WallClockDriftExceeded {
        drift: Duration,
        max_allowed: Duration,
    },
    WallClockUnavailable,
}

impl Clock {
    /// Initialize clock at system boot.
    pub fn initialize(max_drift: Duration) -> Self {
        Self {
            boot_instant: Instant::now(),
            boot_wall: SystemTime::now(),
            max_drift,
        }
    }

    /// Monotonic uptime since boot.
    /// This value is safe for ordering and scheduling.
    pub fn monotonic_uptime(&self) -> Duration {
        Instant::now() - self.boot_instant
    }

    /// Wall clock time derived from boot reference.
    /// Used ONLY for audit, logs, and external interfaces.
    pub fn wall_time(&self) -> Result<SystemTime, ClockError> {
        let elapsed = self.monotonic_uptime();
        self.boot_wall
            .checked_add(elapsed)
            .ok_or(ClockError::WallClockUnavailable)
    }

    /// Check drift between computed wall time and actual system wall clock.
    /// Returns error if drift exceeds allowed threshold.
    pub fn check_drift(&self) -> Result<(), ClockError> {
        let expected = self.wall_time()?;
        let actual = SystemTime::now();

        let drift = match expected.duration_since(actual) {
            Ok(d) => d,
            Err(e) => e.duration(),
        };

        if drift > self.max_drift {
            return Err(ClockError::WallClockDriftExceeded {
                drift,
                max_allowed: self.max_drift,
            });
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn monotonic_never_decreases() {
        let clock = Clock::initialize(Duration::from_secs(5));
        let t1 = clock.monotonic_uptime();
        std::thread::sleep(Duration::from_millis(5));
        let t2 = clock.monotonic_uptime();
        assert!(t2 >= t1);
    }

    #[test]
    fn wall_time_progresses() {
        let clock = Clock::initialize(Duration::from_secs(5));
        let t1 = clock.wall_time().unwrap();
        std::thread::sleep(Duration::from_millis(5));
        let t2 = clock.wall_time().unwrap();
        assert!(t2 > t1);
    }
}

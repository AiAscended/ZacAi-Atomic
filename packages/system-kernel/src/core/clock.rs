pub fn wall_clock() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let start = SystemTime::now();
    start.duration_since(UNIX_EPOCH).unwrap().as_secs()
}

pub fn monotonic_clock() -> u64 {
    use std::time::Instant;
    Instant::now().elapsed().as_secs()
}

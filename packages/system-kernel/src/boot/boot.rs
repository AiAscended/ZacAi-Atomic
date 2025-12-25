use crate::core::kernel::Kernel;

pub fn boot_sequence() {
    let kernel = Kernel::new();
    println!("Starting boot sequence...");
    kernel.boot();
}

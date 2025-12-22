---
applyTo: "packages/zacai-rust-engines/**"
---

# Rust Engines & WASM Rules

- This package hosts Rust code compiled to WebAssembly and native binaries where needed.
- Requirements:
  - Separate core logic crates from FFI/binding crates.
  - WASM modules must expose minimal, well‑typed APIs (JSON or protobuf schemas).
  - Provide TypeScript bindings in `src/bindings/` with strict types and runtime validation.

When generating code:

- Prefer modern Rust patterns (edition 2024+, `Result`‑based errors, `?` operator).
- Avoid unsafe code unless explicitly justified with comments and tests.
- Ensure WASM modules degrade gracefully: provide TS stubs or fallbacks when module is unavailable.

---
name: add-rust-wasm-engine
description: Add or update a Rust+WASM engine and its TypeScript bindings for ZacAi.
mode: chat
---

You are integrating a **Rust+WASM engine** into ZacAi.

Steps:

1. Ask which package to use (typically `packages/zacai-rust-engines`).
2. Design:
   - Rust crate structure (core logic crate, wasm wrapper crate).
   - Public functions and data types.
   - WASM build pipeline and output layout.
3. Generate:
   - Rust code with idiomatic patterns and robust error handling.
   - WASM export wrapper and build config.
   - TypeScript bindings with runtime validation and tests.
4. Wire into ZacAi:
   - Show where it plugs into kernel, models, or agents.
   - Provide example usage in `apps/*/src/ai/` if applicable.

Ensure:
- No blocking or heavy CPU in React/Next.js UI threads.
- Clear fallbacks if WASM module cannot load.

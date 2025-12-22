# ZacAi Model Coding Transformer

## Overview
The Coding Transformer package implements ZacAi's advanced code understanding, generation, and transformation model. Built in Rust/WASM for performance, it powers developer and agent workflows with deep code intelligence.

## Key Features
- Code-aware tokenization and parsing
- Transformer-based code modeling (Rust/WASM core)
- Code generation, refactoring, and transformation
- Seamless integration with orchestrator, chat UI, and agent pipelines
- Support for multiple programming languages

## Architecture
- **Rust/WASM Core:** High-performance transformer model for code
- **TypeScript Bindings:** For integration with ZacAi orchestrator and UI
- **Plugin System:** Extendable for new languages and code tasks

## Integration Points
- **Orchestrator:** Used for code analysis, generation, and review
- **Chat UI:** Enables code completion and refactoring suggestions
- **Agent Workflows:** Powers automated code transformation and migration

## File Structure Reference
- `src/transformer.rs` – Core Rust transformer logic
- `src/bindings.ts` – WASM/TypeScript integration
- `src/plugins/` – Language/task plugins

## Best Practices
- Use WASM bindings for performance-critical code tasks
- Register new plugins for additional language support
- Follow secure code transformation guidelines

## Further Reading
- [Code Transformer Design](../../docs/model-coding-transformer/Design.md)
- [Integration Guide](../../docs/PLUGIN_ARCHITECTURE.md)

# ZacAi Shared Modules

## Overview
This package contains shared TypeScript modules, utilities, and types used across all ZacAi packages. It ensures consistency, code reuse, and best practices throughout the monorepo.

## Key Features
- Common types and interfaces for all subsystems
- Utility functions for data processing, validation, and more
- Tokenizers, memory managers, and helpers
- Centralized error handling and logging utilities

## Architecture
- **TypeScript Core:** Shared logic and types
- **Utility Modules:** For common operations and helpers
- **Type Definitions:** For cross-package compatibility

## Integration Points
- **All Packages:** Used for type safety and code reuse
- **Orchestrator:** Shared logic for agent/model integration
- **Pipelines:** Common utilities for workflow management

## File Structure Reference
- `src/types.ts` – Common types and interfaces
- `src/utils/` – Utility functions and helpers
- `src/tokenizer.ts` – Tokenization logic
- `src/memory.ts` – Shared memory management

## Best Practices
- Use shared types for cross-package compatibility
- Register new utilities for common tasks
- Maintain clear documentation for all shared modules

## Further Reading
- [Shared Module Design](../../docs/shared/Design.md)
- [TypeScript Best Practices](../../docs/IDE_TECHNICAL_DOCS.md)

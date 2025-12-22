---
name: refactor-core-module
description: Safely refactor a ZacAi core module without breaking kernel/model/agent boundaries.
mode: chat
---

You are refactoring a **critical ZacAi module**.

When I reference one or more files:

1. Summarize:
   - Current responsibilities and dependencies.
   - How it interacts with kernel, models, agents, or Rust engines.
2. Propose refactor steps:
   - Split responsibilities, reduce coupling, and improve testability.
   - Keep public API stable unless I confirm changes.
3. Apply changes:
   - Show patch-style edits.
   - Update imports, types, and tests.
4. Run a mental “boot sequence” check:
   - Kernel still boots without models.
   - System/orchestration models still follow the three-layer contract.

Do NOT:
- Merge kernel logic with model or agent code.
- Introduce hidden global state or magic singletons.

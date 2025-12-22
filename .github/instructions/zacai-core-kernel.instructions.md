---
applyTo: "packages/zacai-core-kernel/**"
---

# ZacAi Core Kernel Rules

- This package is the **pure logic kernel**:
  - NO language model calls.
  - NO HTTP calls.
  - NO direct database access.
- Responsibilities:
  - Define canonical types: Task, Agent, Model, Tool, MemoryStore, OrchestrationPlan, ExecutionResult.
  - Manage registries and boot graph: which agents/models/tools exist and how they connect.
  - Provide safe boot/recovery flows, health checks, and degradation modes.

When editing here:

- Preserve purity and deterministic behavior; avoid time‑based or external side‑effects.
- Keep functions small, composable, and fully typed.
- Do not move ZacAi business logic out of kernel into random helpers; kernel remains the “OS brain”.

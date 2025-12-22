---
applyTo: "packages/zacai-orchestration-model/**"
---

# Orchestration Model Rules

- This package integrates the **OrchestrationModel LM**:
  - Foreground user workflows.
  - HCO / agent coordination for coding, inference, and operations.
- Must:
  - Always check system/kernel status before executing heavy flows.
  - Defer infrastructure decisions (GPU, memory, scaling) to kernel + system model.

When editing:

- Keep workflow orchestration explicit and inspectable (no hidden chains).
- Make it easy to trace: which agents are called, in what order, under what conditions.

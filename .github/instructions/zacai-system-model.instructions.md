---
applyTo: "packages/zacai-system-model/**"
---

# System Model Rules

- This package integrates the **SystemModel LM** (system engineer):
  - Long‑horizon reasoning about health, resources, and optimization.
  - Self‑diagnostics, anomaly detection, recovery planning.
- It calls into the kernel APIs but does not re‑implement them.

When generating code:

- Keep LM interactions in narrow, well‑typed adapters (prompt builders, response mappers).
- Always validate LM output and keep clear separation between “text” and typed commands.

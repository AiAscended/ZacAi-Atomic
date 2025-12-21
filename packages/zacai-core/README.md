# @zacai/core

Minimal, harden-first system kernel/model/agent package for ZacAi.

## Responsibilities
- Serve system health and recovery information even when other models are offline.
- Maintain persisted kernel state (profile, stable branch, backup path, timestamps).
- Emit structured audit logs for actions (boot, health checks, recovery planning, profile switches).
- Provide deterministic recovery plans and profile control without external services.

## Notes
- No heavy dependencies; file-based state and logs under `packages/zacai-core/data`.
- Health checks are deterministic (fs presence); git/backup actions can be added later behind guardrails.
- API adapters should validate and auth at the edge; kernel stays logic-only.

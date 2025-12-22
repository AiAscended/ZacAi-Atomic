# ZacAi Core Kernel

## Overview
This package provides the minimal, harden-first system kernel, model, and agent logic for ZacAi. It is responsible for deterministic health, audit, recovery, and state management, and serves as the backbone for all ZacAi subsystems.

## Key Features
- Deterministic system health and recovery
- Persisted kernel state (profile, stable branch, backup path, timestamps)
- Structured audit logs for all actions (boot, health checks, recovery, profile switches)
- Deterministic recovery plans and profile control
- No heavy dependencies; file-based state and logs

## Architecture
- **TypeScript Core:** Kernel logic and state management
- **File-Based Storage:** For state and audit logs
- **API Adapters:** For edge validation and authentication

## Integration Points
- **All Subsystems:** Register with the kernel for orchestration and monitoring
- **Orchestrator:** Health, audit, and recovery integration
- **Memory:** State and profile management

## File Structure Reference
- `src/kernel.ts` – Core kernel logic
- `src/state.ts` – State management
- `src/audit.ts` – Audit and logging
- `data/` – Persisted state and logs

## Best Practices
- Register all new modules with the kernel
- Use file-based storage for reliability
- Maintain clear separation between kernel and API logic

## Further Reading
- [Kernel Design](../../docs/ZacAi-Core/Detailed%20Readme%20example.md)
- [System Architecture](../../docs/IDE_TECHNICAL_DOCS.md)

## Production-Grade Restoration & Self-Healing

This kernel implements world-class, enterprise-grade system management, diagnostics, and self-restoration. It is designed to:
- Boot and restore all critical modules in priority order
- Run health checks, diagnostics, and auto-recovery
- Maintain always-online UI/dev console/chatwindow in maintenance mode
- Expose system status, audit logs, and recovery plans to all subsystems
- Hardened for reliability, security, and compliance

## Critical Files
- `src/system-registry.json`: Blueprint of all core modules and boot order
- `src/registries/module-registry.ts`: Scans modules, reports status
- `src/module-config/`: Per-module boot scripts and tests
- `src/revival/memory.ts`: Memory restoration logic
- `src/heartbeat.ts`: System clock and uptime tracking
- `src/diagnostics/Diagnostics.ts`: Diagnostics, auto-recovery, maintenance mode
- `src/tests/critical-boot-order.test.ts`: Boot order and restoration tests

## Boot Sequence
1. Kernel loads system-registry.json
2. Scans modules via module-registry
3. Runs boot scripts in priority order
4. Exposes status to UI/dev console
5. Auto-recovers and logs all actions

## Maintenance Mode
- UI/dev console/chatwindow always online
- System status and diagnostics exposed
- Auto-recovery for degraded/offline modules

## World-Class Standards
- File-based state and logs for reliability
- Registry-aware retries/backoff
- Structured status for UI/admin
- Hardened for production, security, and compliance

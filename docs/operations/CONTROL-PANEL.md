# Control Panel (Dashboard) — Draft

This document describes the Control Panel UI for ZacAi System Core and lists developer/ admin settings that should be surfaced.

Status: Draft — created 2025-12-26

## Goals
- Keep existing visual style and color scheme.
- Preserve all current data and quick-actions (v1 snapshot saved).
- Add control features: terminal, AI assistant, voice controls, dark/light toggle (preserve default), and more detailed diagnostics.
- Surface developer settings useful for operators and dev teams.

## Files saved as -v1
- `apps/web/server-v1.js` (exact backup of current dashboard entrypoint)

## Control Panel Sections
1. Header
   - Product title and system admin contact (already present)
   - Theme toggle (Light/Dark)
   - Quick controls (clear terminal)

2. Status Overview (left column)
   - System Status (RUNNING / SAFE / SHUTDOWN)
   - System Mode (RUN/SAFE)
   - Uptime
   - Success Rate / Error Count
   - Quick Actions: Check Health, Run Diagnostics, Compliance Snapshot

3. Right Column (AI + Terminal)
   - AI Assistant chat box
     - Input text box, Send button
     - Microphone (start voice), Speaker (stop/listen) placeholders
     - AI suggestion area (actionable suggestions, commands)
   - Terminal
     - Live log stream area
     - Accept basic shell commands (placeholder via backend job runner in future)

4. Compliance & Audit
   - Compliance level (HIPAA) and recent events
   - Link to full compliance report

5. System Architecture & Details
   - Kernel modules active
   - Package versions
   - WASM artifacts (hashes)

## Developer / Admin Settings to Surface
- `ADMIN_EMAIL` — system admin contact
- `DASHBOARD_PORT` — port for web dashboard
- `LOG_LEVEL` — debug/info/warn/error
- `TICK_INTERVAL_MS` — kernel heartbeat
- `MAX_RETRIES` — recovery retry count
- `RECOVERY_MODE` — conservative / aggressive
- `COMPLIANCE_LEVEL` — HIPAA/FDA/SOC2/ISO27001
- `ALERT_THRESHOLD` — percentage for degraded alerts
- `ENABLE_VOICE` — true/false
- `ENABLE_AI_AUTOMATION` — true/false
- `MAINTENANCE_WINDOW` — scheduled downtime window
- `AUTO_REPAIR` — allow automatic safe repairs (true/false)
- `HISTORY_WINDOW_DAYS` — metrics retention window

## Suggested Control Actions (Quick Actions)
- Start/Stop kernel
- Trigger diagnostics
- Roll forward/rollback config (via scripted CI)
- Export compliance snapshot (JSON/CSV)
- Download WASM artifact
- Run isolation tests (chaos testing)
- Trigger self-repair scripts (Phase 6)

## Future Enhancements by Phase
- Phase 7: `system-core-agent` integration — AI-driven recommendations and automated safe actions.
- Phase 9: Enterprise features — RBAC, multi-tenant, audit scoping, policy manager.
- Phase 8: Production hardening — controls for load-testing, rolling upgrades, failover.
- Phase 6: Self-diagnostics & self-repair scripts — one-click recovery with safety confirmations.

## UX Notes
- Preserve default color scheme; implement theme toggle that respects current palette as default.
- Ensure accessibility (contrast ratios) for new terminal and chat areas.
- Keep quick actions inline and show results in the right-panel to avoid navigation away from dashboard.

## Implementation notes
- The UI additions are front-end placeholders; backend endpoints (`/api/diagnostics`, `/api/ai`, `/api/terminal`) should be implemented to provide real functionality.
- Voice support requires microphone capture and a server-side speech-to-text or cloud STT integration.
- Terminal execution must be sandboxed and authenticated; do not allow arbitrary shell execution without RBAC and audit trails.

---

**Next step**: Implement server endpoints and agent integration for Phase 7 (`system-core-agent`) and Phase 9 enterprise controls. Manual review of this draft is recommended before enforcement.

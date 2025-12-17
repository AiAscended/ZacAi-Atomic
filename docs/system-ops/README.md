# System Reactivation & Recovery Playbook

This README documents how we are bringing the ZacAi maintenance core back online after the maintenance freeze. It captures the priorities, verification sequence, self-diagnostic expectations, and the dual-backup memory policy requested for the resurrected system.

## 1. Critical Path Bring-Up Order
1. **Frontend Shell** – `npm run dev` must render the public shell without runtime errors. Sanity checks cover route boot, layout hydration, and log streaming to the browser console.
2. **Admin Console** – `/admin` must hydrate, accept maintenance overrides, and POST to `/api/admin/system/heartbeat` using prompt-only payloads. We will ship Vitest coverage for the route handler plus Playwright smoke tests for admin UI actions.
3. **Developer Console** – Admin-only internal terminal should connect to the orchestrator WebSocket, stream command output, and record transcripts in the maintenance log store.
4. **Prompt Pipeline** – `/api/chat` must accept a minimal `{ prompt }` body, execute through `systemModel → kernel → inference`, and respond with system language that reflects live telemetry.

Every stage above requires:
- A **self-diagnostic test** (unit + integration) that can run headless via CI.
- **Structured logging** into the maintenance log channel.
- **Self-heal hooks** so the system agent can revert, re-run, or escalate when a stage fails.

## 2. System Agent + Kernel Expectations
- The `SystemAgent` runs in maintenance-first mode and leverages the `systemModel` vocabulary + weights (no placeholders). We will feed it the ZacAi-specific seeds, XML/YAML instruction packs, and architecture-aware embeddings tracked under `data/`.
- Kernel bring-up requires deterministic boot snapshots plus a `systemModel.registerComponent` contract so agents, inference engines, and the admin console read the same truth.
- Each activated module must deposit a `{module}.spec.ts` test and a `{module}.diagnostics.ts` helper so the self-healing loop can trigger a targeted check/revert.

## 3. Internal Memory & Backup Policy
```
internal-memory/
  stable/   # Last known stable working tree (mirrors "stable" git branch, read/write by maintenance only)
  backup/   # Locked admin-only snapshot, mirrors admin-approved branch, never mutated automatically
  vector/   # pgvector/FAISS indexes that map file embeddings + instruction schemas
```
- The live workspace always writes to the `stable/` mirror after a successful diagnostic run.
- On failure, the system agent first attempts `stable/` rollback; if checksums mismatch it escalates to the locked `backup/` mirror.
- Vector stores persist embeddings for: code files, READMEs, YAML/XML instruction packs, and orchestrator configs so that autop-run fixes have semantic context.

## 4. Documentation Organization
Loose Markdown files have been grouped into category folders (`admin-ops`, `audits`, `architecture`, `implementation`, `interfaces`, `ide`, `memory`, `orchestration`, `plugins`, `seed`, `system-ops`). Each folder now requires a README that explains its scope and how it participates in the system reactivation plan; this document is the first of those READMEs.

## 5. Next Operational Steps
- Finish updating the `/api/admin/system/heartbeat` handler + tests so admin prompt POSTs succeed.
- Scaffold the dual-model kernel (SystemModel + OrchestrationModel) and ensure inference weights + vocab are available locally.
- Stand up the internal memory mirrors and enforce checksum validation hooks inside the self-healing loop.
- Add READMEs/tests for the remaining doc folders as their respective modules come online.

This playbook should be treated as the canonical reference while we bring each “cell / module / organ system” back from maintenance mode to full operation.

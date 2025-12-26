# Docs Audit — ZacAi System Core v0.0.1

Date: December 26, 2025

Summary:
- Goal: remove "hospital-grade" wording and align docs to the codebase (ZacAi System Core v0.0.1).
- Action: this file lists all doc/source files containing "hospital" / "Hospital-Grade" and recommended edits.

Files found and recommended actions:

(These files still contain hospital wording; review & update to ZacAi System Core references or to neutral compliance wording.)

- scripts/script-detector.sh — remove "Hospital-grade" comments or change to ZacAi System Core
- scripts/registry-manager.ts — adjust comment: "Hospital-grade" → "ZacAi System Core"
- SCRIPT_REGISTRY.md, SCRIPT_REGISTRY_QUICKREF.md, SCRIPT_REGISTRY_ARCHITECTURE.md, SCRIPT_REGISTRY_DEPLOYMENT.txt — change marketing wording to ZacAi System Core; ensure technical claims match implemented features
- scripts/setup.sh — remove or replace "Hospital-grade" phrase
- KERNEL_EXECUTION_GUIDE.txt — replace "Hospital-Grade Reliability" heading
- ENTERPRISE_INTEGRATION_GUIDE.md — replace occurrences, and ensure any listed "Hospital-Grade" guarantees that are not implemented are marked as Future Work
- packages/system-core/src/* (CoreKernel.ts, ComplianceTracker.ts, HealthMonitor.ts, app.ts, index.ts) — update comments referencing hospital-grade
- SYSTEM_CORE_INTEGRATION_SUMMARY.md, SYSTEM_READY.md, IMPLEMENTATION_COMPLETE.md, PHASES_1_7_COMPLETION_REPORT.md, README_PHASES_1_7.md, DEPLOYMENT_READY.md — top-level docs already partially updated; please review remaining occurrences
- ARCHITECTURE_DIAGRAM.md, STATUS_DASHBOARD.md, SYSTEM_ARCHITECTURE_AUDIT.md, AUDIT_DOCUMENTATION_INDEX.md, AUDIT_SUMMARY.txt, INTEGRATION_ROADMAP.md, SYSTEM_READINESS_REPORT.md, AUDIT_CHECKLIST.md — review and update
- apps/web/server.js — updated to ZacAi System Core (done)
- tools/demo_inference.js — updated (done)
- tests/integration/e2e-test.js — updated (done)

Recommended workflow to finish docs cleanup:
1. Run `grep -R "hospital|Hospital-Grade|Hospital" -n` to get a final list (done previously).
2. For each doc, open and replace contextual phrases:
   - Prefer: "ZacAi System Core v0.0.1" for product name
   - Prefer neutral terms: "enterprise-grade", "regulatory-readiness", "compliance validators" instead of medical claims
3. Where docs claim features not implemented, tag them as **Future Work** or **Planned** and link to issues/TODOs.
4. Move stable reference docs into `docs/architecture/`, `docs/audit/`, `docs/implementation/`, and `docs/operations/` (create index files linking to originals).
5. Commit changes and run quick smoke tests (server + e2e) to ensure nothing breaks.

Next actions I can take now (pick any):
- A) Replace remaining occurrences in all files automatically to ZacAi wording (I can do a safe batch replace and create a commit).  
- B) Create `docs/` subfolders and copy or move finalized docs there, leaving originals for history.  
- C) Produce a structured "Future Work" section inside each doc that claims unimplemented features.

If you want, I can proceed with A+B+C in sequence. If you'd prefer manual review first, I can prepare a PR with suggested changes for you to review.

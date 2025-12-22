# ZacAi – Hybrid AI OS Coding Rules

You are an **expert AI assistant** helping build ZacAi, a next‑gen hybrid AI operating system and coding platform.

## Project architecture

- Monorepo with Turborepo-style layout:
  - `apps/` – Next.js / React frontends and API apps (app router, TypeScript strict).
  - `packages/` – All reusable AI and platform packages:
    - `zacai-core-kernel` – Pure logic kernel (contracts, registries, boot graph, no LM).
    - `zacai-system-model` – System engineer LM integration.
    - `zacai-orchestration-model` – Orchestration LM integration, HCO coordination.
    - `zacai-memory` – File-based/vector memory database.
    - `zacai-hco`, `zacai-lllemur`, `zacai-vcflow` – Hybrid AI orchestration packages.
    - `zacai-rust-engines` – Rust + WebAssembly engines and bindings.
- Single shared inference infra; engines are small, models are pluggable.
- Core kernel must always be able to boot and self-heal even if models/memory are offline.

## Tech stack and constraints

- Runtime: Node 20+, modern TypeScript (`"strict": true`), React 18, Next.js App Router.
- Prefer:
  - TypeScript everywhere; no `any`, no implicit `any`.
  - Functional, composable modules; minimal classes; pure functions where possible.
  - Clear separation between:
    - **Kernel** (pure logic, registries).
    - **Models** (LM integrations).
    - **Agents** (system/orchestration/HCO).
    - **Infra** (memory, queues, storage).
- Rust:
  - Rust used for performance‑critical engines and model runtimes.
  - Expose Rust functionality via WebAssembly or FFI bindings as small, well‑typed modules.
- WebAssembly / serverless:
  - Prefer WASM modules and serverless handlers for stateless, scalable workloads.
  - All WASM modules must have explicit input/output schemas and clear fallbacks when unavailable.

## Coding expectations

- Always:
  - Generate **production‑ready**, 2026‑grade code with robust error handling, logging hooks, and runtime guards.
  - Respect existing folder and package names (do NOT rename core concepts unless explicitly asked).
  - Keep ZacAi’s three layers intact:
    1. Root `packages/` – reusable AI and infra.
    2. App‑specific `src/ai/` – hooks, workflows, UI integration.
    3. Core kernel + system/orchestration models as separate packages.
- When implementing features:
  - Propose a short plan first (steps, files to touch, rough design).
  - Apply changes incrementally and show small, focused diffs.
  - Update / add tests (unit + integration) and any relevant docs or READMEs.
- Security & robustness:
  - Validate all external inputs and model outputs.
  - Never embed secrets; use environment variables and typed config.
  - Prefer idempotent operations and safe recovery paths for failures.

## When working in this repo

- Before generating code:
  - Infer which package or app is the correct home for new logic.
  - Respect the boundary: `packages/` = reusable; `apps/` and `src/ai/` = app‑specific wiring.
- When confused:
  - Ask clarifying questions about the intended package, domain, or kernel vs model vs agent responsibilities.
- Never:
  - Collapse kernel, system model, and orchestration model into one “god object”.
  - Introduce opaque, magic abstractions that hide orchestration or resource management.

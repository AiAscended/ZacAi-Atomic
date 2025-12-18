# ZacAi Hybrid Cognitive Orchestrator (HCO)

## Executive Brief

ZacAi HCO is a production-oriented hybrid cognitive pipeline that coordinates seven purpose-built agents across three reasoning phases. The orchestrator is a pure TypeScript state machine that keeps inference deterministic, auditable, and hot-swappable. Each agent exposes JSON outputs, can be retried automatically (100 ms, 500 ms, 2000 ms), and consumes shared prompt templates to keep behavior consistent.

Key guarantees:

- **Psychological grounding** combining Piaget (induction/assimilation), Aristotle (formal logic), and Vygotsky (debate-driven synthesis).
- **Production readiness** with Supabase vector persistence, Vercel deployment profile, and OVHcloud GPU orchestration via Docker Compose.
- **Observability** through explicit `HCOState` snapshots pushed to Supabase (last 10 persisted trajectories) and deterministic logging hooks in each phase.

## Detailed Implementation Outline

| Phase | Agents | Purpose | Outputs |
| --- | --- | --- | --- |
| Induction | Perceiver + Hypothesis (parallel) | Extract atomic facts and form three hypotheses (wild/intuitive) informed by Piagetian assimilation/accommodation. | `AtomicFact[]`, `Hypothesis[]` |
| Deduction | Code + Logic (parallel) | Translate hypotheses into executable plans and validate them against Aristotle's six moods. | Code blueprint JSON, `Validation[]` |
| Synthesis | Debate → Empathy → Reflect (serial) | Fuse viewpoints via Vygotsky debate, rebalance affect via UCL happiness formula, then equilibrate final state for downstream consumers. | Final `HCOState` snapshot |

Implementation steps:

1. **State Machine** — `src/mainOrchestrator.ts` drives the three phases, enforcing retry policy and persisting state through `SupabaseMemoryStore`.
2. **Shared Types** — `src/shared/types.ts` defines `AtomicFact`, `Hypothesis`, `Validation`, and `HCOState` exactly as required for static analysis and contract testing.
3. **Tool Selection** — `src/shared/toolSelector.ts` provides static heuristics (embedding strategy, reasoning style, retrieval mix) utilized by agents without introducing mutable globals.
4. **Supabase Memory** — `src/shared/memory.ts` records the latest ten trajectories and offers a synchronous fallback buffer when credentials are absent, keeping pipelines testable offline.
5. **Agents** — Seven agent classes live in `src/agents`. Each agent wraps its core logic with structured validation (Zod) and references a dedicated prompt template in `src/prompts`.
6. **Prompts** — Markdown prompt stubs capture behavioral contracts for reproducibility and can be edited without touching the agent implementations.
7. **Testing & Deployment** — Vitest integration checks Aristotle reasoning, happiness maths, runtime deadlines, and Supabase round-trips. `vercel.json` and `docker-compose.gpu.yml` keep the runtime deployable across serverless and GPU clusters.

## Usage

```bash
cd zacai-hco
npm install
npm run dev # tsx watch main orchestrator
npm test    # vitest integration suite
```

Environment variables for Supabase persistence:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_HCO_TABLE=hco_trajectories
```

## Agent Summary

- **PerceiverAgent** — Extracts Piaget-style atomic sentences using LangChain runnable pipelines.
- **HypothesisAgent** — Generates three hypotheses (wild/intuitive) validated with Zod schemas and scored for priors.
- **CodeAgent** — Produces deterministic JSON execution artifacts, referencing ToolSelector for capability allocation.
- **LogicAgent** — Applies Aristotle's six moods (Barbara, Celarent, Darii, Ferio, Cesare, Camestres) to every hypothesis chain.
- **DebateAgent** — Facilitates Vygotsky thesis/antithesis synthesis.
- **EmpathyAgent** — Computes UCL happiness (`1.2r + 2.7(r - e)`) to keep outputs emotionally calibrated.
- **ReflectAgent** — Finalizes `HCOState`, ready for downstream orchestration or Supabase persistence.

## Testing Targets

1. Barbara syllogism validation passes.
2. UCL happiness formula matches analytical expectation.
3. Full 3-phase pipeline completes under 2 seconds (P95) in CI hardware.
4. Supabase memory store successfully echoes the latest trajectory when credentials are mocked.

## Deployment Assets

- **vercel.json** — 30-second function timeout with default region auto, suitable for orchestrator endpoints.
- **docker-compose.gpu.yml** — Binds four RTX 4090 GPUs for OVHcloud inference workloads with persistent volumes.

## Extensibility

Agents are hot-swappable because they depend only on shared types, the ToolSelector, and their prompt template. To update an agent, replace its class and prompt file — no orchestration changes are required as long as the JSON contract stays intact.

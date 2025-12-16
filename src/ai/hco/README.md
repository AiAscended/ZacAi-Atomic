# ZacAi Hybrid Cognitive Orchestrator (HCO)

> **Executive summary:** ZacAi-HCO is a 7-agent, three-phase cognitive pipeline that fuses Piaget developmental stages, Aristotle’s syllogistic logic, and Vygotsky-style synthesis to deliver enterprise-grade reasoning uplift for the ZacAi Atomic platform.

---

## 1. Architecture Overview
```
mainOrchestrator (TypeScript state machine)
├── PHASE 1 · INDUCTION  (parallel)
│   ├── PerceiverAgent     → atomic "Fa" sentences (sensorimotor precision)
│   └── HypothesisAgent    → divergent priors (preoperational creativity, temp=1.0)
├── PHASE 2 · DEDUCTION  (parallel)
│   ├── CodeAgent          → concrete execution, refactor, verify code
│   └── LogicAgent         → Aristotle Figure 1 + propositional rules (temp=0.1)
└── PHASE 3 · SYNTHESIS  (serial)
    ├── DebateAgent        → 3-turn targeted Vygotsky ZPD debate (temp=0.5)
    ├── EmpathyAgent       → Theory-of-Mind balancing & perspective checks
    └── ReflectAgent       → UCL happiness equilibration (r=1.2, e=2.7)
```
- **Exactly 7 agents.** No hidden helpers; tooling is injected via `toolSelector`.
- **Three precise phases.** Induction → Deduction → Synthesis. No additional states.
- **JSON-only contracts.** Agents never emit Markdown; they return strongly typed payloads validated with Zod.

---

## 2. Repository Layout
```
zacai-hco/
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── deploy/
│   ├── vercel.json
│   └── docker-compose.gpu.yml
├── src/
│   ├── mainOrchestrator.ts        # 3-phase state machine (Phase 2/3 work)
│   ├── config/
│   │   └── hcoConstants.ts        # temps, UCL coefficients, Aristotle moods
│   ├── shared/
│   │   ├── types.ts               # HCOState, AtomicFact, Hypothesis, Validation
│   │   ├── memory.ts              # Supabase trajectory store (last 10)
│   │   ├── toolSelector.ts        # Static orchestration → shared ZacAi tools
│   │   └── retry.ts               # Standardized retry/backoff helper
│   ├── agents/
│   │   └── *.ts                   # Perceiver → Reflect (Phase 2/3 work)
│   └── prompts/
│       ├── perceiver.prompt.md
│       └── … (7 zero-shot templates)
└── tests/
    ├── aristotle.test.ts
    ├── ucl.test.ts
    └── pipeline.test.ts           # Vitest suites (Phase 3 work)
```

---

## 3. Package & Scripts
```json
{
  "name": "zacai-hco",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/mainOrchestrator.ts",
    "build": "tsc --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit",
    "deploy": "vercel --prod"
  }
}
```
- Dependencies: `@supabase/supabase-js`, `@langchain/core`, `zod`, `tsx`, `vitest`.
- Dev dependencies: `typescript`, `@types/node` (added automatically by `npm install`).

---

## 4. Data Privacy & Governance
| Control | Description |
|---------|-------------|
| **Memory bounds** | Supabase trajectory store persists the **last 10** reasoning traces per user. Rows are encrypted at rest and filtered via Row Level Security (user_id scoping is enforced at query time). |
| **Audit logging** | Every phase transition logs to the existing ZacAi `ThinkingTracker` & enhanced metrics stack (latency, happiness, hallucination rate). |
| **Fail-safe retries** | All agent calls wrap `withRetry` (100ms, 500ms, 2000ms backoff). If a stage fails after 3 attempts, the orchestrator degrades gracefully and records the incident. |
| **Ethical guardrails** | DebateAgent instructions enforce constructive Vygotsky scaffolding; outputs must cite sources from approved knowledge domains/URL lookups. |
| **Admin toggles** | HCO mode is feature-gated in the main platform settings (critical reasoning switch, speech enablement, voice selection, etc.). |

---

## 5. Build & Run
```bash
cd zacai-hco
npm install
npm run dev          # local development (tsx watch)
npm run test         # vitest suites (coming Phase 3)
```
- `npm run dev` streams orchestrator logs; useful when integrating with the main Next.js app via local HTTP or direct imports.
- `vercel.json` (under `deploy/`) configures a 30s, 1024MB serverless function for API hosting.
- `docker-compose.gpu.yml` provisions 4× RTX 4090 workers on OVHcloud or equivalent GPU fleets.

---

## 6. Integration Points with ZacAi Atomic
1. **mainOrchestrator Adapter** – Core Next.js orchestrator will expose an HCO mode toggle and route prompts to `zacai-hco` when high-assurance reasoning is required.
2. **Tool Selector** – Bridges to ZacAi’s shared utilities (ScientificCalculator, URL lookup, GitHub backup, speech models, etc.).
3. **Admin Console** – New UI panels control HCO activation, speech preferences (STT/TTS), Supabase project keys, and monitoring thresholds.
4. **Monitoring** – HCO emits structured metrics so the existing dashboard (LearningMetricsTracker + enhanced metrics) can visualize happiness, latency, and hallucination budgets.

---

## 7. Roadmap
| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ | Repo scaffolding, constants, prompts, governance docs (this commit). |
| **Phase 2** | ⏳ | Implement the 7 agents + main orchestrator, wire tool selector, add retry logic. |
| **Phase 3** | ⏳ | End-to-end integration with ZacAi: speech UI, admin settings, monitoring, Vitest suites, deployment automation. |

---

## 8. References
- `docs/ZACAI-HCO-ULTIMATE-COPILOTMoE-AGENTS -MPLEMENTATION-PROMPT`
- `docs/ZacAi Multi-Agent Task Flow and Interface Scaffolding.md`
- `docs/AI-Pipeline-Process.md`
- `src/ai/orchestration/mainOrchestrator.ts` (existing 15-step orchestrator)

**Copy this README to the ZacAi docs directory after implementation milestones if you want centralized documentation.**

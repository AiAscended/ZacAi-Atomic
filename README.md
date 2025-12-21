# ZacAi-Atomic: Hybrid AI System Architecture

## Overview

**ZacAi-Atomic** is a next-generation, bio-inspired hybrid AI platform. It unifies deterministic system control, advanced orchestration, evolutionary memory, and vibrational field coordination into a single, modular TypeScript/Next.js codebase. The project is designed for resilience, introspection, and autonomous operation, drawing direct parallels to human neuroanatomy for both conceptual clarity and engineering rigor.

---

## Project Vision

ZacAi-Atomic aims to replace fragmented AI stacks (Python, Docker, K8s, ONNX, etc.) with a unified, WASM-ready, browser-to-GPU system. It is built for:
- **Always-online operation** (degraded mode fallback)
- **Self-healing and recovery** (system kernel)
- **Modular orchestration and agent coordination** (HCO)
- **Evolutionary, unified memory and recall** (LLeMuR)
- **Vibrational field-based coherence** (VCFlow)
- **Bio-inspired, symphonic design** (AiSymphony)

---

## Biological Inspiration: Brain Mapping

ZacAi’s architecture mirrors the human brain:

| Human Brain Part      | ZacAi Component                | Role/Function                                      |
|----------------------|--------------------------------|----------------------------------------------------|
| Brainstem            | System Kernel                  | Vital core, health, recovery, audit, boot           |
| Spinal Cord          | Pipeline/UI Surfaces           | Signal relay, status, admin/chat UIs                |
| Prefrontal Cortex    | HCO (Hybrid Coordination)      | Executive planning, orchestration, agent routing    |
| Cerebrum/Lobes       | Domain Agents (VCFlow, LLeMuR) | Specialized knowledge, memory, coordination         |
| Neural Networks      | LLeMuR + Internal Memory       | Evolutionary memory, recall, vector DB, embeddings  |
| Synapses             | VCFlow                         | Data flow, vibrational/cellular communication       |

---

## Core Subsystems

### 1. System Kernel (`@zacai/core`)
- **Role:** The “brainstem” and spine of ZacAi. Provides deterministic health, audit, and recovery logic. Always answers system/status prompts, even if other modules are offline.
- **Features:**
  - File-based state and audit logs
  - Health checks, recovery plans, profile switching
  - No external dependencies; logic-only
  - Exposed via `/api/system` and admin panels

### 2. HCO (Hybrid Coordination Orchestrator)
- **Role:** The “prefrontal cortex.” Orchestrates agent pipelines, decision-making, and multi-agent coordination.
- **Features:**
  - Modular pipeline fan-out and agent-to-agent communication
  - 3-phase validation, supervisor/agent hierarchy
  - WebSocket streams for real-time coordination

### 3. LLeMuR (Large Language Evolutionary MultiModal Unified Recollection)
- **Role:** The “memory and recall” system. Handles evolutionary memory, self-learning, and context injection for agents.
- **Features:**
  - In-memory recall with optional vector DB connectors
  - Self-learning loops, YAML/XML seed evolution
  - Middleware for agent context injection

### 4. VCFlow (Vibrational Cellular Field Orchestration)
- **Role:** The “synaptic field.” Provides vibrational, field-based overlays for coherence and harmony across modules.
- **Features:**
  - Non-intrusive, physics-inspired field orchestration
  - Plug-in wrappers for any module
  - Passive emission, resonance mapping, and fallback compatibility

### 5. AiSymphony
- **Role:** The “conductor” and symphonic architecture. Unifies all components into a circular, music-inspired pipeline.
- **Features:**
  - Token-free vibrational signaling (PHONYTIES)
  - Circular symphonic pipelines (CSOPs)
  - Unified TypeScript system, WASM-ready

---

## Project Structure

```
zacai-atomic/
├─ apps/
│  └─ web/                      # Next.js 15 frontend (App Router, chat UI, admin, metrics)
│      ├─ app/
│      │   ├─ page.tsx          # Chat interface (text/audio/code)
│      │   ├─ admin/page.tsx    # Admin dashboard
│      │   └─ metrics/page.tsx  # Real-time monitoring
│      ├─ components/
│      │   ├─ ChatWindow.tsx
│      │   ├─ AgentPanel.tsx
│      │   ├─ LogsViewer.tsx
│      │   └─ MetricsGraph.tsx
│      ├─ utils/
│      │   └─ apiClient.ts
│      └─ styles/
│          └─ global.css
│
├─ packages/
│  ├─ model-large-language/     # WASM/Rust LLM (language model)
│  ├─ model-coding-transformer/ # WASM/Rust code transformer
│  ├─ model-speech-to-text/     # WASM/Rust speech-to-text
│  ├─ model-text-to-speech/     # WASM/Rust text-to-speech
│  ├─ model-vision-transformer/ # WASM/Rust vision transformer
│  ├─ model-graph-neural-net/   # WASM/Rust graph neural network
│  ├─ model-convolutional-net/  # WASM/Rust CNN
│  ├─ model-diffusion/          # WASM/Rust diffusion model
│  ├─ model-wavenet-audio/      # WASM/Rust audio generation
│  ├─ model-multi-modal-fusion/ # WASM/Rust multimodal fusion
│  ├─ model-neuro-symbolic/     # WASM/Rust neuro-symbolic hybrid
│  ├─ model-recurrent-net/      # WASM/Rust RNN
│  ├─ model-generative-adversarial/ # WASM/Rust GAN
│  ├─ internal-vector-db/       # WASM/Rust vector DB (memory, recall)
│  ├─ core-system/              # System kernel, registry, recovery, audit
│  ├─ orchestration-model/      # Orchestration reasoning model
│  ├─ orchestration-agent/      # Orchestration agent logic
│  ├─ hco/                      # Hybrid Coordination Orchestrator
│  │   ├─ agent-supervisor.ts   # HCO supervisor agent
│  │   ├─ agent-1.ts            # HCO agent 1
│  │   ├─ agent-2.ts            # HCO agent 2
│  │   ├─ agent-3.ts            # HCO agent 3
│  │   ├─ agent-4.ts            # HCO agent 4
│  │   ├─ agent-5.ts            # HCO agent 5
│  │   ├─ agent-6.ts            # HCO agent 6
│  │   ├─ agent-7.ts            # HCO agent 7
│  ├─ llemur/                   # LLeMuR memory/recall system
│  │   ├─ llemur-core.ts        # Main LLeMuR logic
│  │   ├─ llemur-vector.ts      # Vector DB integration
│  │   ├─ llemur-cache.ts       # In-memory recall
│  │   ├─ llemur-hooks.ts       # Orchestrator hooks
│  │   └─ llemur-api.ts         # API endpoints
│  ├─ vcflow/                   # VCFlow vibrational field orchestration
│  │   ├─ vcflow-core.ts        # Main VCFlow logic
│  │   ├─ vcflow-hooks.ts       # Integration hooks
│  │   └─ vcflow-api.ts         # API endpoints
│  ├─ aisymphony/               # AiSymphony orchestration/conductor
│  │   ├─ aisymphony-core.ts    # Main symphony logic
│  │   └─ aisymphony-pipeline.ts# Circular pipeline logic
│  ├─ shared/                   # Shared TS modules, utils, types
│  │   ├─ types/
│  │   ├─ utils/
│  │   ├─ tensor-utils/
│  │   ├─ memory-manager/
│  │   └─ tokenizers/
│
├─ scripts/                     # Build, deploy, preprocessing, testing
│  ├─ build_wasm.ts
│  ├─ deploy.ts
│  ├─ data_preprocessing.ts
│  ├─ weight_conversion.ts
│  └─ test_pipeline.ts
│
├─ infra/                       # Enterprise infra / IaC
│  ├─ terraform/
│  ├─ pulumi/
│  ├─ kubernetes/
│  └─ ci-cd/
│
├─ monitoring/                  # Observability & metrics
│  ├─ prometheus/
│  ├─ grafana/
│  └─ logs/
│
├─ security/
│  ├─ auth.ts
│  ├─ authorization.ts
│  ├─ pii_filters.ts
│  └─ policy_rules.ts
│
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ performance/
│
├─ configs/
│  ├─ llm_config.json
│  ├─ coding_config.json
│  ├─ stt_config.json
│  ├─ tts_config.json
│  ├─ tokenizer_llm.json
│  ├─ tokenizer_code.json
│  ├─ tokenizer_stt.json
│  ├─ tokenizer_tts.json
│  └─ weights_meta.yaml
│
└─ data/
    ├─ raw/
    ├─ processed/
    └─ embeddings/
```


### Key Best Practices
- **Next.js App Router** for frontend/app (2026 standard)
- **Rust → WASM** for all compute-heavy modules (models, vector DB)
- **TypeScript** for orchestrator, kernel, agents, orchestration agent
- **Separation of Concerns:**
  - System Model & Agent: self-healing, recovery, kernel operations
  - Orchestration Model & Agent: workflow, multi-agent scheduling, reasoning
- **TurboRepo Monorepo/Workspaces:** modular caching, isolated testing, multiple deployable apps
- **Internal Vector DB:** Rust/WASM, stable/experimental/backup branches
- **CI/CD, Monitoring, Security, Infra:** production-grade deployment

---

# @zacai/system-core-model

This package contains the system-specific model assets used by the `system-core-agent`.

Purpose
- Hold tokenizers, seed weights, and small deterministic rule-sets used to make system-management recommendations.
- Provide a local, auditable source of system knowledge for the agent.

Testing / Mocking
- For development and integration tests we generate mock weights and token seeds via `tools/generate_mock_weights.js`.

Files
- `data/seed_weights.json` — Generated mock weights and seed prompts.
- `data/vocab.json` — Generated token vocabulary (mock).

Usage
- The `system-core-agent` will attempt to load `packages/system-core-model/data/seed_weights.json` and use it to produce deterministic, explainable recommendations.
- If `OPENAI_API_KEY` is provided in the environment, the agent may optionally fall back to calling OpenAI for richer replies.

Security & Compliance
- Seed weights are mock artifacts for testing only. For production, real model weights and secure storage are required.

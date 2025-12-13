please check for this again i renamed the file maybe you can find it now -
docs/ZACAI-HCO-ULTIMATE-COPILOTMoE-AGENTS -MPLEMENTATION-PROMPT# Instruction Schema

The orchestration stack expects every knowledge domain and model to expose a canonical instruction file so modules may be plugged in or removed at runtime without affecting the main orchestrator. The schema below enumerates the core sections that must be present in `domain-instructions.yaml` and `model-instructions.yaml` files.

## Top-Level Blocks

| Field | Description |
| --- | --- |
| `domain` / `system` / `model` | Metadata describing the entity (id, name, version, description). |
| `role` | Primary intent, scope, tone, and orchestration behavior of the module. |
| `capabilities` | High-level bullet list describing what the module can do. |
| `principles` | Ordered guardrails with name, rule, and priority. |
| `seeds` / `weights` | Resource pointers so loaders know where to fetch seed data, learned weights, and fallbacks. |
| `url_lookup` | Switches, config paths, and admin field bindings for runtime URL source hydration. |
| `tools` | Declarative description of auxiliary tools (calculators, analyzers, telemetry, etc.). |
| `url_lookup_config` | Primary sources with explicit URLs plus triggers for when to consult them. |
| `inference` | Parameters (confidence, token limits, temperature) and the step-by-step reasoning recipe. |
| `training` | Enabled flag, optimizer knobs, data sources, focus areas, and evaluation metrics. |
| `pipeline` | Pre/processing/post stages used by the inference engines. |
| `error_handling` | Common errors with recovery actions and escalation strategies. |
| `admin_config` | Field bindings that map admin UI inputs to YAML nodes so edits stay synchronized. |
| `metadata` / `integration` / `quality` | Optional supporting sections for provenance, cross-domain hooks, and QA metrics. |

## File Naming

- Domains: `src/ai/knowledge-domains/<domain>/domain-instructions.yaml`
- Models: `src/ai/models/<model>/model-instructions.yaml`
- The loader automatically falls back to historical names like `<domain>_instructions.yaml` to ease migrations.

## Admin Bindings

`admin_config` is the contract between the YAML file and the admin UI:

```yaml
admin_config:
  editable_fields:
    - "domain.version"
    - "tools.url_lookup.sources"
    - "url_lookup_config.primary_sources"
    - "inference.parameters"
    - "seeds.location"
    - "weights.location"
  field_bindings:
    admin_page: "/admin/domains/<domain>"
    url_sources: "tools.url_lookup.sources"
    primary_lookup_sources: "url_lookup_config.primary_sources"
    inference_knobs: "inference.parameters"
    seed_directory: "seeds.location"
    weight_directory: "weights.location"
  training_sources_management:
    enabled: true
    auto_update: true
    fields:
      - "training.data_sources"
      - "url_lookup_config"
      - "tools.url_lookup.sources"
```

Future admin work will read/write these nodes directly and persist updates back to Git-managed YAML or an instruction registry database.

## Runtime Expectations

1. Instructions live beside the domain/model’s seeds and weights to keep modules portable.
2. The orchestrator can boot with zero, one, or many modules; instructions declare their dependencies so hot-swapping is predictable.
3. URL lookup sources must include real URLs so audit trails cite authoritative documentation.
4. Any tool that relies on shared infrastructure (scientific calculator, telemetry inspector, etc.) must document when to invoke it within the `tools` and `inference` sections.

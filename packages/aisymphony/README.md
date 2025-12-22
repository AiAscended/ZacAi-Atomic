# ZacAi AiSymphony

## Overview
AiSymphony is the unified orchestration and pipeline management subsystem for ZacAi. It coordinates all major modules, ensuring symphonic, event-driven task execution and integration.

## Key Responsibilities
- Pipeline orchestration and management
- Unified coordination of all ZacAi modules
- Event-driven, symphonic task execution

## Architecture
- **Pipeline manager:** Orchestrates all major subsystems
- **Event-driven:** Ensures robust, modular integration
- **Plug-and-play:** Easily integrates new modules and pipelines

## Integration Points
- **Core System:** Registers as pipeline orchestrator
- **HCO:** Coordinates agent orchestration
- **LLeMuR:** Integrates memory/context into pipelines
- **VCFlow:** Field overlays for pipeline state

## File Structure Reference
- `aisymphony-core.ts` – Core orchestration logic
- `aisymphony-pipeline.ts` – Pipeline management

## Best Practices
- Register all pipelines with AiSymphony
- Use event-driven patterns for orchestration
- Maintain clear separation between orchestration and memory logic

## Further Reading
- [AiSymphony Technical Docs](../../docs/AiSymphony/AiSymphony.md)
- [Pipeline Orchestration](../../docs/PLUGIN_ARCHITECTURE.md)

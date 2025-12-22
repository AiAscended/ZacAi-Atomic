# ZacAi VCFlow (Vibrational Context Flow)

## Overview
VCFlow provides non-intrusive, field-based overlays for ZacAi, enabling advanced context, state, and vibrational field management across all subsystems.

## Key Responsibilities
- Field overlays for context and state
- Non-intrusive integration with all modules
- Advanced vibrational field management

## Architecture
- **Field overlay engine:** Non-intrusive, modular overlays
- **Event-driven:** Integrates with all ZacAi subsystems
- **Plug-and-play:** Easily add new overlays and hooks

## Integration Points
- **Core System:** Registers as overlay provider
- **HCO:** Field overlays for agent state
- **LLeMuR:** Memory overlays
- **AiSymphony:** Pipeline overlays

## File Structure Reference
- `vcflow-core.ts` – Core overlay logic
- `vcflow-hooks.ts` – Overlay hooks and integration

## Best Practices
- Use overlays for non-intrusive context/state management
- Register new overlays with the Core System
- Maintain separation between overlays and core logic

## Further Reading
- [VCFlow Technical Docs](../../docs/VCFLOW/VCFLOW.md)
- [Overlay Integration](../../docs/UNIFIED_REGISTRY_ARCHITECTURE.md)

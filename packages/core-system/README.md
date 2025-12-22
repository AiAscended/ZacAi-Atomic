# ZacAi Core System

## Overview
The ZacAi Core System is the foundational subsystem responsible for deterministic health, audit, recovery, and state logic. All major modules and subsystems register with the System Kernel, ensuring unified orchestration, monitoring, and lifecycle management.

## Key Responsibilities
- Deterministic system health and recovery
- Audit and state management
- Subsystem registration and lifecycle orchestration
- Integration with HCO, LLeMuR, VCFlow, AiSymphony, and Internal Vector DB

## Architecture
- **System Kernel:** Central orchestrator for all ZacAi modules
- **Event-driven coordination:** Ensures robust, modular, and extensible integration
- **Plug-and-play modularity:** All subsystems register with the kernel for seamless upgrades and maintenance

## Integration Points
- **HCO:** Multi-agent orchestration and validation
- **LLeMuR:** Memory/recall middleware and context injection
- **VCFlow:** Non-intrusive field overlays
- **AiSymphony:** Pipeline and symphonic orchestration
- **Internal Vector DB:** File-based vector search and RAG

## File Structure Reference
- `src/kernel/SystemKernel.ts` – Core logic and registration
- `src/registry/SubsystemRegistry.ts` – Subsystem registration
- `src/audit/AuditManager.ts` – Audit and state management

## Best Practices
- Register all new modules with the System Kernel
- Use event-driven patterns for extensibility
- Maintain clear separation of concerns between subsystems

## Further Reading
- [Detailed Readme example](../../docs/ZacAi-Core/Detailed%20Readme%20example.md)
- [System Kernel Documentation](../../docs/IDE_TECHNICAL_DOCS.md)
- [Subsystem Integration](../../docs/PLUGIN_ARCHITECTURE.md)

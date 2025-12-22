# ZacAi HCO (Hierarchical Control Orchestrator)

## Overview
The HCO subsystem manages multi-agent orchestration, validation, and agent registry. It coordinates agent and sub-agent hierarchies, ensuring robust, event-driven task management and validation.

## Key Responsibilities
- Multi-agent orchestration and supervision
- 3-phase validation and agent registry
- Event-driven coordination with the System Kernel

## Architecture
- **Supervisor orchestrator:** Central agent registry and validation
- **Event-driven:** Ensures robust, modular agent management
- **Plug-and-play:** Easily integrates new agents and sub-agents

## Integration Points
- **Core System:** Registers as orchestrator
- **LLeMuR:** Accesses memory/context for agents
- **VCFlow:** Field overlays for agent state
- **AiSymphony:** Pipeline orchestration

## File Structure Reference
- `agent-supervisor.ts` – Supervisor logic
- `mainOrchestrator.ts` – Main orchestration entry

## Best Practices
- Register all agents with the supervisor
- Use event-driven patterns for agent coordination
- Maintain clear agent/sub-agent separation

## Further Reading
- [HCO Technical Docs](../../docs/HCO/HCO.md)
- [Agent Coordination](../../docs/orchestration/coordinating%20agents%20and%20subagents.md)

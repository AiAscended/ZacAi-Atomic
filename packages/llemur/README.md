# ZacAi LLeMuR (Long-term Learning, Memory, and Recall)

## Overview
LLeMuR provides advanced memory, recall, and self-learning capabilities for ZacAi. It acts as middleware, injecting context and memory into all major subsystems and agents.

## Key Responsibilities
- Memory and recall for agents and models
- Self-learning and context injection
- Middleware for all ZacAi subsystems

## Architecture
- **Memory vector store:** File-based, high-performance
- **Context injection:** Middleware for agents and models
- **Self-learning:** Adaptive memory and recall

## Integration Points
- **Core System:** Registers as memory provider
- **HCO:** Supplies memory/context to agents
- **VCFlow:** Field overlays for memory state
- **AiSymphony:** Pipeline memory management

## File Structure Reference
- `llemur-core.ts` – Core memory logic
- `llemur-vector.ts` – Vector store implementation

## Best Practices
- Use context injection for all agents/models
- Register new memory modules with the Core System
- Maintain separation between memory and orchestration logic

## Further Reading
- [LLeMuR Technical Docs](../../docs/LLeMuR/LLeMuR.md)
- [Memory Integration](../../docs/ZacAi-Internal-Memory/ZacAi-Internal-Vector-Memory_251216.txt)

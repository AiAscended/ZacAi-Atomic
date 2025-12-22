# ZacAi Internal Vector DB

## Overview
The Internal Vector DB provides file-based vector search, retrieval-augmented generation (RAG), and offline/monorepo-native memory for ZacAi. It is optimized for high-performance, local vector operations.

## Key Responsibilities
- File-based vector search and RAG
- Offline, monorepo-native memory
- High-performance, local vector operations

## Architecture
- **Vector store:** File-based, high-performance
- **RAG integration:** Seamless with ZacAi models and memory
- **Plug-and-play:** Easily integrates with all ZacAi subsystems

## Integration Points
- **Core System:** Registers as vector memory provider
- **LLeMuR:** Supplies vector memory for recall
- **AiSymphony:** Used in pipeline memory management

## File Structure Reference
- `vectorMemory.ts` – Core vector store logic

## Best Practices
- Use file-based storage for performance and reliability
- Register new vector stores with the Core System
- Maintain separation between vector memory and orchestration logic

## Further Reading
- [Internal Vector Memory Docs](../../docs/ZacAi-Internal-Memory/ZacAi-Internal-Vector-Memory_251216.txt)
- [Memory Integration](../../docs/LLeMuR/LLeMuR.md)

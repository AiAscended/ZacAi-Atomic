# AI Models Directory

This directory contains all the specialized AI model implementations for the hybrid multi-domain system.

## Structure

```
src/ai/models/
├── unified-llm/          # Unified Transformer (LLM)
├── coder-llm/            # Code-specialized Transformer

## Import Patterns

Always use absolute imports with TypeScript path aliases:

```typescript
// ✅ Correct
import { Tokenizer } from '@/ai-models/llm/tokenizer';
import { ImagePreprocessor } from '@/ai-models/vision-transformer/imagePreprocessor';
import { SharedConfig } from '@/ai-models/shared/config';

// ❌ Incorrect
import { Tokenizer } from '../../llm/tokenizer';
import { ImagePreprocessor } from '../vision-transformer/imagePreprocessor';
```

## Development Guidelines

1. **Atomic Design**: Each file should have a single, well-defined responsibility
2. **Type Safety**: Use TypeScript types and interfaces extensively
3. **Modularity**: Models should be independently testable and deployable
4. **Documentation**: Each file should have clear JSDoc comments
5. **Performance**: Optimize for inference speed and memory efficiency
6. **Extensibility**: Design for easy addition of new capabilities

## Integration

Models are integrated through the orchestrator layer located at:
- `src/ai/orchestration/` - Legacy orchestration (to be deprecated)
- `src/orchestrator/` - New unified orchestrator (coming soon)

## Status

🚧 **In Development** - This is an active work in progress.

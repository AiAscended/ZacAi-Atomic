# AI Models Layer

This directory contains the atomic, modular implementation of all AI model types used in the ZacAi-Atomic hybrid system.

## Structure

Each model type has its own directory with a complete, self-contained implementation following atomic design principles.

### Model Types

#### 1. **llm/** - Unified Transformer (Large Language Model)
Core text generation and understanding model.

#### 2. **coder-llm/** - Code Transformer
Specialized LLM for programming languages and code generation.

#### 3. **vision-transformer/** - Vision Transformer (ViT)
Image processing and computer vision tasks.

#### 4. **cnn/** - Convolutional Neural Network
Traditional computer vision and feature extraction.

#### 5. **diffusion/** - Diffusion Model
Generative models for images, audio, and other modalities.

#### 6. **gan/** - Generative Adversarial Network
Generative models using adversarial training.

#### 7. **wavenet/** - WaveNet / Autoregressive Audio Model
Audio generation and processing.

#### 8. **stt/** - Speech-to-Text
Audio transcription and speech recognition.

#### 9. **tts/** - Text-to-Speech
Speech synthesis from text.

#### 10. **neuro-symbolic/** - Neuro-Symbolic Reasoning
Hybrid neural and symbolic reasoning for logic and verification.

#### 11. **gnn/** - Graph Neural Network
Graph-based learning and reasoning.

#### 12. **rnn/** - LSTM / GRU
Recurrent models for sequence processing.

#### 13. **multi-modal/** - Multi-Modal Fusion Transformer
Cross-modal attention and fusion of different data types.

#### 14. **shared/** - Shared Components
Common utilities, types, and components used across models.

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

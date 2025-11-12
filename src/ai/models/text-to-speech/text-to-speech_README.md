# Text-to-Speech Model

Production-grade Text-to-Speech Model implementation for ZacAi-Atomic hybrid AI system.

## Structure

- **tts-config/**: Model configuration and hyperparameters
- **tts-data/**: Training and seed data
- **tts-model/**: Core model architecture
- **tts-training/**: Training pipeline
- **tts-inference/**: Inference engine
- **tts-weights/**: Model weights
- **tts-tests/**: Unit tests
- **tts-shared/**: Shared utilities

## Usage

```typescript
import { TTSInferenceEngine } from './tts-inference/tts-inferenceEngine';

const engine = new TTSInferenceEngine();
const result = engine.predict(input);
```

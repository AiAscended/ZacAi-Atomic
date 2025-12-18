# Graph Neural Network

Production-grade Graph Neural Network implementation for ZacAi-Atomic hybrid AI system.

## Structure

- **gnn-config/**: Model configuration and hyperparameters
- **gnn-data/**: Training and seed data
- **gnn-model/**: Core model architecture
- **gnn-training/**: Training pipeline
- **gnn-inference/**: Inference engine
- **gnn-weights/**: Model weights
- **gnn-tests/**: Unit tests
- **gnn-shared/**: Shared utilities

## Usage

```typescript
import { GNNInferenceEngine } from './gnn-inference/gnn-inferenceEngine';

const engine = new GNNInferenceEngine();
const result = engine.predict(input);
```

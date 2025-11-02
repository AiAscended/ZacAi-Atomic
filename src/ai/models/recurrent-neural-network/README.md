# Recurrent Neural Network (LSTM/GRU)

Production-grade Recurrent Neural Network (LSTM/GRU) implementation for ZacAi-Atomic hybrid AI system.

## Structure

- **rnn-config/**: Model configuration and hyperparameters
- **rnn-data/**: Training and seed data
- **rnn-model/**: Core model architecture
- **rnn-training/**: Training pipeline
- **rnn-inference/**: Inference engine
- **rnn-weights/**: Model weights
- **rnn-tests/**: Unit tests
- **rnn-shared/**: Shared utilities

## Usage

```typescript
import { RNNInferenceEngine } from './rnn-inference/rnn-inferenceEngine';

const engine = new RNNInferenceEngine();
const result = engine.predict(input);
```

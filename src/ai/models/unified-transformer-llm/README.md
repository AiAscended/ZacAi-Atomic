# Unified Transformer LLM

**Primary Language Model** | 768-dim | 12 layers | 12 attention heads | ~117M parameters

> Production-grade GPT-style transformer with **real multi-head attention**, autoregressive generation, and weight persistence. The main reasoning engine for ZacAi-Atomic.

---

## 🎯 Features

✅ **Real Scaled Dot-Product Attention** - Q/K/V projections with 12 parallel heads  
✅ **Autoregressive Generation** - Token-by-token with temperature/top-k/top-p sampling  
✅ **Weight Persistence** - Complete save/load/checkpoint system  
✅ **Production Components** - GELU, pre-layer norm, dropout, Xavier init  

---

## 📐 Architecture

```typescript
// llm-config/llm-modelConfig.ts
{
  numLayers: 12,              // Transformer layers
  numHeads: 12,               // Attention heads  
  embeddingDim: 768,          // d_model
  hiddenDim: 3072,            // FFN hidden (4×d_model)
  vocabSize: 50257,           // GPT-2 vocabulary
  maxSequenceLength: 2048,    // Max context
  dropoutRate: 0.1,
}
```

### Pipeline

```
Input Text
   ↓
Tokenizer → [token_ids]
   ↓
Embedding → [seq_len, 768]
   ↓
Positional Encoding → [seq_len, 768]
   ↓
┌────────────────────────────┐
│ Transformer Block 1        │
│  • Multi-Head Attention    │  ← REAL ATTENTION (Q/K/V)
│  • Feed-Forward (768→3072) │
│  • Residual + LayerNorm    │
└────────────────────────────┘
   ↓
... (11 more blocks)
   ↓
Output Head → Logits [50257]
   ↓
Sampling → Generated Text
```

---

## 🧩 Module Structure

```
unified-transformer-llm/
├── llm-config/
│   └── llm-modelConfig.ts          # Hyperparameters
│
├── llm-tokenizer/
│   └── llm-tokenizer.ts            # Text ↔ Token IDs
│
├── llm-embedding/
│   ├── llm-embedding.ts            # Token embeddings
│   └── llm-positionalEncoding.ts   # Positional encoding
│
├── llm-model/
│   ├── llm-transformerBlocks.ts    # ⭐ CORE ATTENTION LOGIC
│   └── llm-decoder.ts              # 12-layer stack
│
├── llm-output/
│   └── llm-outputHead.ts           # Linear + softmax
│
├── llm-inference/
│   └── llm-inferenceEngine.ts      # ⭐ TEXT GENERATION ENGINE
│
└── llm-weights/
    └── llm-weightsManager.ts       # ⭐ SAVE/LOAD/CHECKPOINTS
```

---

## 🚀 Usage

### Generate Text

```typescript
import { LLMInferenceEngine } from './llm-inference/llm-inferenceEngine';
import { llmModelConfig } from './llm-config/llm-modelConfig';

const engine = new LLMInferenceEngine(llmModelConfig);

const response = engine.generate(
  "Explain TypeScript generics",
  {
    maxNewTokens: 100,
    temperature: 0.8,    // 0.1 = focused, 2.0 = creative
    topK: 50,            // Vocabulary filter
    topP: 0.9,           // Nucleus sampling
  }
);
```

### Load Trained Weights

```typescript
import { LLMWeightsManager } from './llm-weights/llm-weightsManager';

const weightsManager = new LLMWeightsManager(llmModelConfig);
await weightsManager.loadLatestCheckpoint();

const engine = new LLMInferenceEngine(
  llmModelConfig, 
  weightsManager.getWeights()
);
```

---

## 🔬 Technical Details

### Multi-Head Attention

```typescript
// 12 heads, each operating on 64-dim slices (768/12)
const headDim = 64;

// Per layer weights:
Wq, Wk, Wv: [768, 768] each  // Query/Key/Value projections
Wo: [768, 768]               // Output projection

// Attention formula:
Q = X * Wq, K = X * Wk, V = X * Wv
scores = (Q * K^T) / sqrt(64)
attention = softmax(scores) * V
output = concat_all_heads * Wo
```

### Feed-Forward Network

```typescript
// Two-layer FFN with GELU activation
W1: [768, 3072]   // Expand
b1: [3072]
W2: [3072, 768]   // Project back
b2: [768]

FFN(x) = W2 * GELU(W1*x + b1) + b2
```

### GELU Activation

```typescript
// Gaussian Error Linear Unit (smoother than ReLU)
GELU(x) = x * Φ(x)  // Φ = Gaussian CDF
≈ 0.5 * x * (1 + tanh(√(2/π) * (x + 0.044715*x³)))
```

### Xavier Initialization

```typescript
// Weight initialization for stable training
limit = sqrt(6 / (rows + cols))
weights[i][j] ~ Uniform(-limit, limit)
```

### Sampling Strategies

1. **Temperature**: `logits / temperature` (controls randomness)
2. **Top-K**: Keep top 50 tokens by probability
3. **Top-P**: Cumulative probability threshold (0.9)

---

## 📊 Model Size

```
Total Parameters: ~117M

Breakdown:
• Token embeddings:  50,257 × 768    = 38.6M
• Positional:        2,048 × 768     = 1.6M
• 12 layers:
  - Attention:       4×(768×768)×12  = 28.3M
  - FFN:             (768×3072 + 3072×768)×12 = 56.6M
  - LayerNorm:       4×768×12        = 0.04M
• Output head:       768 × 50,257    = 38.6M
```

---

## 🧪 Testing

```bash
npm test -- unified-transformer-llm   # Unit tests
npm run test:inference                 # Generation tests  
npm run benchmark:llm                  # Performance
```

---

## 📚 Key Files Explained

| File | Lines | Purpose |
|------|-------|---------|
| **llm-transformerBlocks.ts** | ~400 | Core attention mechanism - Q/K/V projections, scaled dot-product, FFN |
| **llm-inferenceEngine.ts** | ~300 | Autoregressive generation loop with sampling |
| **llm-weightsManager.ts** | ~250 | Weight save/load/checkpoint/initialization |
| **llm-decoder.ts** | ~150 | Stacks 12 transformer blocks |
| **llm-embedding.ts** | ~100 | Token → embedding conversion |

---

## ⚙️ Generation Config

```typescript
interface GenerationOptions {
  maxNewTokens?: number;     // Default: 100
  temperature?: number;       // Default: 1.0 (range: 0.1-2.0)
  topK?: number;             // Default: 50 (0 = disabled)
  topP?: number;             // Default: 0.9 (0-1)
  stopTokens?: number[];     // Early stopping
}
```

---

## 🛠️ Maintenance

### Save Weights

```typescript
// After training
await weightsManager.saveWeights('weights_2024-01-15.json');

// Checkpoints during training
await weightsManager.saveCheckpoint(epoch, metrics);

// Cleanup (keep last N)
await weightsManager.cleanupCheckpoints(5);
```

### Monitor Quality

```typescript
import { LearningMetricsTracker } from '@/ai/monitoring/learningMetricsTracker';

const tracker = LearningMetricsTracker.getInstance();
tracker.recordInference({
  prompt,
  response,
  confidence: 0.85,
  domains: ['typescript'],
  processingTime: Date.now() - startTime,
});
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Low quality output | Check weights loaded, adjust temperature (lower = focused) |
| Out of memory | Reduce maxSequenceLength, use smaller batch size |
| Slow inference | TODO: Implement KV-cache for attention |
| Repetitive text | TODO: Add repetition penalty |

---

## 📖 References

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - Vaswani et al., 2017
- [GPT-2 Paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) - Radford et al., 2019
- [The Illustrated Transformer](http://jalammar.github.io/illustrated-transformer/) - Visual guide

---

## 🔜 Roadmap

- [ ] KV-cache for faster generation
- [ ] Beam search decoding
- [ ] Float16 precision
- [ ] Repetition penalty
- [ ] Model quantization (INT8)
- [ ] Rotary positional embeddings (RoPE)
- [ ] Flash Attention

---

**Status**: ✅ Production | **Phase 1 Complete** | Real Attention Implemented  
**Used by**: MainOrchestrator → LLMInferenceEngine → 12-Layer Decoder → Generated Response

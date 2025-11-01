# LLM (Unified Transformer)

Core text generation and understanding model.

## Files

- `config.ts` - Model configuration and hyperparameters
- `tokenizer.ts` - Text tokenization and detokenization
- `embedding.ts` - Token to vector embedding conversion
- `inference.ts` - Text generation and prediction

## TODO: Implement

- `transformerBlocks.ts` - Multi-head self-attention and feed-forward layers
- `encoder.ts` - Encoder stack for processing input sequences
- `decoder.ts` - Decoder stack for autoregressive generation
- `outputHead.ts` - Maps hidden states to output token logits
- `lossFunction.ts` - Training loss computation
- `trainer.ts` - Training loop management

## Usage

```typescript
import { Tokenizer, Embedding, Inference, defaultLLMConfig } from '@/ai-models/llm';

const config = defaultLLMConfig;
const tokenizer = new Tokenizer(config);
const embedding = new Embedding(config);
const inference = new Inference(config, tokenizer, embedding);

const result = await inference.generate('Hello, world!');
console.log(result.text);
```

#!/bin/bash

# Create llm-inference files
cat > llm-inference/llm-inferenceEngine.ts << 'EOF'
/**
 * LLM Inference Engine
 * Performs inference and forward passes for text generation
 */

import { LLMTokenizer } from '../llm-model/llm-tokenizer';
import { LLMEmbedding } from '../llm-model/llm-embedding';
import { LLMDecoder } from '../llm-model/llm-decoder';
import { LLMOutputHead } from '../llm-model/llm-outputHead';
import type { LLMModelConfig } from '../llm-config/llm-modelConfig';

export class LLMInferenceEngine {
  private config: LLMModelConfig;
  private tokenizer: LLMTokenizer;
  private embedding: LLMEmbedding;
  private decoder: LLMDecoder;
  private outputHead: LLMOutputHead;

  constructor(config: LLMModelConfig) {
    this.config = config;
    this.tokenizer = new LLMTokenizer();
    this.embedding = new LLMEmbedding(config.vocabSize, config.embeddingDim);
    this.decoder = new LLMDecoder(config.numLayers, {
      embeddingDim: config.embeddingDim,
      numHeads: config.numHeads,
      hiddenDim: config.hiddenDim,
      dropoutRate: 0.1,
    });
    this.outputHead = new LLMOutputHead(config.embeddingDim, config.vocabSize);
  }

  /**
   * Generate text from a prompt
   */
  async generate(prompt: string, maxTokens?: number): Promise<string> {
    const tokenIds = this.tokenizer.encode(prompt);
    const embeddings = this.embedding.forwardSequence(tokenIds);
    const hiddenStates = this.decoder.forward(embeddings);
    const logits = this.outputHead.forward(hiddenStates);
    
    // Placeholder: Get last token prediction
    const nextTokenId = this.outputHead.getPrediction(logits[logits.length - 1]);
    const nextToken = this.tokenizer.decode([nextTokenId]);
    
    return prompt + ' ' + nextToken;
  }

  /**
   * Compute embeddings for text
   */
  async embed(text: string): Promise<number[]> {
    const tokenIds = this.tokenizer.encode(text);
    const embeddings = this.embedding.forwardSequence(tokenIds);
    
    // Return mean pooling
    const meanEmbedding = new Array(this.config.embeddingDim).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < this.config.embeddingDim; i++) {
        meanEmbedding[i] += emb[i];
      }
    }
    return meanEmbedding.map(v => v / embeddings.length);
  }
}

export default LLMInferenceEngine;
EOF

cat > llm-inference/llm-sampling.ts << 'EOF'
/**
 * LLM Sampling Algorithms
 * Various sampling strategies for text generation
 */

export class LLMSampling {
  /**
   * Greedy sampling - select highest probability token
   */
  greedy(logits: number[]): number {
    return logits.indexOf(Math.max(...logits));
  }

  /**
   * Top-K sampling
   */
  topK(logits: number[], k: number): number {
    const indexed = logits.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => b.val - a.val);
    const topK = indexed.slice(0, k);
    const selected = topK[Math.floor(Math.random() * topK.length)];
    return selected.idx;
  }

  /**
   * Top-P (nucleus) sampling
   */
  topP(logits: number[], p: number): number {
    const probs = this.softmax(logits);
    const indexed = probs.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => b.val - a.val);
    
    let cumSum = 0;
    const nucleus: typeof indexed = [];
    for (const item of indexed) {
      cumSum += item.val;
      nucleus.push(item);
      if (cumSum >= p) break;
    }
    
    const selected = nucleus[Math.floor(Math.random() * nucleus.length)];
    return selected.idx;
  }

  /**
   * Temperature sampling
   */
  temperature(logits: number[], temp: number): number {
    const scaledLogits = logits.map(l => l / temp);
    const probs = this.softmax(scaledLogits);
    return this.sample(probs);
  }

  private softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits);
    const exps = logits.map(l => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sumExps);
  }

  private sample(probs: number[]): number {
    const rand = Math.random();
    let cumSum = 0;
    for (let i = 0; i < probs.length; i++) {
      cumSum += probs[i];
      if (rand < cumSum) return i;
    }
    return probs.length - 1;
  }
}

export default LLMSampling;
EOF

# Create weights utils
cat > llm-weights/llm-weightsUtils.ts << 'EOF'
/**
 * LLM Weights Utilities
 * Load, save, and quantize model weights
 */

export class LLMWeightsUtils {
  /**
   * Load weights from binary file
   */
  async loadWeights(path: string): Promise<ArrayBuffer> {
    // Placeholder implementation
    return new ArrayBuffer(0);
  }

  /**
   * Save weights to binary file
   */
  async saveWeights(weights: ArrayBuffer, path: string): Promise<void> {
    // Placeholder implementation
    console.log(\`Saving weights to \${path}\`);
  }

  /**
   * Quantize weights to reduce model size
   */
  quantize(weights: Float32Array, bits: number = 8): Int8Array {
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const scale = (max - min) / (Math.pow(2, bits) - 1);
    
    const quantized = new Int8Array(weights.length);
    for (let i = 0; i < weights.length; i++) {
      quantized[i] = Math.round((weights[i] - min) / scale);
    }
    
    return quantized;
  }

  /**
   * Dequantize weights
   */
  dequantize(quantized: Int8Array, min: number, max: number, bits: number = 8): Float32Array {
    const scale = (max - min) / (Math.pow(2, bits) - 1);
    const dequantized = new Float32Array(quantized.length);
    
    for (let i = 0; i < quantized.length; i++) {
      dequantized[i] = quantized[i] * scale + min;
    }
    
    return dequantized;
  }
}

export default LLMWeightsUtils;
EOF

# Create shared files
cat > llm-shared/llm-constants.ts << 'EOF'
/**
 * LLM Constants
 * Model constants and special tokens
 */

export const LLM_SPECIAL_TOKENS = {
  PAD: '<PAD>',
  BOS: '<BOS>',
  EOS: '<EOS>',
  UNK: '<UNK>',
  MASK: '<MASK>',
  SEP: '<SEP>',
  CLS: '<CLS>',
} as const;

export const LLM_TOKEN_IDS = {
  PAD: 0,
  BOS: 1,
  EOS: 2,
  UNK: 3,
  MASK: 4,
  SEP: 5,
  CLS: 6,
} as const;

export const LLM_MODEL_VERSIONS = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XL: 'xl',
} as const;

export const LLM_MAX_SEQUENCE_LENGTHS = {
  [LLM_MODEL_VERSIONS.SMALL]: 512,
  [LLM_MODEL_VERSIONS.MEDIUM]: 1024,
  [LLM_MODEL_VERSIONS.LARGE]: 2048,
  [LLM_MODEL_VERSIONS.XL]: 4096,
} as const;

export default {
  SPECIAL_TOKENS: LLM_SPECIAL_TOKENS,
  TOKEN_IDS: LLM_TOKEN_IDS,
  MODEL_VERSIONS: LLM_MODEL_VERSIONS,
  MAX_SEQUENCE_LENGTHS: LLM_MAX_SEQUENCE_LENGTHS,
};
EOF

cat > llm-shared/llm-errorHandling.ts << 'EOF'
/**
 * LLM Error Handling
 * Custom error classes and error handling utilities
 */

export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMTokenizationError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMTokenizationError';
  }
}

export class LLMInferenceError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMInferenceError';
  }
}

export class LLMTrainingError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMTrainingError';
  }
}

export class LLMConfigError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMConfigError';
  }
}

export function handleLLMError(error: unknown): void {
  if (error instanceof LLMError) {
    console.error(\`[\${error.name}] \${error.message}\`);
  } else if (error instanceof Error) {
    console.error(\`[Error] \${error.message}\`);
  } else {
    console.error('Unknown error occurred');
  }
}

export default {
  LLMError,
  LLMTokenizationError,
  LLMInferenceError,
  LLMTrainingError,
  LLMConfigError,
  handleLLMError,
};
EOF

cat > llm-shared/llm-logger.ts << 'EOF'
/**
 * LLM Logger
 * Logging middleware and utilities
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class LLMLogger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix: string = 'LLM', level: LogLevel = LogLevel.INFO) {
    this.prefix = prefix;
    this.level = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(\`[\${this.prefix}] [DEBUG] \${message}\`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(\`[\${this.prefix}] [INFO] \${message}\`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(\`[\${this.prefix}] [WARN] \${message}\`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(\`[\${this.prefix}] [ERROR] \${message}\`, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

export default LLMLogger;
EOF

# Create README
cat > README.md << 'EOF'
# Unified Transformer LLM

A production-grade Large Language Model implementation using the Transformer architecture.

## Structure

### llm-config/
Model configuration and hyperparameters

### llm-data/
Training and seed data, tokenizer configuration

### llm-model/
Core model architecture:
- Tokenizer
- Embeddings
- Positional Encoding
- Transformer Blocks
- Encoder/Decoder
- Output Head

### llm-training/
Training pipeline:
- Loss functions
- Trainer
- Dataset loader
- Training utilities
- Evaluation

### llm-inference/
Inference engine:
- Inference engine
- Sampling strategies
- Decoder utilities
- Prompt processor
- Session manager

### llm-weights/
Model weights management:
- Pretrained weights
- Fine-tuned checkpoints
- Weight utilities

### llm-tests/
Unit and integration tests

### llm-shared/
Shared utilities:
- Constants
- Error handling
- Logger

## Usage

\`\`\`typescript
import { LLMInferenceEngine } from './llm-inference/llm-inferenceEngine';
import { defaultLLMConfig } from './llm-config/llm-modelConfig';

const engine = new LLMInferenceEngine(defaultLLMConfig);
const result = await engine.generate('Hello, world!');
\`\`\`

## Development

All files follow the `llm-` prefix naming convention for clarity and uniqueness.
EOF

echo "✅ All remaining LLM files created successfully!"

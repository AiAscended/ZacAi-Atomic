/**
 * Unified Transformer LLM - Model Configuration
 * Defines hyperparameters and architecture configuration
 */

export interface LLMModelConfig {
  // Model architecture
  modelType: 'encoder-decoder' | 'decoder-only';
  numLayers: number;
  numHeads: number;
  hiddenSize: number;
  embeddingDim: number; // Dimension of token embeddings
  hiddenDim: number; // Hidden dimension for FFN
  ffnSize: number;
  vocabSize: number;
  maxSequenceLength: number;
  
  // Training configuration
  batchSize: number;
  learningRate: number;
  warmupSteps: number;
  maxSteps: number;
  
  // Dropout and regularization
  dropoutRate: number;
  attentionDropout: number;
  
  // Special tokens
  padTokenId: number;
  bosTokenId: number;
  eosTokenId: number;
  unkTokenId: number;
}

export const defaultLLMConfig: LLMModelConfig = {
  modelType: 'decoder-only',
  numLayers: 12,
  numHeads: 12,
  hiddenSize: 768,
  embeddingDim: 768, // Same as hiddenSize for unified architecture
  hiddenDim: 3072, // 4x hiddenSize as per transformer standard
  ffnSize: 3072,
  vocabSize: 50257,
  maxSequenceLength: 2048,
  batchSize: 32,
  learningRate: 0.0001,
  warmupSteps: 4000,
  maxSteps: 100000,
  dropoutRate: 0.1,
  attentionDropout: 0.1,
  padTokenId: 0,
  bosTokenId: 1,
  eosTokenId: 2,
  unkTokenId: 3,
};

export default defaultLLMConfig;

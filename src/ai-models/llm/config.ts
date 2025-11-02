/**
 * LLM Configuration
 * 
 * Holds model configuration and hyperparameters for the Unified Transformer.
 */

export interface LLMConfig {
  // Model Architecture
  vocabSize: number;
  maxSequenceLength: number;
  embeddingDim: number;
  numLayers: number;
  numHeads: number;
  ffnDim: number;
  dropoutRate: number;
  
  // Training Configuration
  learningRate: number;
  batchSize: number;
  epochs: number;
  warmupSteps: number;
  
  // Generation Configuration
  temperature: number;
  topK: number;
  topP: number;
  maxGenerationLength: number;
  
  // Model Type
  architecture: 'encoder-decoder' | 'decoder-only' | 'encoder-only';
  
  // Advanced Features
  useFlashAttention: boolean;
  useMoE: boolean; // Mixture of Experts
  quantization: 'none' | 'int8' | 'int4';
}

export const defaultLLMConfig: LLMConfig = {
  vocabSize: 50257,
  maxSequenceLength: 2048,
  embeddingDim: 768,
  numLayers: 12,
  numHeads: 12,
  ffnDim: 3072,
  dropoutRate: 0.1,
  
  learningRate: 1e-4,
  batchSize: 32,
  epochs: 10,
  warmupSteps: 1000,
  
  temperature: 0.7,
  topK: 50,
  topP: 0.95,
  maxGenerationLength: 512,
  
  architecture: 'decoder-only',
  
  useFlashAttention: true,
  useMoE: false,
  quantization: 'none',
};

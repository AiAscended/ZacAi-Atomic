import type { LLMModelConfig } from './llm-modelConfig'

const BASE_LLM_CONFIG: Omit<LLMModelConfig, 'vocabSize'> = {
  modelType: 'decoder-only',
  numLayers: 4,
  numHeads: 4,
  hiddenSize: 256,
  embeddingDim: 256,
  hiddenDim: 1024,
  ffnSize: 1024,
  maxSequenceLength: 256,
  batchSize: 8,
  learningRate: 0.0001,
  warmupSteps: 500,
  maxSteps: 50000,
  dropoutRate: 0.1,
  attentionDropout: 0.1,
  padTokenId: 0,
  bosTokenId: 1,
  eosTokenId: 2,
  unkTokenId: 3,
}

/**
 * Build a default LLM configuration using the shared architecture baseline.
 * Allows callers to override individual values without duplicating the base spec.
 */
export function buildDefaultLlmConfig(
  vocabSize: number,
  overrides: Partial<LLMModelConfig> = {}
): LLMModelConfig {
  return {
    ...BASE_LLM_CONFIG,
    vocabSize,
    ...overrides,
  }
}

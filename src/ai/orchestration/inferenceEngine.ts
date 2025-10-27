/**
 * File: src/ai/orchestration/inferenceEngine.ts
 * Purpose: Core inference engine that coordinates neural network operations,
 * attention mechanisms, and forward passes through the transformer architecture.
 * Integrates all core_reasoning modules for actual AI inference.
 *
 * Dependencies:
 * - src/ai/core_reasoning/transformerAttentionHead.ts
 * - src/ai/core_reasoning/feedforwardNetworkLayer.ts
 * - src/ai/core_reasoning/layerNormalization.ts
 * - src/ai/core_reasoning/activationFunctions.ts
 * - src/ai/embedding/contextualEmbeddingsGenerator.ts
 * - src/ai/embedding/positionalEncoding.ts
 * - src/ai/inference/batchAssembler.ts
 * - src/ai/inference/attentionMaskGenerator.ts
 * - src/ai/inference/cacheManager.ts
 *
 * Depended on by:
 * - src/ai/orchestration/aiOrchestrator.ts
 */

import { TransformerAttentionHead } from "../core_reasoning/transformerAttentionHead"
import { FeedforwardNetworkLayer } from "../core_reasoning/feedforwardNetworkLayer"
import { layerNorm } from "../core_reasoning/layerNormalization"
import { generateContextualEmbeddings } from "../embedding/contextualEmbeddingsGenerator"
import { addPositionalEncoding } from "../embedding/positionalEncoding"
import { generateAttentionMask } from "../inference/attentionMaskGenerator"
import { InferenceCache } from "../inference/cacheManager"

/**
 * Inference configuration
 */
export interface InferenceConfig {
  modelDim: number
  numHeads: number
  numLayers: number
  ffnDim: number
  maxSeqLength: number
  dropoutRate: number
  useCache: boolean
}

/**
 * Inference input
 */
export interface InferenceInput {
  tokens: number[]
  domain: string
  context?: number[][]
}

/**
 * Inference output
 */
export interface InferenceOutput {
  logits: number[][]
  attentionWeights: number[][][]
  hiddenStates: number[][]
  confidence: number
}

/**
 * Inference Engine - Executes neural network forward passes
 */
export class InferenceEngine {
  private config: InferenceConfig
  private attentionHeads: TransformerAttentionHead[]
  private ffnLayers: FeedforwardNetworkLayer[]
  private cache: InferenceCache

  constructor(config: InferenceConfig) {
    this.config = config
    this.cache = new InferenceCache(1000)

    // Initialize attention heads for each layer
    this.attentionHeads = []
    for (let i = 0; i < config.numLayers; i++) {
      this.attentionHeads.push(new TransformerAttentionHead(config.modelDim, config.numHeads, config.dropoutRate))
    }

    // Initialize feedforward layers
    this.ffnLayers = []
    for (let i = 0; i < config.numLayers; i++) {
      this.ffnLayers.push(new FeedforwardNetworkLayer(config.modelDim, config.ffnDim, config.dropoutRate))
    }
  }

  /**
   * Run inference on input tokens
   */
  public async infer(input: InferenceInput): Promise<InferenceOutput> {
    const { tokens, domain, context } = input

    // Check cache
    const cacheKey = `${domain}:${tokens.join(",")}`
    if (this.config.useCache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached as InferenceOutput
      }
    }

    // Step 1: Generate embeddings
    const embeddings = await generateContextualEmbeddings(tokens, domain)

    // Step 2: Add positional encoding
    const posEncoded = addPositionalEncoding(embeddings, this.config.maxSeqLength)

    // Step 3: Generate attention mask
    const attentionMask = generateAttentionMask(tokens.length, tokens.length)

    // Step 4: Forward pass through transformer layers
    let hiddenStates = posEncoded
    const allAttentionWeights: number[][][] = []

    for (let layer = 0; layer < this.config.numLayers; layer++) {
      // Multi-head attention
      const attentionOutput = this.attentionHeads[layer].forward(
        hiddenStates,
        hiddenStates,
        hiddenStates,
        attentionMask,
      )

      allAttentionWeights.push(attentionOutput.weights)

      // Add & Norm
      const attended = this.addAndNorm(hiddenStates, attentionOutput.output)

      // Feedforward network
      const ffnOutput = this.ffnLayers[layer].forward(attended)

      // Add & Norm
      hiddenStates = this.addAndNorm(attended, ffnOutput)
    }

    // Step 5: Generate logits (final linear projection)
    const logits = this.projectToVocab(hiddenStates)

    // Step 6: Calculate confidence
    const confidence = this.calculateConfidence(logits)

    const output: InferenceOutput = {
      logits,
      attentionWeights: allAttentionWeights,
      hiddenStates,
      confidence,
    }

    // Cache result
    if (this.config.useCache) {
      this.cache.set(cacheKey, output)
    }

    return output
  }

  /**
   * Add and normalize (residual connection + layer norm)
   */
  private addAndNorm(input: number[][], residual: number[][]): number[][] {
    const added = input.map((row, i) => row.map((val, j) => val + residual[i][j]))

    return layerNorm(added, this.config.modelDim)
  }

  /**
   * Project hidden states to vocabulary logits
   */
  private projectToVocab(hiddenStates: number[][]): number[][] {
    // Simple linear projection (in production, this would use learned weights)
    return hiddenStates.map((state) => state.map((val) => val * 0.1))
  }

  /**
   * Calculate confidence from logits
   */
  private calculateConfidence(logits: number[][]): number {
    // Calculate average max probability across sequence
    const maxProbs = logits.map((logit) => {
      const expLogits = logit.map((l) => Math.exp(l))
      const sumExp = expLogits.reduce((a, b) => a + b, 0)
      return Math.max(...expLogits) / sumExp
    })

    return maxProbs.reduce((a, b) => a + b, 0) / maxProbs.length
  }

  /**
   * Clear inference cache
   */
  public clearCache(): void {
    this.cache.clear()
  }
}

// Export default configuration
export const defaultInferenceConfig: InferenceConfig = {
  modelDim: 512,
  numHeads: 8,
  numLayers: 6,
  ffnDim: 2048,
  maxSeqLength: 2048,
  dropoutRate: 0.1,
  useCache: true,
}

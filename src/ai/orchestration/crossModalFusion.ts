/**
 * File: src/ai/orchestration/crossModalFusion.ts
 * 
 * Handles fusion of multi-modal data (text, image, audio, code) for
 * integrated multi-modal reasoning and understanding.
 * 
 * Integration:
 * - Called by: mainOrchestrator.ts
 * - Uses: Multi-modal fusion model, cross-attention mechanisms
 * - Coordinates: Text, vision, audio, code models
 */

import { logger } from "./logger"

export interface ModalityData {
  modality: "text" | "image" | "audio" | "code" | "graph"
  content: unknown
  embedding?: Float32Array
  metadata: {
    source: string
    confidence: number
    [key: string]: unknown
  }
}

export interface FusedOutput {
  unifiedRepresentation: Float32Array
  modalityWeights: Map<string, number>
  fusedContent: string
  metadata: {
    modalitiesUsed: string[]
    fusionStrategy: string
    confidence: number
  }
}

/**
 * CrossModalFusion Class
 * 
 * Integrates multiple modalities for comprehensive understanding
 */
export class CrossModalFusion {
  private fusionStrategies: Map<string, (data: ModalityData[]) => FusedOutput>

  constructor() {
    this.fusionStrategies = new Map()
    this.initializeFusionStrategies()
  }

  /**
   * Initialize fusion strategies
   */
  private initializeFusionStrategies(): void {
    // Early fusion: Combine at input level
    this.fusionStrategies.set("early", (data) => this.earlyFusion(data))

    // Late fusion: Combine at output level
    this.fusionStrategies.set("late", (data) => this.lateFusion(data))

    // Hybrid fusion: Combine at multiple levels
    this.fusionStrategies.set("hybrid", (data) => this.hybridFusion(data))

    // Attention-based fusion: Use cross-attention
    this.fusionStrategies.set("attention", (data) => this.attentionFusion(data))
  }

  /**
   * Fuse multi-modal data
   */
  public fuse(
    modalityData: ModalityData[],
    strategy: "early" | "late" | "hybrid" | "attention" = "hybrid"
  ): FusedOutput {
    logger.info("CrossModalFusion: Fusing modalities", {
      modalityCount: modalityData.length,
      modalities: modalityData.map((d) => d.modality),
      strategy,
    })

    if (modalityData.length === 0) {
      return this.getEmptyFusion()
    }

    if (modalityData.length === 1) {
      return this.singleModalityFusion(modalityData[0])
    }

    // Get fusion strategy
    const strategyFn = this.fusionStrategies.get(strategy) || this.fusionStrategies.get("hybrid")!

    // Apply fusion
    const fused = strategyFn(modalityData)

    logger.info("CrossModalFusion: Fusion complete", {
      modalitiesUsed: fused.metadata.modalitiesUsed.length,
      confidence: fused.metadata.confidence,
    })

    return fused
  }

  /**
   * Early fusion: Combine raw inputs
   */
  private earlyFusion(data: ModalityData[]): FusedOutput {
    // Concatenate embeddings from all modalities
    const embeddings: Float32Array[] = []
    const modalityWeights = new Map<string, number>()

    for (const modalityData of data) {
      if (modalityData.embedding) {
        embeddings.push(modalityData.embedding)
        modalityWeights.set(modalityData.modality, 1.0 / data.length)
      }
    }

    // Concatenate all embeddings
    const totalLength = embeddings.reduce((sum, emb) => sum + emb.length, 0)
    const unified = new Float32Array(totalLength)

    let offset = 0
    for (const embedding of embeddings) {
      unified.set(embedding, offset)
      offset += embedding.length
    }

    // Generate fused content description
    const fusedContent = this.generateFusedDescription(data)

    return {
      unifiedRepresentation: unified,
      modalityWeights,
      fusedContent,
      metadata: {
        modalitiesUsed: data.map((d) => d.modality),
        fusionStrategy: "early",
        confidence: this.calculateAverageConfidence(data),
      },
    }
  }

  /**
   * Late fusion: Combine processed outputs
   */
  private lateFusion(data: ModalityData[]): FusedOutput {
    // Process each modality independently, then combine
    const modalityWeights = this.calculateModalityWeights(data)

    // Weighted average of embeddings
    const unified = this.weightedAverageEmbeddings(data, modalityWeights)

    // Combine content with weights
    const fusedContent = this.weightedCombineContent(data, modalityWeights)

    return {
      unifiedRepresentation: unified,
      modalityWeights,
      fusedContent,
      metadata: {
        modalitiesUsed: data.map((d) => d.modality),
        fusionStrategy: "late",
        confidence: this.calculateWeightedConfidence(data, modalityWeights),
      },
    }
  }

  /**
   * Hybrid fusion: Multi-level fusion
   */
  private hybridFusion(data: ModalityData[]): FusedOutput {
    // Combine early and late fusion
    const earlyFused = this.earlyFusion(data)
    const lateFused = this.lateFusion(data)

    // Merge the two approaches
    const unified = this.mergeEmbeddings(earlyFused.unifiedRepresentation, lateFused.unifiedRepresentation)

    const fusedContent = `${earlyFused.fusedContent}\n\n${lateFused.fusedContent}`

    return {
      unifiedRepresentation: unified,
      modalityWeights: lateFused.modalityWeights,
      fusedContent,
      metadata: {
        modalitiesUsed: data.map((d) => d.modality),
        fusionStrategy: "hybrid",
        confidence: (earlyFused.metadata.confidence + lateFused.metadata.confidence) / 2,
      },
    }
  }

  /**
   * Attention-based fusion: Cross-attention between modalities
   */
  private attentionFusion(data: ModalityData[]): FusedOutput {
    // Calculate attention weights between modalities
    const attentionMatrix = this.calculateCrossAttention(data)

    // Apply attention to combine modalities
    const unified = this.applyAttention(data, attentionMatrix)

    const modalityWeights = this.extractModalityWeights(data, attentionMatrix)

    const fusedContent = this.generateAttentionBasedDescription(data, modalityWeights)

    return {
      unifiedRepresentation: unified,
      modalityWeights,
      fusedContent,
      metadata: {
        modalitiesUsed: data.map((d) => d.modality),
        fusionStrategy: "attention",
        confidence: this.calculateAttentionConfidence(data, attentionMatrix),
      },
    }
  }

  /**
   * Calculate modality weights based on confidence
   */
  private calculateModalityWeights(data: ModalityData[]): Map<string, number> {
    const weights = new Map<string, number>()
    const totalConfidence = data.reduce((sum, d) => sum + d.metadata.confidence, 0)

    for (const modalityData of data) {
      const weight = modalityData.metadata.confidence / totalConfidence
      weights.set(modalityData.modality, weight)
    }

    return weights
  }

  /**
   * Weighted average of embeddings
   */
  private weightedAverageEmbeddings(
    data: ModalityData[],
    weights: Map<string, number>
  ): Float32Array {
    if (data.length === 0 || !data[0].embedding) {
      return new Float32Array(512) // Default size
    }

    const embeddingSize = data[0].embedding.length
    const averaged = new Float32Array(embeddingSize)

    for (const modalityData of data) {
      if (modalityData.embedding) {
        const weight = weights.get(modalityData.modality) || 0
        for (let i = 0; i < embeddingSize; i++) {
          averaged[i] += modalityData.embedding[i] * weight
        }
      }
    }

    return averaged
  }

  /**
   * Weighted combine content
   */
  private weightedCombineContent(
    data: ModalityData[],
    weights: Map<string, number>
  ): string {
    const sorted = data.sort(
      (a, b) => (weights.get(b.modality) || 0) - (weights.get(a.modality) || 0)
    )

    const descriptions: string[] = []

    for (const modalityData of sorted) {
      const weight = weights.get(modalityData.modality) || 0
      if (weight > 0.1) {
        // Only include significant modalities
        descriptions.push(
          `[${modalityData.modality} - ${(weight * 100).toFixed(1)}%]: ${
            typeof modalityData.content === "string"
              ? modalityData.content
              : JSON.stringify(modalityData.content)
          }`
        )
      }
    }

    return descriptions.join("\n\n")
  }

  /**
   * Generate fused description
   */
  private generateFusedDescription(data: ModalityData[]): string {
    const modalities = data.map((d) => d.modality).join(", ")
    return `Fused representation combining ${modalities} modalities for comprehensive understanding.`
  }

  /**
   * Calculate cross-attention matrix
   */
  private calculateCrossAttention(data: ModalityData[]): number[][] {
    const n = data.length
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0))

    // Simplified attention: based on confidence similarity
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0
        } else {
          const confDiff = Math.abs(
            data[i].metadata.confidence - data[j].metadata.confidence
          )
          matrix[i][j] = Math.exp(-confDiff) // Exponential decay
        }
      }
    }

    return matrix
  }

  /**
   * Apply attention to combine embeddings
   */
  private applyAttention(data: ModalityData[], attention: number[][]): Float32Array {
    if (data.length === 0 || !data[0].embedding) {
      return new Float32Array(512)
    }

    const embeddingSize = data[0].embedding.length
    const combined = new Float32Array(embeddingSize)

    for (let i = 0; i < data.length; i++) {
      if (data[i].embedding) {
        let attentionWeight = 0
        for (let j = 0; j < data.length; j++) {
          attentionWeight += attention[i][j]
        }
        attentionWeight = attentionWeight / data.length

        for (let k = 0; k < embeddingSize; k++) {
          combined[k] += data[i].embedding![k] * attentionWeight
        }
      }
    }

    return combined
  }

  /**
   * Extract modality weights from attention matrix
   */
  private extractModalityWeights(
    data: ModalityData[],
    attention: number[][]
  ): Map<string, number> {
    const weights = new Map<string, number>()
    if (data.length === 0) {
      return weights
    }

    const distribution = this.getAttentionDistribution(attention)

    if (distribution.length === 0) {
      const uniformWeight = 1 / data.length
      for (const modalityData of data) {
        weights.set(modalityData.modality, uniformWeight)
      }
      return weights
    }

    const count = Math.min(data.length, distribution.length)
    for (let i = 0; i < count; i++) {
      weights.set(data[i].modality, distribution[i])
    }

    return weights
  }

  /**
   * Generate attention-based description
   */
  private generateAttentionBasedDescription(
    data: ModalityData[],
    weights: Map<string, number>
  ): string {
    if (weights.size === 0) {
      return this.generateFusedDescription(data)
    }

    const ranked = [...weights.entries()].sort(([, a], [, b]) => b - a)
    const descriptions = ranked.map(([modality, weight]) => {
      const modalityData = data.find((d) => d.modality === modality)
      const summary = typeof modalityData?.content === "string"
        ? modalityData.content
        : JSON.stringify(modalityData?.content ?? {})
      const confidence = modalityData?.metadata.confidence ?? 0
      return `[${modality} ${(weight * 100).toFixed(1)}% | confidence ${confidence.toFixed(2)}] ${summary}`
    })

    return descriptions.join("\n")
  }

  /**
   * Calculate average confidence
   */
  private calculateAverageConfidence(data: ModalityData[]): number {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, d) => acc + d.metadata.confidence, 0)
    return sum / data.length
  }

  /**
   * Calculate weighted confidence
   */
  private calculateWeightedConfidence(
    data: ModalityData[],
    weights: Map<string, number>
  ): number {
    let weightedSum = 0
    for (const modalityData of data) {
      const weight = weights.get(modalityData.modality) || 0
      weightedSum += modalityData.metadata.confidence * weight
    }
    return weightedSum
  }

  /**
   * Calculate attention-based confidence
   */
  private calculateAttentionConfidence(data: ModalityData[], attention: number[][]): number {
    if (data.length === 0) {
      return 0
    }

    const distribution = this.getAttentionDistribution(attention)
    if (distribution.length === 0) {
      return this.calculateAverageConfidence(data)
    }

    let confidence = 0
    const count = Math.min(data.length, distribution.length)
    for (let i = 0; i < count; i++) {
      confidence += data[i].metadata.confidence * distribution[i]
    }
    return confidence
  }

  private getAttentionDistribution(attention: number[][]): number[] {
    if (attention.length === 0) {
      return []
    }

    const rowSums = attention.map((row) => row.reduce((acc, value) => acc + value, 0))
    const total = rowSums.reduce((acc, value) => acc + value, 0)

    if (total === 0) {
      return []
    }

    return rowSums.map((sum) => sum / total)
  }

  /**
   * Merge two embeddings
   */
  private mergeEmbeddings(emb1: Float32Array, emb2: Float32Array): Float32Array {
    const minLength = Math.min(emb1.length, emb2.length)
    const merged = new Float32Array(minLength)

    for (let i = 0; i < minLength; i++) {
      merged[i] = (emb1[i] + emb2[i]) / 2
    }

    return merged
  }

  /**
   * Single modality fusion
   */
  private singleModalityFusion(data: ModalityData): FusedOutput {
    return {
      unifiedRepresentation: data.embedding || new Float32Array(512),
      modalityWeights: new Map([[data.modality, 1.0]]),
      fusedContent:
        typeof data.content === "string" ? data.content : JSON.stringify(data.content),
      metadata: {
        modalitiesUsed: [data.modality],
        fusionStrategy: "single",
        confidence: data.metadata.confidence,
      },
    }
  }

  /**
   * Empty fusion result
   */
  private getEmptyFusion(): FusedOutput {
    return {
      unifiedRepresentation: new Float32Array(512),
      modalityWeights: new Map(),
      fusedContent: "",
      metadata: {
        modalitiesUsed: [],
        fusionStrategy: "none",
        confidence: 0,
      },
    }
  }
}

export default CrossModalFusion

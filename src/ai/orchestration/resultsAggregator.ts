/**
 * File: src/ai/orchestration/resultsAggregator.ts
 * 
 * Combines outputs from multiple AI models and knowledge domains into
 * a unified response. Handles merging, deduplication, and synthesis.
 * 
 * Integration:
 * - Called by: mainOrchestrator.ts
 * - Uses: responseSynthesizer.ts for final synthesis
 * - Returns: Aggregated results ready for formatting
 */

import { logger } from "./logger"

export interface ModelResult {
  source: string // Model or domain name
  sourceType: "model" | "domain"
  content: string
  confidence: number
  metadata: {
    processingTime?: number
    tokensUsed?: number
    [key: string]: unknown
  }
}

export interface AggregatedResult {
  primaryContent: string
  supplementaryContent: string[]
  sources: string[]
  confidence: number
  metadata: {
    totalSources: number
    averageConfidence: number
    processingTime: number
    combinationStrategy: string
  }
}

/**
 * ResultsAggregator Class
 * 
 * Combines multi-source AI outputs intelligently
 */
export class ResultsAggregator {
  private aggregationStrategies: Map<string, (results: ModelResult[]) => string>

  constructor() {
    this.aggregationStrategies = new Map()
    this.initializeStrategies()
  }

  /**
   * Initialize aggregation strategies
   */
  private initializeStrategies(): void {
    // Best result strategy: Pick highest confidence
    this.aggregationStrategies.set("best", (results) => {
      const sorted = results.sort((a, b) => b.confidence - a.confidence)
      return sorted[0]?.content || ""
    })

    // Merge strategy: Combine all unique insights
    this.aggregationStrategies.set("merge", (results) => {
      return this.mergeContent(results)
    })

    // Consensus strategy: Find common elements
    this.aggregationStrategies.set("consensus", (results) => {
      return this.findConsensus(results)
    })

    // Weighted average strategy: Weight by confidence
    this.aggregationStrategies.set("weighted", (results) => {
      return this.weightedMerge(results)
    })
  }

  /**
   * Aggregate results from multiple sources
   */
  public aggregate(
    results: ModelResult[],
    strategy: "best" | "merge" | "consensus" | "weighted" = "weighted"
  ): AggregatedResult {
    const startTime = Date.now()

    logger.info("ResultsAggregator", "Aggregating results", {
      resultCount: results.length,
      strategy,
      sources: results.map((r) => r.source),
    })

    if (results.length === 0) {
      return this.getEmptyResult()
    }

    // Single result - no aggregation needed
    if (results.length === 1) {
      return this.convertSingleResult(results[0], Date.now() - startTime)
    }

    // Get aggregation strategy
    const strategyFn = this.aggregationStrategies.get(strategy) || this.aggregationStrategies.get("weighted")!

    // Apply strategy
    const primaryContent = strategyFn(results)

    // Extract supplementary content
    const supplementaryContent = this.extractSupplementary(results, primaryContent)

    // Calculate overall confidence
    const averageConfidence = this.calculateAverageConfidence(results)

    // Get all unique sources
    const sources = [...new Set(results.map((r) => r.source))]

    const processingTime = Date.now() - startTime

    const aggregated: AggregatedResult = {
      primaryContent,
      supplementaryContent,
      sources,
      confidence: averageConfidence,
      metadata: {
        totalSources: sources.length,
        averageConfidence,
        processingTime,
        combinationStrategy: strategy,
      },
    }

    logger.info("ResultsAggregator", "Results aggregated", {
      sourcesCount: sources.length,
      confidence: averageConfidence,
      processingTime,
    })

    return aggregated
  }

  /**
   * Merge content from multiple results
   */
  private mergeContent(results: ModelResult[]): string {
    // Sort by confidence
    const sorted = results.sort((a, b) => b.confidence - a.confidence)

    // Start with highest confidence result
    let merged = sorted[0]?.content || ""

    // Add unique insights from other results
    for (let i = 1; i < sorted.length; i++) {
      const additional = this.extractUniqueInsights(merged, sorted[i].content)
      if (additional) {
        merged += "\n\n" + additional
      }
    }

    return merged
  }

  /**
   * Find consensus among results
   */
  private findConsensus(results: ModelResult[]): string {
    if (results.length === 0) return ""

    // Extract common phrases/sentences
    const allSentences = results.map((r) => this.splitIntoSentences(r.content))
    const commonSentences = this.findCommonElements(allSentences)

    // If we have common sentences, use those
    if (commonSentences.length > 0) {
      return commonSentences.join(" ")
    }

    // Otherwise, return highest confidence result
    const sorted = results.sort((a, b) => b.confidence - a.confidence)
    return sorted[0]?.content || ""
  }

  /**
   * Weighted merge based on confidence
   */
  private weightedMerge(results: ModelResult[]): string {
    // Sort by confidence
    const sorted = results.sort((a, b) => b.confidence - a.confidence)

    // Use top result as base
    let merged = sorted[0]?.content || ""

    // Add highly confident supplementary content
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].confidence > 0.7) {
        const additional = this.extractUniqueInsights(merged, sorted[i].content)
        if (additional) {
          merged += "\n\n" + additional
        }
      }
    }

    return merged
  }

  /**
   * Extract unique insights from content
   */
  private extractUniqueInsights(existing: string, newContent: string): string {
    const existingSentences = this.splitIntoSentences(existing)
    const newSentences = this.splitIntoSentences(newContent)

    const uniqueSentences = newSentences.filter((sentence) => {
      // Check if sentence is significantly different from existing ones
      return !existingSentences.some((existing) => this.areSimilar(existing, sentence))
    })

    return uniqueSentences.join(" ")
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Check if two sentences are similar
   */
  private areSimilar(sentence1: string, sentence2: string): boolean {
    const words1 = sentence1.toLowerCase().split(/\s+/)
    const words2 = sentence2.toLowerCase().split(/\s+/)

    // Calculate word overlap
    const common = words1.filter((word) => words2.includes(word))
    const similarity = (common.length * 2) / (words1.length + words2.length)

    return similarity > 0.6 // 60% similarity threshold
  }

  /**
   * Find common elements across arrays
   */
  private findCommonElements(arrays: string[][]): string[] {
    if (arrays.length === 0) return []
    if (arrays.length === 1) return arrays[0]

    // Find elements that appear in at least half of the arrays
    const threshold = Math.ceil(arrays.length / 2)
    const counts = new Map<string, number>()

    for (const array of arrays) {
      const unique = [...new Set(array)]
      for (const item of unique) {
        counts.set(item, (counts.get(item) || 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([item]) => item)
  }

  /**
   * Extract supplementary content
   */
  private extractSupplementary(results: ModelResult[], primaryContent: string): string[] {
    const supplementary: string[] = []

    for (const result of results) {
      if (result.content !== primaryContent) {
        const unique = this.extractUniqueInsights(primaryContent, result.content)
        if (unique && unique.length > 20) {
          // Only include substantial content
          supplementary.push(unique)
        }
      }
    }

    return supplementary
  }

  /**
   * Calculate average confidence
   */
  private calculateAverageConfidence(results: ModelResult[]): number {
    if (results.length === 0) return 0

    const sum = results.reduce((acc, r) => acc + r.confidence, 0)
    return sum / results.length
  }

  /**
   * Convert single result to aggregated format
   */
  private convertSingleResult(result: ModelResult, processingTime: number): AggregatedResult {
    return {
      primaryContent: result.content,
      supplementaryContent: [],
      sources: [result.source],
      confidence: result.confidence,
      metadata: {
        totalSources: 1,
        averageConfidence: result.confidence,
        processingTime,
        combinationStrategy: "single",
      },
    }
  }

  /**
   * Get empty result
   */
  private getEmptyResult(): AggregatedResult {
    return {
      primaryContent: "",
      supplementaryContent: [],
      sources: [],
      confidence: 0,
      metadata: {
        totalSources: 0,
        averageConfidence: 0,
        processingTime: 0,
        combinationStrategy: "none",
      },
    }
  }

  /**
   * Aggregate by source type (models vs domains)
   */
  public aggregateBySourceType(results: ModelResult[]): {
    modelResults: AggregatedResult
    domainResults: AggregatedResult
  } {
    const modelResults = results.filter((r) => r.sourceType === "model")
    const domainResults = results.filter((r) => r.sourceType === "domain")

    return {
      modelResults: this.aggregate(modelResults, "weighted"),
      domainResults: this.aggregate(domainResults, "merge"),
    }
  }
}

export default ResultsAggregator

/**
 * File: src/ai/orchestration/tokenManager.ts
 * 
 * Token Manager for ZacAi-Atomic
 * Manages token limits, context windows, and token counting across all models
 * 
 * Responsibilities:
 * - Track token usage for billing and optimization
 * - Enforce model-specific token limits
 * - Manage context window size
 * - Chunk large prompts
 * - Token counting utilities
 */

import { logger } from "./logger"

/**
 * Token limits for different models
 */
const MODEL_TOKEN_LIMITS: Record<string, number> = {
  "unified-transformer-llm": 8192,
  "code-transformer": 16384,
  "multi-modal-fusion": 4096,
  "default": 4096,
}

/**
 * Token usage tracking interface
 */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  model: string
  timestamp: number
}

/**
 * Token Manager Class
 */
export class TokenManager {
  private usageHistory: TokenUsage[] = []
  private sessionTokenCount: Map<string, number> = new Map()

  /**
   * Estimate token count for text
   * Simple estimation: ~4 characters per token
   */
  public estimateTokenCount(text: string): number {
    // More accurate: split on whitespace and punctuation
    const tokens = text.split(/[\s\n,.!?;:]+/).filter(Boolean)
    return tokens.length
  }

  /**
   * Check if prompt fits within model's token limit
   */
  public fitsInLimit(text: string, modelName: string): boolean {
    const tokenCount = this.estimateTokenCount(text)
    const limit = MODEL_TOKEN_LIMITS[modelName] || MODEL_TOKEN_LIMITS.default
    return tokenCount <= limit
  }

  /**
   * Get remaining tokens available for model
   */
  public getRemainingTokens(currentPrompt: string, modelName: string): number {
    const used = this.estimateTokenCount(currentPrompt)
    const limit = MODEL_TOKEN_LIMITS[modelName] || MODEL_TOKEN_LIMITS.default
    return Math.max(0, limit - used)
  }

  /**
   * Chunk large text into token-limited segments
   */
  public chunkText(
    text: string,
    modelName: string,
    overlapTokens: number = 100
  ): string[] {
    const limit = MODEL_TOKEN_LIMITS[modelName] || MODEL_TOKEN_LIMITS.default
    const chunks: string[] = []
    
    const sentences = text.split(/(?<=[.!?])\s+/)
    let currentChunk = ""
    
    for (const sentence of sentences) {
      const potentialChunk = currentChunk + " " + sentence
      
      if (this.estimateTokenCount(potentialChunk) > limit - overlapTokens) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = sentence
      } else {
        currentChunk = potentialChunk
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  /**
   * Track token usage for a request
   */
  public trackUsage(
    inputTokens: number,
    outputTokens: number,
    modelName: string,
    sessionId?: string
  ): void {
    const usage: TokenUsage = {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model: modelName,
      timestamp: Date.now(),
    }
    
    this.usageHistory.push(usage)
    
    if (sessionId) {
      const currentCount = this.sessionTokenCount.get(sessionId) || 0
      this.sessionTokenCount.set(sessionId, currentCount + usage.totalTokens)
    }
    
    logger.info("Token usage tracked", {
      model: modelName,
      input: inputTokens,
      output: outputTokens,
      total: usage.totalTokens,
    })
  }

  /**
   * Get total tokens used in session
   */
  public getSessionUsage(sessionId: string): number {
    return this.sessionTokenCount.get(sessionId) || 0
  }

  /**
   * Get usage statistics
   */
  public getUsageStats(): {
    totalRequests: number
    totalTokens: number
    averageTokensPerRequest: number
    byModel: Record<string, number>
  } {
    const totalRequests = this.usageHistory.length
    const totalTokens = this.usageHistory.reduce((sum, u) => sum + u.totalTokens, 0)
    const byModel: Record<string, number> = {}
    
    for (const usage of this.usageHistory) {
      byModel[usage.model] = (byModel[usage.model] || 0) + usage.totalTokens
    }
    
    return {
      totalRequests,
      totalTokens,
      averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      byModel,
    }
  }

  /**
   * Clear old usage history (keep last 1000 entries)
   */
  public pruneHistory(): void {
    if (this.usageHistory.length > 1000) {
      this.usageHistory = this.usageHistory.slice(-1000)
    }
  }

  /**
   * Get model token limit
   */
  public getModelLimit(modelName: string): number {
    return MODEL_TOKEN_LIMITS[modelName] || MODEL_TOKEN_LIMITS.default
  }

  /**
   * Set custom token limit for model
   */
  public setModelLimit(modelName: string, limit: number): void {
    MODEL_TOKEN_LIMITS[modelName] = limit
    logger.info(`Token limit updated for ${modelName}`, { limit })
  }
}

// Export singleton instance
export const tokenManager = new TokenManager()

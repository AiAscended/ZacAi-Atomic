/**
 * File: src/ai/orchestration/promptHandler.ts
 * Purpose: High-level prompt handler that coordinates the complete AI pipeline
 * from user input to final response, integrating all atomic modules.
 *
 * Dependencies:
 * - src/ai/orchestration/aiOrchestrator.ts (main orchestrator)
 * - src/ai/input_processing/* (input processing modules)
 * - src/ai/context_management/* (context and session management)
 * - src/ai/knowledge_retrieval/* (knowledge retrieval and search)
 * - src/ai/inference/* (inference execution)
 * - src/ai/output_generation/* (response generation)
 * - src/ai/training/* (learning pipeline)
 *
 * Depended on by:
 * - src/ui/pages/index.tsx (chat interface)
 * - src/api/* (API endpoints)
 */

import { AIOrchestrator, type Prompt, type Response } from "./aiOrchestrator"
import { textNormalizer } from "../input_processing/textNormalizer"
import { detectLanguage } from "../input_processing/languageDetector"
import { noiseFilter } from "../input_processing/noiseFilter"
import { sentenceBoundaryDetector } from "../input_processing/sentenceBoundaryDetector"
import { wordTokenizer } from "../input_processing/wordTokenizer"
import { publish } from "./eventBus"

/**
 * Enhanced prompt with preprocessing metadata
 */
export interface EnhancedPrompt extends Prompt {
  normalized: string
  language: string
  tokens: string[]
  sentences: string[]
  isClean: boolean
}

/**
 * Prompt Handler - Coordinates the complete AI pipeline
 */
export class PromptHandler {
  private orchestrator: AIOrchestrator

  constructor() {
    this.orchestrator = AIOrchestrator.getInstance()
  }

  /**
   * Process a raw user prompt through the complete AI pipeline
   */
  public async handlePrompt(
    rawText: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<Response> {
    const startTime = Date.now()

    // Step 1: Input Processing Pipeline
    const enhancedPrompt = this.preprocessInput(rawText, sessionId, metadata)

    // Step 2: Validate input
    if (!enhancedPrompt.isClean || enhancedPrompt.tokens.length === 0) {
      return this.createErrorResponse("Invalid or empty input", enhancedPrompt)
    }

    // Step 3: Process through orchestrator
    try {
      const response = await this.orchestrator.processPrompt(enhancedPrompt)

      // Step 4: Publish metrics
      publish("prompt:processed", {
        sessionId: enhancedPrompt.sessionId,
        language: enhancedPrompt.language,
        tokenCount: enhancedPrompt.tokens.length,
        sentenceCount: enhancedPrompt.sentences.length,
        domains: response.domains,
        confidence: response.confidence,
        duration: Date.now() - startTime,
      })

      return response
    } catch (error) {
      console.error("[PromptHandler] Error processing prompt:", error)
      return this.createErrorResponse("An error occurred while processing your request", enhancedPrompt)
    }
  }

  /**
   * Preprocess raw input through atomic input processing modules
   */
  private preprocessInput(rawText: string, sessionId?: string, metadata?: Record<string, unknown>): EnhancedPrompt {
    // Apply noise filtering
    const filtered = noiseFilter(rawText)

    // Normalize text
    const normalized = textNormalizer(filtered)

    // Detect language
    const language = detectLanguage(normalized)

    // Tokenize
    const tokens = wordTokenizer(normalized)

    // Detect sentence boundaries
    const sentences = sentenceBoundaryDetector(normalized)

    // Check if input is clean
    const isClean = tokens.length > 0 && normalized.length > 0

    return {
      text: rawText,
      normalized,
      language,
      tokens,
      sentences,
      isClean,
      sessionId,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        originalLength: rawText.length,
        normalizedLength: normalized.length,
        tokenCount: tokens.length,
        sentenceCount: sentences.length,
      },
    }
  }

  /**
   * Create an error response
   */
  private createErrorResponse(message: string, prompt: EnhancedPrompt): Response {
    return {
      text: message,
      sources: [],
      confidence: 0,
      domains: [],
      timestamp: Date.now(),
      metadata: {
        error: true,
        prompt: prompt.text,
      },
    }
  }

  /**
   * Get session history
   */
  public getSessionHistory(sessionId: string): string[] {
    // Future: implement session history retrieval
    return []
  }

  /**
   * Clear session
   */
  public clearSession(sessionId: string): void {
    // Future: implement session clearing
    publish("session:cleared", { sessionId, timestamp: Date.now() })
  }
}

// Export singleton instance
export const promptHandler = new PromptHandler()

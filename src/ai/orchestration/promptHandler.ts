/**
 * File: src/ai/orchestration/promptHandler.ts
 * Purpose: High-level prompt handler that coordinates the complete AI pipeline
 * from user input to final response, integrating all atomic modules.
 *
 * Dependencies:
 * - src/ai/orchestration/mainOrchestrator.ts (main conductor)
 * - src/ai/input_processing/* (input processing modules)
 * - src/ai/context_management/* (context and session management)
 * - src/ai/knowledge_retrieval/* (knowledge retrieval and search)
 * - src/ai/inference/* (inference execution)
 * - src/ai/output_generation/* (response generation)
 * - src/ai/training/* (learning pipeline)
 *
 * Depended on by:
 * - src/app/page.tsx (chat interface)
 * - src/app/api/* (API endpoints)
 */

import {
  MainOrchestrator,
  type OrchestratorResponse,
} from "./mainOrchestrator";
import { textNormalizer } from "../input_processing/textNormalizer";
import { detectLanguage } from "../input_processing/languageDetector";
import { noiseFilter } from "../input_processing/noiseFilter";
import { detectSentences } from "../input_processing/sentenceBoundaryDetector";
import { wordTokenizer } from "../input_processing/wordTokenizer";
import { publish } from "./eventBus";

/**
 * Enhanced prompt with preprocessing metadata
 */
export interface EnhancedPrompt {
  normalized: string;
  language: string;
  tokens: string[];
  sentences: string[];
  isClean: boolean;
  sessionId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Prompt Handler - Coordinates the complete AI pipeline
 * Thin wrapper around MainOrchestrator with input preprocessing
 */
export class PromptHandler {
  private orchestrator: MainOrchestrator;

  constructor() {
    this.orchestrator = MainOrchestrator.getInstance();
  }

  /**
   * Initialize the prompt handler and main orchestrator
   */
  public async initialize(): Promise<void> {
    await this.orchestrator.initialize();
  }

  /**
   * Process a raw user prompt through the complete AI pipeline
   */
  public async handlePrompt(
    rawText: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<OrchestratorResponse> {
    const startTime = Date.now();

    // Step 1: Input Processing Pipeline
    const enhancedPrompt = this.preprocessInput(rawText, sessionId, metadata);

    // Step 2: Validate input
    if (!enhancedPrompt.isClean || enhancedPrompt.tokens.length === 0) {
      return this.createErrorResponse("Invalid or empty input", rawText);
    }

    // Step 3: Process through main orchestrator
    try {
      const response = await this.orchestrator.processPrompt(
        enhancedPrompt.normalized,
        sessionId || `session-${Date.now()}`,
        metadata,
      );

      // Step 4: Publish metrics
      publish("prompt:processed", {
        sessionId: enhancedPrompt.sessionId,
        language: enhancedPrompt.language,
        tokenCount: enhancedPrompt.tokens.length,
        sentenceCount: enhancedPrompt.sentences.length,
        domains: response.domains,
        confidence: response.confidence,
        duration: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      console.error("[PromptHandler] Error processing prompt:", error);
      return this.createErrorResponse(
        "An error occurred while processing your request",
        rawText,
      );
    }
  }

  /**
   * Preprocess raw input through atomic input processing modules
   */
  private preprocessInput(
    rawText: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): EnhancedPrompt {
    // Apply noise filtering
    const filtered = noiseFilter(rawText);

    // Normalize text
    const normalized = textNormalizer(filtered);

    // Detect language
    const language = detectLanguage(normalized);

    // Tokenize
    const tokens = wordTokenizer(normalized);

    // Detect sentence boundaries
    const sentences = detectSentences(normalized);

    // Check if input is clean
    const isClean = tokens.length > 0 && normalized.length > 0;

    return {
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
    };
  }

  /**
   * Create an error response
   */
  private createErrorResponse(
    message: string,
    _originalPrompt: string,
  ): OrchestratorResponse {
    return {
      text: message,
      sources: [],
      confidence: 0,
      domains: [],
      metadata: {
        processingTime: 0,
        tokensUsed: 0,
        originalPromptLength: originalPrompt.length,
      },
      contentBlocks: {
        textBlocks: [{ id: "error-1", content: message }],
        codeBlocks: [],
      },
    };
  }

  /**
   * Get session history
   */
  public getSessionHistory(_sessionId: string): string[] {
    // TODO: Implement session history retrieval from stateManager
    return [];
  }

  /**
   * Clear session
   */
  public clearSession(sessionId: string): void {
    // TODO: Implement session clearing in stateManager
    publish("session:cleared", { sessionId, timestamp: Date.now() });
  }
}

// Export singleton instance
export const promptHandler = new PromptHandler();

/**
 * File: src/ai/orchestration/aiOrchestrator.ts
 * Main AI orchestration system managing prompt processing,
 * multi-domain query execution, response synthesis,
 * and incremental thinking tracking.
 *
 * Depends on:
 * - src/ai/orchestration/thinkingTracker.ts
 * - src/ai/input_processing/*
 * - src/ai/inference/domainQueryExecutor.ts
 * - src/ai/output_generation/responseSynthesizer.ts
 * - src/ai/context_management/interactionLogger.ts
 *
 * Used by:
 * - src/ai/orchestration/promptHandler.ts
 */

import { ThinkingTracker } from "./thinkingTracker"
import { PromptProcessor } from "../input_processing/promptProcessor"
import { DomainQueryExecutor } from "../inference/domainQueryExecutor"
import { ResponseSynthesizer } from "../output_generation/responseSynthesizer"
import { InteractionLogger } from "../context_management/interactionLogger"

export class AIOrchestrator {
  private thinkingTracker: ThinkingTracker
  private promptProcessor: PromptProcessor
  private domainQueryExecutor: DomainQueryExecutor
  private responseSynthesizer: ResponseSynthesizer
  private interactionLogger: InteractionLogger

  constructor() {
    this.thinkingTracker = new ThinkingTracker()
    this.promptProcessor = new PromptProcessor()
    this.domainQueryExecutor = new DomainQueryExecutor()
    this.responseSynthesizer = new ResponseSynthesizer()
    this.interactionLogger = new InteractionLogger()
  }

  /**
   * Initialize system, preload domains, cache, etc.
   */
  async initialize() {
    this.thinkingTracker.reset()
    // preload or verify models, domains, weights etc
  }

  /**
   * Main prompt processing pipeline orchestrator.
   * @param prompt raw user input string
   * @param sessionId session context id for state tracking
   * @param context extra metadata including chat history
   * @returns Object including modular multi-block response & reasoning metadata
   */
  async processPrompt(
    prompt: string,
    sessionId: string,
    context?: Record<string, unknown>,
  ): Promise<{
    text: string
    metadata: Record<string, unknown>
    domains: string[]
    confidence: number
    sources?: string[]
  }> {
    this.thinkingTracker.reset()

    // 1) Process & clean user prompt
    this.thinkingTracker.addStep("input_processing", "Processing input prompt")
    const processedInput = this.promptProcessor.process(prompt)

    // 2) Decompose prompt to subtasks/domain queries
    this.thinkingTracker.addStep("decompose", "Decomposing prompt to subtasks")
    const subtasks = await this.promptProcessor.decomposeSubtasks(processedInput)

    // 3) Query inference engines via domainQueryExecutor
    this.thinkingTracker.addStep("domain_query", "Executing domain queries")
    const domainResults = await this.domainQueryExecutor.queryDomains(subtasks)

    const domainOutputs = Object.entries(domainResults).map(([domain, value]) => {
      const normalizedResult =
        typeof value === "string"
          ? value
          : typeof value?.response === "string"
            ? value.response
            : JSON.stringify(value ?? {})

      return {
        domain,
        result: normalizedResult,
      }
    })

    // 4) Synthesize multi-domain results into response
    this.thinkingTracker.addStep("response_synth", "Synthesizing AI response")
    const response = this.responseSynthesizer.synthesize({
      llmOutput: processedInput,
      domainOutputs,
      originalPrompt: prompt,
    })

    // 5) Log interaction for analytics and debugging
    this.interactionLogger.log(sessionId, prompt, response)

    // Attach thinking steps to response metadata for frontend UI
    const resolvedDomains =
      response.metadata?.combinedDomains?.length > 0
        ? response.metadata.combinedDomains
        : domainOutputs.map((output) => output.domain)

    return {
      ...response,
      domains: resolvedDomains,
      metadata: {
        ...response.metadata,
        thinkingSteps: this.thinkingTracker.getSteps(),
      },
    }
  }
}

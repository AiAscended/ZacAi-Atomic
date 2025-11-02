/**
 * File: src/ai/orchestration/mainOrchestrator.ts
 * 
 * Main AI Orchestration System for ZacAi-Atomic
 * 
 * This is the central hub that coordinates the entire AI pipeline:
 * 1. Input Processing → Extract keywords, tokenize, normalize
 * 2. Domain Selection → Route to appropriate knowledge domains
 * 3. Model Inference → Use LLM and specialized models for generation
 * 4. Response Synthesis → Combine multi-domain results
 * 5. Output Formatting → Format for UI display
 * 
 * Flow Chain:
 * User Input → PromptProcessor → MainOrchestrator → 
 * → Knowledge Domains (19 specialized inference engines) →
 * → AI Models (LLM, CNN, RNN, etc.) →
 * → ResponseSynthesizer → ResponseFormatter → UI
 * 
 * Naming Convention: camelCase (TypeScript/Next.js best practice)
 */

import { ThinkingTracker } from "./thinkingTracker"
import { PromptProcessor } from "../input_processing/promptProcessor"
import { DomainQueryExecutor } from "../inference/domainQueryExecutor"
import { ResponseSynthesizer } from "../output_generation/responseSynthesizer"
import { formatResponse } from "./responseFormatter"
import * as logger from "./logger"

// Import domain registry for knowledge domain access
import { domainRegistry } from "../knowledge-domains/domainRegistry"

// Import LLM inference engine
import { LLMInferenceEngine } from "../models/unified-transformer-llm/llm-inference/llm-inferenceEngine"

// Import scientific calculator for quick mathematical inference
import { ScientificCalculator } from "../shared/tools/shared-ScientificCalculator"

// Import settings store for runtime configuration
import { settingsStore } from "../shared/config/settingsStore"
import type { OrchestratorSettings } from "../shared/types/adminSettings"

/**
 * Main Orchestrator Response Interface
 */
export interface OrchestratorResponse {
  text: string
  metadata: {
    thinkingSteps?: Array<{
      step: string
      description: string
      timestamp: number
      data?: Record<string, unknown>
    }>
    processingTime?: number
    tokensUsed?: number
    modelsInvoked?: string[]
    domainsQueried?: string[]
  }
  domains: string[]
  confidence: number
  sources?: string[]
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>
    codeBlocks: Array<{ id: string; language: string; code: string; filename?: string }>
  }
}

/**
 * MainOrchestrator Class
 * 
 * Singleton pattern for global AI coordination
 */
export class MainOrchestrator {
  private static instance: MainOrchestrator
  
  private thinkingTracker: ThinkingTracker
  private promptProcessor: PromptProcessor
  private domainQueryExecutor: DomainQueryExecutor
  private responseSynthesizer: ResponseSynthesizer
  private llmInferenceEngine: LLMInferenceEngine | null = null
  
  private initialized: boolean = false
  private availableDomains: string[] = []
  private availableModels: string[] = []
  
  // Runtime configuration from settings store
  private config: OrchestratorSettings | null = null

  private constructor() {
    this.thinkingTracker = new ThinkingTracker()
    this.promptProcessor = new PromptProcessor()
    this.domainQueryExecutor = new DomainQueryExecutor()
    this.responseSynthesizer = new ResponseSynthesizer()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MainOrchestrator {
    if (!MainOrchestrator.instance) {
      MainOrchestrator.instance = new MainOrchestrator()
    }
    return MainOrchestrator.instance
  }

  /**
   * Initialize the complete AI system
   * - Load runtime configuration from settings store
   * - Load all knowledge domains
   * - Initialize AI models (LLM, CNN, etc.)
   * - Verify weights and configurations
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info("MainOrchestrator already initialized", {})
      return
    }

    logger.info("Initializing MainOrchestrator...", {})
    const startTime = Date.now()

    try {
      // Step 0: Load runtime configuration
      this.thinkingTracker.addStep("load_config", "Loading orchestrator configuration")
      this.config = await settingsStore.getOrchestrator()
      logger.info("Orchestrator configuration loaded", { config: this.config })
      
      // Step 1: Initialize LLM
      this.thinkingTracker.addStep("init_llm", "Initializing Unified Transformer LLM")
      // Use default LLM config
      const llmConfig = {
        modelType: 'decoder-only' as const,
        numLayers: 12,
        numHeads: 12,
        hiddenSize: 768,
        embeddingDim: 768, // Same as hiddenSize
        hiddenDim: 3072, // 4x hiddenSize (FFN hidden dimension)
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
      }
      this.llmInferenceEngine = new LLMInferenceEngine(llmConfig)
      this.availableModels.push("unified-transformer-llm")
      logger.info("LLM initialized", {})

      // Step 2: Load knowledge domains
      this.thinkingTracker.addStep("init_domains", "Loading knowledge domains")
      const allDomains = domainRegistry.getAllDomains()
      this.availableDomains = allDomains.map(d => d.name)
      logger.info(`Loaded ${this.availableDomains.length} knowledge domains`, {
        domains: this.availableDomains,
      })

      // Step 3: Initialize other models (CNN, RNN, etc.) - placeholder for future
      this.thinkingTracker.addStep("init_models", "Initializing specialized AI models")
      // TODO: Initialize CNN, RNN, ViT, GAN, etc. when needed
      
      this.initialized = true
      const initTime = Date.now() - startTime
      
      logger.info("MainOrchestrator initialized successfully", {
        initTime: `${initTime}ms`,
        domains: this.availableDomains.length,
        models: this.availableModels.length,
      })
    } catch (error) {
      logger.info("Failed to initialize MainOrchestrator", { error })
      throw new Error(`MainOrchestrator initialization failed: ${error}`)
    }
  }

  /**
   * Main prompt processing pipeline
   * 
   * @param prompt - Raw user input
   * @param sessionId - Session identifier for context tracking
   * @param context - Additional context (chat history, user preferences, etc.)
   * @returns Complete AI response with metadata
   */
  public async processPrompt(
    prompt: string,
    sessionId: string,
    _context?: Record<string, unknown>
  ): Promise<OrchestratorResponse> {
    if (!this.initialized) {
      await this.initialize()
    }

    const processingStartTime = Date.now()
    this.thinkingTracker.reset()

    logger.info("Processing prompt", { sessionId, promptLength: prompt.length })

    try {
      // ============================================
      // STEP 0: QUICK MATHEMATICAL DETECTION (Early Exit)
      // ============================================
      // Detect simple mathematical expressions and calculate directly
      // without invoking LLM for speed optimization
      const mathPattern = /^[\d\s+\-*/().√πe^]+$/
      if (mathPattern.test(prompt.trim())) {
        this.thinkingTracker.addStep("math_detection", "Detected pure mathematical expression")
        try {
          const result = ScientificCalculator.evaluate(prompt.trim())
          if (!isNaN(result.value)) {
            const processingTime = Date.now() - processingStartTime
            logger.info("Quick mathematical calculation completed", { result: result.value })
            
            return {
              text: `The result is: ${result.value}${result.steps ? '\n\nCalculation steps:\n' + result.steps.join('\n') : ''}`,
              metadata: {
                thinkingSteps: this.thinkingTracker.getSteps(),
                processingTime,
                tokensUsed: 0,
                modelsInvoked: ['scientific-calculator'],
                domainsQueried: ['mathematics'],
              },
              domains: ['mathematics'],
              confidence: 1.0,
              sources: ['Scientific Calculator'],
              contentBlocks: formatResponse(`The result is: ${result.value}${result.steps ? '\n\nCalculation steps:\n' + result.steps.join('\n') : ''}`),
            }
          }
        } catch (error) {
          logger.info("Quick math calculation failed, proceeding with full pipeline", { error })
        }
      }

      // ============================================
      // STEP 1: INPUT PROCESSING
      // ============================================
      this.thinkingTracker.addStep("input_processing", "Processing and cleaning user input")
      
      const cleanedPrompt = this.promptProcessor.process(prompt)
      const subtasks = await this.promptProcessor.decomposeSubtasks(cleanedPrompt)
      
      logger.info("Input processed", {
        subtasks: subtasks.length,
        cleanedLength: cleanedPrompt.length,
      })

      // ============================================
      // STEP 2: KEYWORD EXTRACTION & DOMAIN ROUTING
      // ============================================
      this.thinkingTracker.addStep("domain_routing", "Identifying relevant knowledge domains")
      
      const relevantDomains = this.identifyRelevantDomains(cleanedPrompt, subtasks)
      
      // Apply configuration constraints
      const maxDomains = this.config?.maxDomainsPerQuery || 3
      const limitedDomains = relevantDomains.slice(0, maxDomains)
      
      logger.info("Domains identified", { 
        domains: limitedDomains,
        totalFound: relevantDomains.length,
        maxAllowed: maxDomains,
      })

      // ============================================
      // STEP 3: KNOWLEDGE DOMAIN INFERENCE
      // ============================================
      this.thinkingTracker.addStep("domain_inference", "Querying knowledge domain engines")
      
      // Use parallel inference if enabled in config
      const enableParallel = this.config?.enableParallelInference ?? true
      const domainResults = enableParallel
        ? await this.queryKnowledgeDomainsParallel(limitedDomains, subtasks)
        : await this.queryKnowledgeDomains(limitedDomains, subtasks)
      
      logger.info("Domain queries completed", {
        domainsQueried: domainResults.length,
        parallelMode: enableParallel,
      })

      // ============================================
      // STEP 4: LLM INFERENCE (Primary Generation)
      // ============================================
      this.thinkingTracker.addStep("llm_inference", "Generating response with LLM")
      
      let llmResponse = ""
      if (this.llmInferenceEngine) {
        // Construct enriched prompt with domain knowledge
        const enrichedPrompt = this.buildEnrichedPrompt(cleanedPrompt, domainResults)
        llmResponse = await this.llmInferenceEngine.generate(enrichedPrompt, 100)
      } else {
        llmResponse = "LLM not initialized."
      }
      
      logger.info("LLM inference completed", { responseLength: llmResponse.length })

      // ============================================
      // STEP 5: RESPONSE SYNTHESIS
      // ============================================
      this.thinkingTracker.addStep("synthesis", "Synthesizing multi-source response")
      
      const synthesizedResponse = this.responseSynthesizer.synthesize({
        llmOutput: llmResponse,
        domainOutputs: domainResults,
        originalPrompt: prompt,
      })
      
      // ============================================
      // STEP 6: RESPONSE FORMATTING
      // ============================================
      this.thinkingTracker.addStep("formatting", "Formatting response for display")
      
      const formattedResponse = formatResponse(synthesizedResponse.text)
      
      const processingTime = Date.now() - processingStartTime
      
      logger.info("Prompt processing completed", {
        processingTime: `${processingTime}ms`,
        confidence: synthesizedResponse.confidence,
      })

      // ============================================
      // RETURN COMPLETE RESPONSE
      // ============================================
      return {
        text: synthesizedResponse.text,
        metadata: {
          thinkingSteps: this.thinkingTracker.getSteps(),
          processingTime,
          tokensUsed: 0, // TODO: Implement token counting
          modelsInvoked: this.availableModels,
          domainsQueried: relevantDomains,
        },
        domains: relevantDomains,
        confidence: synthesizedResponse.confidence,
        sources: synthesizedResponse.sources || [],
        contentBlocks: {
          textBlocks: formattedResponse.textBlocks,
          codeBlocks: formattedResponse.codeBlocks,
        },
      }
    } catch (error) {
      logger.info("Error in prompt processing", { error })
      
      // Return error response
      return {
        text: `I encountered an error processing your request: ${error}`,
        metadata: {
          thinkingSteps: this.thinkingTracker.getSteps(),
          processingTime: Date.now() - processingStartTime,
        },
        domains: ["general"],
        confidence: 0.1,
        sources: [],
      }
    }
  }

  /**
   * Identify relevant knowledge domains based on prompt content
   * 
   * Uses keyword matching to route to specialized inference engines
   * (english, mathematics, typescript, react, nextjs, etc.)
   */
  private identifyRelevantDomains(prompt: string, _subtasks: string[]): string[] {
    const lowerPrompt = prompt.toLowerCase()
    const relevantDomains: Set<string> = new Set()

    // Domain keyword mapping
    const domainKeywords: Record<string, string[]> = {
      english: ["grammar", "spelling", "sentence", "word", "language", "text"],
      mathematics: ["math", "calculate", "equation", "number", "solve", "formula"],
      typescript: ["typescript", "ts", "type", "interface", "generic"],
      javascript: ["javascript", "js", "function", "async", "promise"],
      react: ["react", "component", "jsx", "hook", "state", "props"],
      nextjs: ["next.js", "nextjs", "app router", "server component"],
      programming: ["code", "function", "variable", "loop", "algorithm"],
      science: ["science", "physics", "chemistry", "biology", "experiment"],
      testing: ["test", "unit test", "integration", "jest", "vitest"],
      security: ["security", "vulnerability", "auth", "encrypt", "xss"],
      documentation: ["document", "readme", "doc", "guide", "explain"],
      error_detection: ["error", "bug", "debug", "fix", "issue"],
      code_review: ["review", "refactor", "optimize", "improve"],
      algorithms: ["algorithm", "complexity", "big o", "data structure"],
      version_control: ["git", "commit", "branch", "merge", "github"],
    }

    // Check for domain matches
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          relevantDomains.add(domain)
          break
        }
      }
    }

    // Always include general domain as fallback
    if (relevantDomains.size === 0) {
      relevantDomains.add("general")
    }

    return Array.from(relevantDomains)
  }

  /**
   * Query knowledge domains using their specialized inference engines (sequential)
   */
  private async queryKnowledgeDomains(
    domains: string[],
    subtasks: string[]
  ): Promise<Array<{ domain: string; result: string }>> {
    const results: Array<{ domain: string; result: string }> = []
    
    // Combine subtasks into single query
    const query = subtasks.join(' ')

    for (const domainName of domains) {
      try {
        const domain = domainRegistry.getDomain(domainName)
        if (domain && domain.enabled) {
          // Use new domain-specific inference
          const domainResults = await this.domainQueryExecutor.queryDomainsByName([domainName], query)
          
          if (domainResults.length > 0 && domainResults[0].confidence > 0.3) {
            results.push({ 
              domain: domainName, 
              result: domainResults[0].response || 'No result',
            })
          }
        }
      } catch (error) {
        logger.info(`Domain query failed: ${domainName}`, { error })
      }
    }

    return results
  }

  /**
   * Query knowledge domains in parallel (if enabled in config)
   */
  private async queryKnowledgeDomainsParallel(
    domains: string[],
    subtasks: string[]
  ): Promise<Array<{ domain: string; result: string }>> {
    // Combine subtasks into single query
    const query = subtasks.join(' ')
    
    // Query all domains in parallel
    const domainResults = await this.domainQueryExecutor.queryDomainsByName(domains, query)
    
    // Filter and format results
    return domainResults
      .filter(result => result.confidence > 0.3 && !result.error)
      .map(result => ({
        domain: result.domain,
        result: result.response || 'No result',
      }))
  }

  /**
   * Build enriched prompt by combining original prompt with domain knowledge
   */
  private buildEnrichedPrompt(
    originalPrompt: string,
    domainResults: Array<{ domain: string; result: string }>
  ): string {
    if (domainResults.length === 0) {
      return originalPrompt
    }

    let enrichedPrompt = `User Query: ${originalPrompt}\n\n`
    enrichedPrompt += `Relevant Knowledge:\n`
    
    for (const { domain, result } of domainResults) {
      enrichedPrompt += `- ${domain}: ${result}\n`
    }
    
    enrichedPrompt += `\nProvide a comprehensive response based on the above information.`
    
    return enrichedPrompt
  }

  /**
   * Get system status for monitoring
   */
  public getStatus(): {
    initialized: boolean
    domains: number
    models: number
    availableDomains: string[]
    availableModels: string[]
  } {
    return {
      initialized: this.initialized,
      domains: this.availableDomains.length,
      models: this.availableModels.length,
      availableDomains: this.availableDomains,
      availableModels: this.availableModels,
    }
  }

  /**
   * Get list of registered domains
   */
  public getRegisteredDomains(): string[] {
    return [...this.availableDomains]
  }
}

// Export singleton instance
export const mainOrchestrator = MainOrchestrator.getInstance()

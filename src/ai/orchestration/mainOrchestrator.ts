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
import { LLMInferenceEngine } from "../models/unified-transformer-llm/unified-transformer-llm_inference/llm-inferenceEngine"

// Import scientific calculator for quick mathematical inference
import { ScientificCalculator } from "../shared/tools/shared-ScientificCalculator"

// Import settings store for runtime configuration
import { settingsStore } from "../shared/config/settingsStore"
import type { OrchestratorSettings } from "../shared/types/adminSettings"

// Import learning metrics tracker for continuous learning
import { LearningMetricsTracker } from "../monitoring/learningMetricsTracker"
import type { InferenceMetrics } from "../monitoring/learningMetricsTracker"

// Import enhanced metrics collector for system self-awareness
import { enhancedMetricsCollector } from "../monitoring/enhancedMetricsCollector"

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
  private learningMetricsTracker: LearningMetricsTracker
  
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
    this.learningMetricsTracker = new LearningMetricsTracker()
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
      // Use default LLM config with actual vocabulary size from vocabularyManager
      const { vocabularyManager } = await import('../shared/vocabulary/vocabularyManager')
      const actualVocabSize = vocabularyManager.getVocabSize()
      
      const llmConfig = {
        modelType: 'decoder-only' as const,
        numLayers: 6, // Reduced for smaller vocab
        numHeads: 8, // Reduced for efficiency
        hiddenSize: 512, // Aligned with smaller vocab
        embeddingDim: 512, // Same as hiddenSize
        hiddenDim: 2048, // 4x hiddenSize (FFN hidden dimension)
        ffnSize: 2048,
        vocabSize: actualVocabSize, // Use actual vocabulary size (436 tokens)
        maxSequenceLength: 512, // Reduced for efficiency
        batchSize: 16, // Smaller batch for faster inference
        learningRate: 0.0001,
        warmupSteps: 1000,
        maxSteps: 50000,
        dropoutRate: 0.1,
        attentionDropout: 0.1,
        padTokenId: 0,
        bosTokenId: 1,
        eosTokenId: 2,
        unkTokenId: 3,
      }
      
      console.log(`[MainOrchestrator] LLM config created with vocabulary size: ${actualVocabSize}`)
      this.llmInferenceEngine = new LLMInferenceEngine(llmConfig)
      this.availableModels.push("unified-transformer-llm")
      logger.info("LLM initialized", {})

      // Step 2: Load knowledge domains (real-time from unified registry)
      this.thinkingTracker.addStep("init_domains", "Loading knowledge domains")
      // Wait briefly for async domain registrations to complete
      await new Promise(resolve => setTimeout(resolve, 500))
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
      
      let relevantDomains = this.identifyRelevantDomains(cleanedPrompt, subtasks)
      
      // Fallback to general_knowledge domain if no matches (for testing)
      if (relevantDomains.length === 0) {
        relevantDomains = ['general_knowledge']
        logger.info("No domains matched keywords, using general_knowledge domain fallback")
      }
      
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
      let llmSuccess = false
      let llmError: Error | null = null
      
      // Attempt LLM generation with fixed configuration
      try {
        // RE-ENABLED: LLM dimension mismatch fixed - now using actual vocab size
        if (this.llmInferenceEngine) {
          // Construct enriched prompt with domain knowledge
          const enrichedPrompt = this.buildEnrichedPrompt(cleanedPrompt, domainResults)
          console.log("[MainOrchestrator] Attempting LLM generation...")
          llmResponse = await this.llmInferenceEngine.generate(enrichedPrompt, 100)
          
          // Validate response quality
          if (llmResponse && llmResponse.trim().length > 20 && !llmResponse.includes('<UNK>')) {
            llmSuccess = true
            console.log("[MainOrchestrator] LLM generation succeeded:", llmResponse.substring(0, 100))
          } else {
            console.warn("[MainOrchestrator] LLM output quality too low (likely vocabulary not loaded)")
          }
        } else {
          console.log("[MainOrchestrator] LLM inference disabled temporarily (dimension mismatch fix needed)")
        }
      } catch (error) {
        llmError = error as Error
        console.error("[MainOrchestrator] LLM generation failed:", error)
      }
      
      // ============================================
      // INTELLIGENT FALLBACK HIERARCHY
      // ============================================
      // If LLM fails, orchestrator uses domain results and reasoning to construct response
      if (!llmSuccess) {
        console.log("[MainOrchestrator] LLM unavailable, using orchestrator reasoning...")
        this.thinkingTracker.addStep("orchestrator_reasoning", "Orchestrator generating fallback response")
        
        // Check what resources are available
        const hasDomainResults = domainResults && domainResults.length > 0
        const hasValidDomains = limitedDomains && limitedDomains.length > 0
        
        if (hasDomainResults) {
          // FALLBACK LEVEL 1: Use domain results to construct response
          console.log("[MainOrchestrator] Constructing response from domain results...")
          llmResponse = this.constructDomainBasedResponse(cleanedPrompt, limitedDomains, domainResults)
        } else if (hasValidDomains) {
          // FALLBACK LEVEL 2: Explain which domains would handle this, but no results yet
          console.log("[MainOrchestrator] Domains identified but no results, explaining to user...")
          llmResponse = this.explainDomainRouting(cleanedPrompt, limitedDomains, llmError)
        } else {
          // FALLBACK LEVEL 3: Orchestrator reasoning about system state
          console.log("[MainOrchestrator] No domains or results, analyzing system state...")
          llmResponse = this.analyzeSystemState(cleanedPrompt, llmError)
        }
      }
      
      console.log("[MainOrchestrator] Final LLM response length:", llmResponse.length)
      logger.info("LLM inference completed", { responseLength: llmResponse.length })

      // ============================================
      // STEP 5: RESPONSE SYNTHESIS
      // ============================================
      console.log("[MainOrchestrator] Starting step 5: Response Synthesis")
      this.thinkingTracker.addStep("synthesis", "Synthesizing multi-source response")
      
      let synthesizedResponse
      try {
        synthesizedResponse = this.responseSynthesizer.synthesize({
          llmOutput: llmResponse,
          domainOutputs: domainResults,
          originalPrompt: prompt,
        })
        console.log("[MainOrchestrator] Synthesis completed, text length:", synthesizedResponse.text.length)
      } catch (synthError) {
        console.error("[MainOrchestrator] Synthesis error:", synthError)
        synthesizedResponse = {
          text: llmResponse || "Error synthesizing response.",
          confidence: 0.5,
          sources: [],
          metadata: { combinedDomains: [], responseLength: 0 }
        }
      }
      
      // ============================================
      // STEP 6: RESPONSE FORMATTING
      // ============================================
      console.log("[MainOrchestrator] Starting step 6: Response Formatting")
      this.thinkingTracker.addStep("formatting", "Formatting response for display")
      
      let formattedResponse
      try {
        formattedResponse = formatResponse(synthesizedResponse.text)
        console.log("[MainOrchestrator] Formatting completed, blocks:", 
          formattedResponse.textBlocks.length, "text,", 
          formattedResponse.codeBlocks.length, "code")
      } catch (formatError) {
        console.error("[MainOrchestrator] Formatting error:", formatError)
        formattedResponse = {
          textBlocks: [{ id: "text-1", content: synthesizedResponse.text }],
          codeBlocks: []
        }
      }
      
      const processingTime = Date.now() - processingStartTime
      
      logger.info("Prompt processing completed", {
        processingTime: `${processingTime}ms`,
        confidence: synthesizedResponse.confidence,
      })

      // ============================================
      // STEP 7: RECORD METRICS FOR LEARNING
      // ============================================
      const metrics: InferenceMetrics = {
        prompt,
        preprocessedPrompt: cleanedPrompt,
        response: synthesizedResponse.text,
        confidence: synthesizedResponse.confidence,
        domains: relevantDomains,
        modelsUsed: this.availableModels,
        processingTime,
        tokensGenerated: llmResponse.split(' ').length,
        sessionId,
        timestamp: new Date().toISOString(),
      }
      
      // Record asynchronously (don't wait)
      this.learningMetricsTracker.recordInference(metrics).catch(err => {
        logger.info("Failed to record learning metrics", { error: err })
      })

      // Record enhanced metrics for system self-awareness and admin dashboard
      enhancedMetricsCollector.recordInference({
        confidence: synthesizedResponse.confidence,
        latency: processingTime,
        success: true,
        domain: relevantDomains[0], // Primary domain
        model: llmResponse ? 'unified-transformer-llm' : 'domain-inference',
        tokensGenerated: llmResponse?.length || 0,
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
      
      // Record failed inference metrics
      enhancedMetricsCollector.recordInference({
        confidence: 0.1,
        latency: Date.now() - processingStartTime,
        success: false,
        domain: 'general_knowledge',
      })
      
      // Return error response
      return {
        text: `I encountered an error processing your request: ${error}`,
        metadata: {
          thinkingSteps: this.thinkingTracker.getSteps(),
          processingTime: Date.now() - processingStartTime,
        },
        domains: ["general_knowledge"],
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

    // Domain keyword mapping (only include domains that actually exist)
    const domainKeywords: Record<string, string[]> = {
      system: ["time", "date", "today", "now", "timezone", "location", "where", "when", "system", "config", "setup", "environment"],
      english: ["grammar", "spelling", "sentence", "word", "language", "text"],
      mathematics: ["math", "calculate", "equation", "number", "solve", "formula"],
      typescript: ["typescript", "ts", "type", "interface", "generic", "code example", "example"],
      react: ["react", "component", "jsx", "hook", "state", "props", "code example", "example"],
      nextjs: ["next.js", "nextjs", "app router", "server component", "code example", "example"],
      programming: ["code", "javascript", "js", "function", "variable", "loop", "algorithm", "async", "promise", "example", "snippet"],
      science: ["science", "physics", "chemistry", "biology", "experiment"],
      testing: ["test", "unit test", "integration", "jest", "vitest"],
      security: ["security", "vulnerability", "auth", "encrypt", "xss"],
      documentation: ["document", "readme", "doc", "guide", "explain"],
      error_detection: ["error", "bug", "debug", "fix", "issue"],
      code_review: ["review", "refactor", "optimize", "improve"],
      algorithms: ["algorithm", "complexity", "big o", "data structure"],
      version_control: ["git", "commit", "branch", "merge", "github"],
      general_knowledge: ["tell me", "who are you", "what are you", "your name", "about you", "introduce"],
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

    // Always include general_knowledge domain as fallback
    if (relevantDomains.size === 0) {
      relevantDomains.add("general_knowledge")
    }

    return Array.from(relevantDomains)
  }

  /**
   * Query knowledge domains using their specialized inference engines (sequential)
   */
  private async queryKnowledgeDomains(
    domains: string[],
    subtasks: string[]
  ): Promise<Array<{ domain: string; result: string; confidence: number }>> {
    const results: Array<{ domain: string; result: string; confidence: number }> = []
    
    // Combine subtasks into single query
    const query = subtasks.join(' ')

    for (const domainName of domains) {
      try {
        const domain = domainRegistry.getDomain(domainName)
        if (domain && domain.enabled) {
          // Use new domain-specific inference
          const domainResults = await this.domainQueryExecutor.queryDomainsByName([domainName], query)
          
          // Lowered threshold from 0.3 to 0.01 for testing - accept all responses
          if (domainResults.length > 0 && domainResults[0].confidence > 0.01) {
            results.push({ 
              domain: domainName, 
              result: domainResults[0].response || 'No result',
              confidence: domainResults[0].confidence,
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
  ): Promise<Array<{ domain: string; result: string; confidence: number }>> {
    // Combine subtasks into single query
    const query = subtasks.join(' ')
    
    // Query all domains in parallel
    const domainResults = await this.domainQueryExecutor.queryDomainsByName(domains, query)
    
    // Filter and format results (lowered threshold from 0.3 to 0.01 for testing)
    return domainResults
      .filter(result => result.confidence > 0.01 && !result.error)
      .map(result => ({
        domain: result.domain,
        result: result.response || 'No result',
        confidence: result.confidence,
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
  
  /**
   * Get learning statistics
   */
  public async getLearningStatistics() {
    return await this.learningMetricsTracker.getStatistics()
  }
  
  /**
   * Flush learning metrics to disk (call on shutdown)
   */
  public async flushLearningMetrics(): Promise<void> {
    await this.learningMetricsTracker.flushToDisk()
  }
  
  /**
   * INTELLIGENT FALLBACK METHODS
   * These methods allow the orchestrator to reason about failures and construct
   * helpful responses even when LLM or domains are unavailable
   */
  
  /**
   * FALLBACK LEVEL 1: Construct response from domain results
   * Use domain inference results to build a coherent response
   */
  private constructDomainBasedResponse(
    prompt: string,
    domains: string[],
    domainResults: Array<{ domain: string; result: string; confidence: number }>
  ): string {
    console.log("[Orchestrator Reasoning] Building response from domain results...")
    
    // Analyze domain results
    const highConfidenceResults = domainResults.filter(d => d.confidence > 0.7)
    const hasUsefulResults = highConfidenceResults.length > 0
    
    if (hasUsefulResults) {
      // Build response from high-confidence domain outputs
      let response = `Based on analysis from my ${domains.join(', ')} domains:\n\n`
      
      for (const result of highConfidenceResults) {
        response += `**${result.domain}**: ${result.result}\n\n`
      }
      
      response += `\n*Note: My language model is still training, so I'm providing direct domain analysis. Once fully trained, I'll synthesize these insights more naturally.*`
      
      return response
    } else {
      // Low confidence results
      let response = `I've analyzed your question "${prompt}" using my ${domains.join(', ')} domains, but the results have low confidence.\n\n`
      response += `Here's what I found:\n\n`
      
      for (const result of domainResults) {
        response += `- **${result.domain}** (${Math.round(result.confidence * 100)}% confident): ${result.result}\n`
      }
      
      response += `\nCould you rephrase or provide more details to help me give you a better answer?`
      
      return response
    }
  }
  
  /**
   * FALLBACK LEVEL 2: Explain domain routing when domains identified but no results
   */
  private explainDomainRouting(
    prompt: string,
    domains: string[],
    error: Error | null
  ): string {
    console.log("[Orchestrator Reasoning] Explaining domain routing to user...")
    
    let response = `I understand you're asking about: "${prompt}"\n\n`
    response += `I've identified that this relates to my **${domains.join(', ')}** knowledge domains. `
    
    if (error) {
      response += `However, I encountered an issue:\n\n`
      response += `**System Status**: ${error.message}\n\n`
      
      if (error.message.includes('vocabulary') || error.message.includes('tokenizer')) {
        response += `**Issue**: My language model's vocabulary is not yet loaded. I'm in training mode.\n\n`
      } else if (error.message.includes('domain') || error.message.includes('offline')) {
        response += `**Issue**: One or more required knowledge domains may be offline.\n\n`
        response += `**Admin Action**: Please check domain status in Admin → Domains\n\n`
      } else {
        response += `**Issue**: ${error.message}\n\n`
      }
    } else {
      response += `However, I'm currently unable to generate a complete response because my domain inference engines haven't returned results yet.\n\n`
    }
    
    response += `**Available Domains**: I have ${this.availableDomains.length} domains registered\n`
    response += `**Available Models**: ${this.availableModels.join(', ') || 'Training in progress'}\n\n`
    response += `**Suggestion**: Try rephrasing your question or check the system status in the Admin panel.`
    
    return response
  }
  
  /**
   * FALLBACK LEVEL 3: Analyze system state and provide diagnostic information
   * This is the orchestrator's last resort before the hard-coded system fallback
   */
  private analyzeSystemState(prompt: string, error: Error | null): string {
    console.log("[Orchestrator Reasoning] Analyzing system state for diagnostic response...")
    
    let response = `**System Diagnostic**\n\n`
    response += `I received your message: "${prompt}"\n\n`
    
    // Check system components
    const systemChecks = {
      'Orchestrator': true,
      'Domain Registry': this.availableDomains.length > 0,
      'LLM Engine': this.llmInferenceEngine !== null,
      'Models Loaded': this.availableModels.length > 0,
      'Initialization': this.initialized,
    }
    
    response += `**Component Status**:\n`
    for (const [component, status] of Object.entries(systemChecks)) {
      response += `- ${component}: ${status ? '✓ Online' : '✗ Offline'}\n`
    }
    response += `\n`
    
    // Identify the problem
    if (error) {
      response += `**Error Detected**: ${error.message}\n\n`
      
      if (error.message.includes('vocabulary') || error.message.includes('tokenizer')) {
        response += `**Root Cause**: LLM vocabulary not loaded. The language model requires a trained vocabulary file.\n\n`
        response += `**Resolution**: The model is still in training. This is expected during initial system setup.\n\n`
      } else if (error.message.includes('domain')) {
        response += `**Root Cause**: Domain routing or inference failure.\n\n`
        response += `**Resolution**: Check Admin → Domains to verify all domains are properly registered.\n\n`
      } else {
        response += `**Root Cause**: ${error.stack ? error.stack.split('\\n')[0] : 'Unknown error'}\n\n`
      }
    } else {
      response += `**Status**: No specific error, but unable to generate response.\n\n`
      response += `**Possible Causes**:\n`
      response += `- LLM model vocabulary not yet loaded (training in progress)\n`
      response += `- Domain inference engines not returning results\n`
      response += `- Insufficient context or ambiguous query\n\n`
    }
    
    // Provide actionable next steps
    response += `**What You Can Do**:\n`
    response += `1. Check the Admin panel → System Status for component health\n`
    response += `2. Review Admin → Errors for detailed error logs\n`
    response += `3. Verify domains are active in Admin → Domains\n`
    response += `4. Try a simpler query or rephrase your question\n\n`
    
    response += `**System Info**:\n`
    response += `- Registered Domains: ${this.availableDomains.length}\n`
    response += `- Available Models: ${this.availableModels.length}\n`
    response += `- Initialization Status: ${this.initialized ? 'Complete' : 'Incomplete'}\n\n`
    
    response += `*This diagnostic message was generated by the orchestrator's reasoning engine. The system is functioning, but some components need training or configuration.*`
    
    return response
  }
  
  /**
   * Export metrics for training
   */
  public async exportMetricsForTraining(minConfidence: number = 0.7, maxSamples: number = 1000) {
    return await this.learningMetricsTracker.exportForTraining(minConfidence, maxSamples)
  }
}

// Export singleton instance
export const mainOrchestrator = MainOrchestrator.getInstance()

// Flush metrics on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    mainOrchestrator.flushLearningMetrics().catch(console.error)
  })
  
  process.on('SIGINT', () => {
    mainOrchestrator.flushLearningMetrics().then(() => process.exit(0)).catch(console.error)
  })
  
  process.on('SIGTERM', () => {
    mainOrchestrator.flushLearningMetrics().then(() => process.exit(0)).catch(console.error)
  })
}

/**
 * File: src/ai/orchestration/aiOrchestrator.ts
 * Purpose: Central AI orchestrator that coordinates prompt handling, domain selection,
 * inference execution, response generation, and learning across all knowledge domains.
 * This is the "brain" of the hybrid modular AI system.
 *
 * Dependencies:
 * - src/ai/data/registry.ts (domain registry)
 * - src/ai/context_management/sessionManager.ts (session management)
 * - src/ai/context_management/contextWindowManager.ts (context window)
 * - src/ai/context_management/intentClassifier.ts (intent classification)
 * - src/ai/knowledge_retrieval/webSearchAPIConnector.ts (internet search)
 * - src/ai/orchestration/eventBus.ts (event communication)
 * - src/input_processing/textNormalizer.ts (text normalization)
 * - src/input_processing/wordTokenizer.ts (word tokenization)
 * - src/input_processing/sentenceBoundaryDetector.ts (sentence boundary detection)
 * - src/output_generation/responsePostProcessor.ts (response post-processing)
 * - src/ai/inference/inferenceEngine.ts (neural network inference)
 * - src/inference/batchAssembler.ts (batch assembly)
 * - src/inference/latencyOptimizer.ts (latency optimization)
 * - src/inference/sequencePaddingManager.ts (sequence padding)
 * - src/ai/context_management/sentimentEmotionDetector.ts (sentiment detection)
 * - src/ai/context_management/slotFiller.ts (slot extraction)
 * - src/ai/context_management/userProfileHandler.ts (user profile management)
 * - src/ai/context_management/dialogueFlowController.ts (dialogue flow control)
 * - src/ai/monitoring/logger.ts (centralized logging)
 * - src/ai/monitoring/metricsCollector.ts (metrics collection)
 *
 * Depended on by:
 * - src/main.ts (application entry point)
 * - src/ui/pages/index.tsx (chat interface)
 */

import { listDomains, type DomainAPI } from "../data/registry"
import { SessionManager } from "../context_management/sessionManager"
import { ContextWindowManager } from "../context_management/contextWindowManager"
import { classifyIntent } from "../context_management/intentClassifier"
import { searchWeb } from "../knowledge_retrieval/webSearchAPIConnector"
import { publish, subscribe } from "./eventBus"
import dataRegistry from "../data/dataRegistry"
import { textNormalizer } from "../input_processing/textNormalizer"
import { wordTokenizer } from "../input_processing/wordTokenizer"
import { detectSentences } from "../input_processing/sentenceBoundaryDetector"
import { postProcess } from "../output_generation/responsePostProcessor"
import { InferenceEngine, defaultInferenceConfig, type InferenceInput } from "../inference/inferenceEngine"
import { padOrTruncate } from "../inference/sequencePaddingManager"
import { detectSentiment } from "../context_management/sentimentEmotionDetector"
import { extractSlots } from "../context_management/slotFiller"
import { getProfile, setProfile } from "../context_management/userProfileHandler"
import { handleTurn } from "../context_management/dialogueFlowController"
import { logger } from "../monitoring/logger"
import { metricsCollector } from "../monitoring/metricsCollector"
import { ThinkingTracker } from "./thinkingTracker"

/**
 * Represents a user prompt with metadata
 */
export interface Prompt {
  text: string
  sessionId?: string
  timestamp: number
  metadata?: Record<string, unknown>
}

/**
 * Represents an AI response with sources and confidence
 */
export interface Response {
  text: string
  sources: string[]
  confidence: number
  domains: string[]
  timestamp: number
  metadata?: Record<string, unknown>
}

/**
 * Central AI Orchestrator - Singleton pattern
 * Coordinates all AI operations across domains
 */
export class AIOrchestrator {
  private static instance: AIOrchestrator
  private sessionManager: SessionManager
  private contextManagers: Map<string, ContextWindowManager>
  private initialized = false
  private inferenceEngine: InferenceEngine
  private thinkingTracker: ThinkingTracker

  private constructor() {
    this.sessionManager = new SessionManager()
    this.contextManagers = new Map()
    this.inferenceEngine = new InferenceEngine(defaultInferenceConfig)
    this.thinkingTracker = new ThinkingTracker()

    // Subscribe to domain data changes for learning
    subscribe("data:changed", (payload) => this.handleDataChange(payload))
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator()
    }
    return AIOrchestrator.instance
  }

  /**
   * Initialize the orchestrator and all domains
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    logger.info("AIOrchestrator", "Initializing orchestrator...")

    const domains = listDomains()
    logger.info("AIOrchestrator", `Found ${domains.length} registered domains`)

    // Initialize each domain that has an initialize method
    for (const domain of domains) {
      if (domain.initialize) {
        try {
          await domain.initialize()
          logger.info("AIOrchestrator", `Initialized domain: ${domain.name}`)
        } catch (error) {
          logger.error("AIOrchestrator", `Failed to initialize domain ${domain.name}`, error)
        }
      }
    }

    this.initialized = true
    publish("orchestrator:initialized", { domains: domains.map((d) => d.name) })
    logger.info("AIOrchestrator", "Orchestrator initialization complete")
  }

  /**
   * Process a user prompt and generate a response
   * This is the main entry point for AI interactions
   */
  public async processPrompt(prompt: Prompt): Promise<Response> {
    const startTime = Date.now()
    this.thinkingTracker.start()
    this.thinkingTracker.addStep("initialization", "Starting prompt processing")

    metricsCollector.record("request_total", 1)
    logger.info("AIOrchestrator", "Processing prompt", { sessionId: prompt.sessionId })

    try {
      this.thinkingTracker.addStep("normalization", "Normalizing input text")
      const normalizedText = textNormalizer(prompt.text)

      this.thinkingTracker.addStep("tokenization", "Tokenizing input")
      const tokens = wordTokenizer(normalizedText)
      const sentences = detectSentences(normalizedText)
      this.thinkingTracker.addStep(
        "tokenization_complete",
        `Processed ${tokens.length} tokens, ${sentences.length} sentences`,
        {
          tokenCount: tokens.length,
          sentenceCount: sentences.length,
        },
      )

      logger.debug("AIOrchestrator", `Processed input: ${tokens.length} tokens, ${sentences.length} sentences`)

      this.thinkingTracker.addStep("sentiment", "Analyzing sentiment")
      const sentiment = detectSentiment(normalizedText)
      this.thinkingTracker.addStep("sentiment_complete", `Detected ${sentiment.sentiment} sentiment`, {
        sentiment: sentiment.sentiment,
        score: sentiment.score,
      })
      logger.debug("AIOrchestrator", `Sentiment: ${sentiment.sentiment} (score: ${sentiment.score.toFixed(2)})`)

      this.thinkingTracker.addStep("slot_extraction", "Extracting entities and slots")
      const slots = extractSlots(normalizedText, ["name", "email", "date", "location", "task", "priority"])
      const extractedSlots = Object.entries(slots).filter(([_, v]) => v !== null)
      if (extractedSlots.length > 0) {
        this.thinkingTracker.addStep("slots_found", `Found ${extractedSlots.length} entities`, {
          slots: Object.fromEntries(extractedSlots),
        })
        logger.debug("AIOrchestrator", "Extracted slots", Object.fromEntries(extractedSlots))
      }

      const tokenIds = tokens.map((token, idx) => (token.charCodeAt(0) % 1000) + idx)
      const paddedTokens = padOrTruncate(tokenIds, 512, 0)

      let sessionId = prompt.sessionId
      if (!sessionId) {
        sessionId = this.createSession()
      } else {
        const existingSession = this.sessionManager.get(sessionId)
        if (!existingSession) {
          this.sessionManager.create(sessionId)
          logger.debug("AIOrchestrator", `Created new session with provided ID: ${sessionId}`)
        }
      }

      const session = this.sessionManager.get(sessionId)
      if (!session) {
        throw new Error("Failed to create or retrieve session")
      }

      const userProfile = getProfile(sessionId)
      if (extractedSlots.length > 0) {
        setProfile(sessionId, {
          ...userProfile,
          ...Object.fromEntries(extractedSlots),
          lastSentiment: sentiment.sentiment,
        })
        logger.debug("AIOrchestrator", `Updated user profile for session ${sessionId}`)
      }

      let contextWindow = this.contextManagers.get(sessionId)
      if (!contextWindow) {
        contextWindow = new ContextWindowManager(2048)
        this.contextManagers.set(sessionId, contextWindow)
      }

      contextWindow.add(prompt.text)

      this.thinkingTracker.addStep("intent", "Classifying user intent")
      const intent = classifyIntent(normalizedText)
      this.thinkingTracker.addStep("intent_complete", `Classified as ${intent.intent}`, {
        intent: intent.intent,
        confidence: intent.confidence,
      })
      logger.debug("AIOrchestrator", `Intent: ${intent.intent} (confidence: ${intent.confidence})`)

      const dialogueResult = await handleTurn(normalizedText, {
        sessionId,
        userProfile,
        sentiment,
        slots,
        contextWindow: contextWindow.getWindow(),
      })
      logger.debug("AIOrchestrator", `Dialogue flow: ${dialogueResult.status}`)

      this.thinkingTracker.addStep("domain_selection", "Selecting relevant knowledge domains")
      const relevantDomains = this.selectDomains(normalizedText, intent.intent)
      this.thinkingTracker.addStep("domains_selected", `Selected ${relevantDomains.length} domains`, {
        domains: relevantDomains.map((d) => d.name),
      })
      logger.info("AIOrchestrator", `Selected ${relevantDomains.length} domains`, {
        domains: relevantDomains.map((d) => d.name),
      })

      this.thinkingTracker.addStep("inference", "Running neural network inference")
      const inferenceResults: Array<{ domain: string; confidence: number; logits: number[][] }> = []

      for (const domain of relevantDomains) {
        try {
          const inferenceInput: InferenceInput = {
            tokens: paddedTokens,
            domain: domain.name,
            context: contextWindow.getWindow().map((text) => [text.length]),
          }

          const inferenceOutput = await this.inferenceEngine.infer(inferenceInput)
          inferenceResults.push({
            domain: domain.name,
            confidence: inferenceOutput.confidence,
            logits: inferenceOutput.logits,
          })

          this.thinkingTracker.addStep(`inference_${domain.name}`, `Inference for ${domain.name}`, {
            confidence: inferenceOutput.confidence,
          })

          logger.debug(
            "AIOrchestrator",
            `Inference for ${domain.name}: confidence=${inferenceOutput.confidence.toFixed(3)}`,
          )
        } catch (error) {
          logger.error("AIOrchestrator", `Inference failed for ${domain.name}`, error)
        }
      }

      const needsSearch = this.needsInternetSearch(normalizedText)
      let searchResults: string[] = []

      if (needsSearch) {
        this.thinkingTracker.addStep("search", "Performing internet search")
        logger.info("AIOrchestrator", "Performing internet search...")
        try {
          const results = await searchWeb(normalizedText)
          searchResults = results.map((r) => r.snippet || r.title)
          this.thinkingTracker.addStep("search_complete", `Found ${searchResults.length} search results`)
          logger.info("AIOrchestrator", `Found ${searchResults.length} search results`)
        } catch (error) {
          logger.error("AIOrchestrator", "Search failed", error)
        }
      }

      this.thinkingTracker.addStep("domain_queries", "Querying knowledge domains")
      const context = {
        tokens: tokens,
        inferenceResults: inferenceResults,
        sentiment: sentiment,
        slots: slots,
        userProfile: userProfile,
        dialogueState: dialogueResult,
      }
      const domainResponses = await this.queryDomains(
        normalizedText,
        relevantDomains.map((d) => d.name),
        context,
      )

      this.thinkingTracker.addStep("synthesis", "Synthesizing final response")
      const response = this.synthesizeResponse(
        normalizedText,
        Array.from(domainResponses.entries()).map(([domain, result]) => ({ domain, result })),
        searchResults,
        relevantDomains.map((d) => d.name),
        inferenceResults.reduce((sum, r) => sum + r.confidence, 0) / (inferenceResults.length || 1),
      )

      response.text = postProcess(response.text)

      contextWindow.add(response.text)

      response.metadata = {
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        extractedSlots: Object.fromEntries(extractedSlots),
        userProfile: Object.keys(userProfile).length > 0 ? userProfile : undefined,
        dialogueState: dialogueResult.status,
        thinkingSteps: this.thinkingTracker.getSteps(),
      }

      await this.saveInteraction(sessionId, prompt, response)

      const latency = Date.now() - startTime
      this.thinkingTracker.addStep("complete", `Request completed in ${latency}ms`, { latency })

      metricsCollector.record("request_success", 1)
      metricsCollector.record("request_latency", latency)
      logger.info("AIOrchestrator", `Request completed in ${latency}ms`, {
        sessionId,
        domains: response.domains.length,
        confidence: response.confidence.toFixed(3),
      })

      publish("orchestrator:response", {
        sessionId,
        prompt: prompt.text,
        response: response.text,
        domains: response.domains,
        duration: latency,
        inferenceMetrics: {
          avgConfidence: inferenceResults.reduce((sum, r) => sum + r.confidence, 0) / (inferenceResults.length || 1),
          domainsProcessed: inferenceResults.length,
        },
      })

      return response
    } catch (error) {
      const latency = Date.now() - startTime
      metricsCollector.record("request_failure", 1)
      metricsCollector.record("request_latency", latency)
      logger.error("AIOrchestrator", "Request failed", error)
      throw error
    }
  }

  /**
   * Select relevant domains based on prompt content and intent
   */
  private selectDomains(promptText: string, intent: string): DomainAPI[] {
    const allDomains = listDomains()
    const text = promptText.toLowerCase()
    const selected: DomainAPI[] = []

    // Always include general domain
    const generalDomain = allDomains.find((d) => d.name === "general")
    if (generalDomain) selected.push(generalDomain)

    // Domain selection heuristics
    if (text.match(/\b(code|program|function|class|typescript|javascript|python)\b/)) {
      const tsDomain = allDomains.find((d) => d.name === "typescript")
      if (tsDomain) selected.push(tsDomain)
    }

    if (
      text.match(/\b(math|calculate|equation|number|sum|multiply|add|subtract|divide|plus|minus|times|equals)\b/) ||
      text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/) ||
      text.match(/\d+\s*[+\-*/×÷]\s*\d+/) ||
      text.match(/\b(squared|cubed|power|root|percent)\b/)
    ) {
      const mathDomain = allDomains.find((d) => d.name === "mathematics")
      if (mathDomain) selected.push(mathDomain)
    }

    if (text.match(/\b(grammar|spell|sentence|word|language|english)\b/)) {
      const englishDomain = allDomains.find((d) => d.name === "english")
      const grammarDomain = allDomains.find((d) => d.name === "grammar")
      if (englishDomain) selected.push(englishDomain)
      if (grammarDomain) selected.push(grammarDomain)
    }

    if (text.match(/\b(search|find|lookup|internet|web|google)\b/)) {
      const searchDomain = allDomains.find((d) => d.name === "internet_search")
      if (searchDomain) selected.push(searchDomain)
    }

    if (text.match(/\b(science|physics|chemistry|biology)\b/)) {
      const scienceDomain = allDomains.find((d) => d.name === "science")
      if (scienceDomain) selected.push(scienceDomain)
    }

    if (text.match(/\b(review|refactor|optimize|improve)\b/) && text.match(/\bcode\b/)) {
      const reviewDomain = allDomains.find((d) => d.name === "code_review")
      if (reviewDomain) selected.push(reviewDomain)
    }

    if (text.match(/\b(error|bug|exception|fail|crash)\b/)) {
      const errorDomain = allDomains.find((d) => d.name === "error_detection")
      if (errorDomain) selected.push(errorDomain)
    }

    if (text.match(/\b(test|testing|unit test|integration test)\b/)) {
      const testDomain = allDomains.find((d) => d.name === "testing")
      if (testDomain) selected.push(testDomain)
    }

    if (text.match(/\b(document|documentation|docs|readme)\b/)) {
      const docDomain = allDomains.find((d) => d.name === "documentation")
      if (docDomain) selected.push(docDomain)
    }

    if (text.match(/\b(security|vulnerability|exploit|attack|secure)\b/)) {
      const securityDomain = allDomains.find((d) => d.name === "security")
      if (securityDomain) selected.push(securityDomain)
    }

    if (text.match(/\b(algorithm|sort|search|tree|graph|complexity)\b/)) {
      const algoDomain = allDomains.find((d) => d.name === "algorithms")
      if (algoDomain) selected.push(algoDomain)
    }

    if (text.match(/\b(data structure|array|list|stack|queue|hash)\b/)) {
      const dsDomain = allDomains.find((d) => d.name === "data_structures")
      if (dsDomain) selected.push(dsDomain)
    }

    if (text.match(/\b(git|version control|commit|branch|merge)\b/)) {
      const vcDomain = allDomains.find((d) => d.name === "version_control")
      if (vcDomain) selected.push(vcDomain)
    }

    if (text.match(/\b(deploy|docker|kubernetes|ci\/cd|devops)\b/)) {
      const envDomain = allDomains.find((d) => d.name === "environment")
      if (envDomain) selected.push(envDomain)
    }

    // If no specific domains selected, use all available domains
    if (selected.length === 0 || (selected.length === 1 && selected[0].name === "general")) {
      return allDomains.slice(0, 3) // Limit to first 3 domains for performance
    }

    return selected
  }

  /**
   * Determine if internet search is needed
   */
  private needsInternetSearch(promptText: string): boolean {
    const text = promptText.toLowerCase()
    return (
      text.includes("search") ||
      text.includes("find") ||
      text.includes("lookup") ||
      text.includes("latest") ||
      text.includes("current") ||
      text.includes("news") ||
      text.includes("what is") ||
      text.includes("who is") ||
      text.includes("when did")
    )
  }

  /**
   * Synthesize final response from multiple domain outputs
   */
  private synthesizeResponse(
    prompt: string,
    domainResponses: Array<{ domain: string; result: unknown }>,
    searchResults: string[],
    domains: string[],
    inferenceConfidence: number,
  ): Response {
    const responseParts: string[] = []
    const sources: string[] = []

    const successfulResponses = domainResponses.filter(({ result }) => {
      if (!result || typeof result !== "object") return false
      if ("error" in result) return false // Skip error responses
      if ("response" in result && result.response === null) return false // Skip null responses
      return true
    })

    let bestResponse: string | null = null
    let bestDomain: string | null = null

    for (const { domain, result } of successfulResponses) {
      if (domain !== "general" && domain !== "english") {
        if (result && typeof result === "object" && "text" in result) {
          const text = (result as { text: string }).text
          if (!text.includes("I can help with") && !text.includes("Try asking me")) {
            bestResponse = text
            bestDomain = domain
            break
          }
        }
      }
    }

    if (!bestResponse) {
      for (const { domain, result } of successfulResponses) {
        if (domain === "general") {
          if (result && typeof result === "object" && "response" in result) {
            bestResponse = (result as { response: string }).response
            bestDomain = domain
            break
          }
        }
      }
    }

    if (bestResponse) {
      responseParts.push(bestResponse)
      if (bestDomain) {
        sources.push(`Domain: ${bestDomain}`)
      }
    }

    if (responseParts.length === 0) {
      // Collect error information from failed domains
      const failedDomains = domainResponses
        .filter(({ result }) => result && typeof result === "object" && "error" in result)
        .map(({ domain, result }) => ({
          domain,
          error: (result as any).error,
        }))

      if (failedDomains.length > 0) {
        // Production-grade error response with system diagnostics
        const errorDetails = failedDomains
          .map(({ domain, error }) => `- ${domain}: ${error.message || "Unknown error"}`)
          .join("\n")

        responseParts.push(
          `I encountered difficulties processing your request across ${failedDomains.length} knowledge domain(s):\n\n` +
            `${errorDetails}\n\n` +
            `**System Status:**\n` +
            `- Tokens processed: ${inferenceConfidence > 0 ? "Yes" : "No"}\n` +
            `- Neural inference: ${inferenceConfidence > 0 ? `${(inferenceConfidence * 100).toFixed(1)}% confidence` : "Failed"}\n` +
            `- Domains attempted: ${domains.join(", ")}\n\n` +
            `This appears to be a temporary issue with external knowledge sources. ` +
            `The system is functioning normally but couldn't retrieve specific information for your query. ` +
            `Please try rephrasing your question or ask about a different topic.`,
        )
        sources.push("System Diagnostics")
      } else {
        // Generic fallback only as last resort
        responseParts.push(
          `I'm processing your request: "${prompt}"\n\n` +
            `**System Status:**\n` +
            `- Active domains: ${domains.length}\n` +
            `- Neural inference confidence: ${(inferenceConfidence * 100).toFixed(1)}%\n` +
            `- Tokens processed: Yes\n\n` +
            `The system is operational but needs more specific information to provide a detailed answer. ` +
            `Could you please rephrase your question or provide more context?`,
        )
        sources.push("Orchestrator Fallback")
      }
    }

    return {
      text: responseParts.join("\n\n"),
      sources,
      confidence: domainResponses.length > 0 ? (0.8 + inferenceConfidence) / 2 : 0.5,
      domains,
      timestamp: Date.now(),
    }
  }

  /**
   * Save interaction for learning
   */
  private async saveInteraction(sessionId: string, prompt: Prompt, response: Response): Promise<void> {
    try {
      // Save to each domain's learned data
      for (const domainName of response.domains) {
        const learnedDataPath = `src/ai/data/${domainName}/${domainName}_learnedData.json`

        try {
          const existingData = dataRegistry.readFile(learnedDataPath, domainName)
          const learned = existingData ? JSON.parse(existingData) : { interactions: [] }

          learned.interactions = learned.interactions || []
          learned.interactions.push({
            prompt: prompt.text,
            response: response.text,
            timestamp: Date.now(),
            sessionId,
            confidence: response.confidence,
          })

          // Keep only last 100 interactions per domain
          if (learned.interactions.length > 100) {
            learned.interactions = learned.interactions.slice(-100)
          }

          dataRegistry.updateFile(domainName, learnedDataPath, JSON.stringify(learned, null, 2))
          logger.debug("AIOrchestrator", `Saved interaction to ${domainName}`)
        } catch (error) {
          logger.error("AIOrchestrator", `Failed to save to ${domainName}`, error)
        }
      }

      publish("orchestrator:learned", {
        sessionId,
        domains: response.domains,
        timestamp: Date.now(),
      })
    } catch (error) {
      logger.error("AIOrchestrator", "Failed to save interaction", error)
    }
  }

  /**
   * Handle domain data changes
   */
  private handleDataChange(payload: unknown): void {
    logger.debug("AIOrchestrator", "Domain data changed", payload)
    // Future: trigger retraining or cache invalidation
  }

  /**
   * Create a new session
   */
  public createSession(): string {
    const session = this.sessionManager.create()
    return session.id
  }

  /**
   * Get registered domains
   */
  public getRegisteredDomains(): DomainAPI[] {
    return listDomains()
  }

  /**
   * Trigger training for a specific domain
   */
  public async trainDomain(domainName: string, options?: Record<string, unknown>): Promise<void> {
    const domain = listDomains().find((d) => d.name === domainName)

    if (!domain) {
      throw new Error(`Domain ${domainName} not found`)
    }

    if (!domain.train) {
      throw new Error(`Domain ${domainName} does not support training`)
    }

    logger.info("AIOrchestrator", `Starting training for domain: ${domainName}`)
    const startTime = Date.now()

    try {
      await domain.train(options)
      const duration = Date.now() - startTime

      metricsCollector.record("training_success", 1, { domain: domainName })
      metricsCollector.record("training_duration", duration, { domain: domainName })
      logger.info("AIOrchestrator", `Training completed for ${domainName} in ${duration}ms`)

      publish("orchestrator:trained", { domain: domainName, timestamp: Date.now(), duration })
    } catch (error) {
      metricsCollector.record("training_failure", 1, { domain: domainName })
      logger.error("AIOrchestrator", `Training failed for ${domainName}`, error)
      throw error
    }
  }

  private async queryDomains(
    input: string,
    selectedDomains: string[],
    context: {
      tokens: string[]
      inferenceResults: any
      sentiment: any
      slots: any
      userProfile: any
      dialogueState: any
    },
  ): Promise<Map<string, any>> {
    const domainResponses = new Map<string, any>()
    const domainApis = listDomains()

    for (const domainName of selectedDomains) {
      try {
        this.thinkingTracker.addStep(`query_${domainName}`, `Querying ${domainName} domain`)
        const startTime = Date.now()

        const domainApi = domainApis.find((d) => d.name === domainName)
        if (!domainApi) {
          logger.warn(`Domain ${domainName} not found in registry`)
          continue
        }

        const result = await domainApi.query(input, context)

        const endTime = Date.now()
        this.thinkingTracker.addStep(`query_${domainName}_complete`, `${domainName} query complete`, {
          confidence: result?.confidence || null,
          duration: endTime - startTime,
        })

        if (result && result.response) {
          domainResponses.set(domainName, result)
          logger.info(`Domain ${domainName} query succeeded`, {
            confidence: result.confidence,
            responseLength: result.response?.length || 0,
            duration: endTime - startTime,
          })
        } else {
          logger.info(`Domain ${domainName} returned null (not applicable for this query)`)
        }
      } catch (error) {
        logger.error(`Domain ${domainName} query failed`, error)
        this.thinkingTracker.addStep(`query_${domainName}_error`, `${domainName} query failed`, {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return domainResponses
  }
}

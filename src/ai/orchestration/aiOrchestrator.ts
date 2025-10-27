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

  private constructor() {
    this.sessionManager = new SessionManager()
    this.contextManagers = new Map()

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

    console.log("[AIOrchestrator] Initializing...")

    const domains = listDomains()
    console.log(`[AIOrchestrator] Found ${domains.length} registered domains`)

    // Initialize each domain that has an initialize method
    for (const domain of domains) {
      if (domain.initialize) {
        try {
          await domain.initialize()
          console.log(`[AIOrchestrator] Initialized domain: ${domain.name}`)
        } catch (error) {
          console.error(`[AIOrchestrator] Failed to initialize domain ${domain.name}:`, error)
        }
      }
    }

    this.initialized = true
    publish("orchestrator:initialized", { domains: domains.map((d) => d.name) })
  }

  /**
   * Process a user prompt and generate a response
   * This is the main entry point for AI interactions
   */
  public async processPrompt(prompt: Prompt): Promise<Response> {
    const startTime = Date.now()

    // Get or create session
    const sessionId = prompt.sessionId || this.createSession()
    const session = this.sessionManager.get(sessionId)

    if (!session) {
      throw new Error("Failed to create or retrieve session")
    }

    // Get or create context window for this session
    let contextWindow = this.contextManagers.get(sessionId)
    if (!contextWindow) {
      contextWindow = new ContextWindowManager(2048)
      this.contextManagers.set(sessionId, contextWindow)
    }

    // Add prompt to context
    contextWindow.add(prompt.text)

    // Classify intent
    const intent = classifyIntent(prompt.text)
    console.log(`[AIOrchestrator] Intent: ${intent.intent} (confidence: ${intent.confidence})`)

    // Select relevant domains based on intent and prompt content
    const relevantDomains = this.selectDomains(prompt.text, intent.intent)
    console.log(
      `[AIOrchestrator] Selected domains:`,
      relevantDomains.map((d) => d.name),
    )

    // Check if internet search is needed
    const needsSearch = this.needsInternetSearch(prompt.text)
    let searchResults: string[] = []

    if (needsSearch) {
      console.log("[AIOrchestrator] Performing internet search...")
      try {
        const results = await searchWeb(prompt.text)
        searchResults = results.map((r) => r.snippet || r.title)
        console.log(`[AIOrchestrator] Found ${searchResults.length} search results`)
      } catch (error) {
        console.error("[AIOrchestrator] Search failed:", error)
      }
    }

    // Query each relevant domain
    const domainResponses: Array<{ domain: string; result: unknown }> = []

    for (const domain of relevantDomains) {
      if (domain.query) {
        try {
          const result = await domain.query(prompt.text, {
            context: contextWindow.getWindow(),
            searchResults,
            intent: intent.intent,
          })
          domainResponses.push({ domain: domain.name, result })
        } catch (error) {
          console.error(`[AIOrchestrator] Domain ${domain.name} query failed:`, error)
        }
      }
    }

    // Synthesize response from domain outputs
    const response = this.synthesizeResponse(
      prompt.text,
      domainResponses,
      searchResults,
      relevantDomains.map((d) => d.name),
    )

    // Add response to context
    contextWindow.add(response.text)

    // Save interaction for learning
    await this.saveInteraction(sessionId, prompt, response)

    // Publish event for monitoring
    publish("orchestrator:response", {
      sessionId,
      prompt: prompt.text,
      response: response.text,
      domains: response.domains,
      duration: Date.now() - startTime,
    })

    return response
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

    if (text.match(/\b(math|calculate|equation|number|sum|multiply)\b/)) {
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
  ): Response {
    const responseParts: string[] = []
    const sources: string[] = []

    // Add domain responses
    for (const { domain, result } of domainResponses) {
      if (result && typeof result === "object" && "text" in result) {
        responseParts.push((result as { text: string }).text)
        sources.push(`Domain: ${domain}`)
      } else if (typeof result === "string") {
        responseParts.push(result)
        sources.push(`Domain: ${domain}`)
      }
    }

    // Add search results if available
    if (searchResults.length > 0) {
      responseParts.push(`\n\nSearch results:\n${searchResults.slice(0, 3).join("\n")}`)
      sources.push("Internet Search")
    }

    // Fallback response if no domain responses
    if (responseParts.length === 0) {
      responseParts.push(
        `I understand you're asking about: "${prompt}". I'm processing this across multiple knowledge domains. ` +
          `This is a hybrid modular AI system with ${domains.length} active domains.`,
      )
    }

    return {
      text: responseParts.join("\n\n"),
      sources,
      confidence: domainResponses.length > 0 ? 0.8 : 0.5,
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
        } catch (error) {
          console.error(`[AIOrchestrator] Failed to save to ${domainName}:`, error)
        }
      }

      publish("orchestrator:learned", {
        sessionId,
        domains: response.domains,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("[AIOrchestrator] Failed to save interaction:", error)
    }
  }

  /**
   * Handle domain data changes
   */
  private handleDataChange(payload: unknown): void {
    console.log("[AIOrchestrator] Domain data changed:", payload)
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

    console.log(`[AIOrchestrator] Training domain: ${domainName}`)
    await domain.train(options)

    publish("orchestrator:trained", { domain: domainName, timestamp: Date.now() })
  }
}

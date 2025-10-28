/**
 * File: src/ai/orchestrator/orchestrator.ts
 * Purpose: Main orchestrator coordinating all AI modules and domain tools
 * Depends on: src/ai/core/sessionManager.ts, src/ai/core/contextManager.ts, src/ai/core/types/aiTypes.ts
 * Depended on by: app/api/chat/route.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { SessionManager } from "../core/sessionManager"
import { ContextManager } from "../core/contextManager"
import type { AIResponse, Message, ThinkingStep, DomainTool, OrchestratorConfig } from "../core/types/aiTypes"

/**
 * AIOrchestrator is the central coordinator for the hybrid AI system.
 * It manages sessions, context, domain tools, and generates responses.
 *
 * Architecture:
 * - Modular design with pluggable domain tools
 * - Session-based conversation management
 * - Intelligent context handling
 * - Thinking process tracking for transparency
 *
 * Usage:
 * const orchestrator = new AIOrchestrator();
 * await orchestrator.initialize();
 * const response = await orchestrator.processMessage(sessionId, userMessage);
 */
export class AIOrchestrator {
  private sessionManager: SessionManager
  private contextManager: ContextManager
  private domainTools: Map<string, DomainTool>
  private config: OrchestratorConfig
  private initialized: boolean

  /**
   * Creates a new AIOrchestrator instance
   * @param config - Optional configuration overrides
   */
  constructor(config?: Partial<OrchestratorConfig>) {
    this.sessionManager = new SessionManager()
    this.contextManager = new ContextManager()
    this.domainTools = new Map()
    this.initialized = false

    // Default configuration
    this.config = {
      maxContextLength: 4000,
      enableThinking: true,
      enableDomainTools: true,
      defaultDomains: ["general", "mathematics", "typescript"],
      ...config,
    }
  }

  /**
   * Initializes the orchestrator and loads domain tools
   * Must be called before processing messages
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("[AIOrchestrator] Already initialized")
      return
    }

    console.log("[AIOrchestrator] Initializing...")

    // Load domain tools (will be implemented in later tasks)
    await this.loadDomainTools()

    this.initialized = true
    console.log("[AIOrchestrator] Initialization complete")
  }

  /**
   * Creates a new conversation session
   * @returns Session ID for the new session
   */
  public createSession(): string {
    const session = this.sessionManager.createSession()
    console.log(`[AIOrchestrator] Created new session: ${session.sessionId}`)
    return session.sessionId
  }

  /**
   * Processes a user message and generates an AI response
   * @param sessionId - The session identifier
   * @param userMessage - The user's input message
   * @returns AI-generated response with thinking steps
   */
  public async processMessage(sessionId: string, userMessage: string): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error("AIOrchestrator not initialized. Call initialize() first.")
    }

    const thinkingSteps: ThinkingStep[] = []
    const startTime = Date.now()

    // Step 1: Retrieve session
    this.addThinkingStep(thinkingSteps, "retrieve_session", "Retrieving conversation session", startTime)
    const session = this.sessionManager.getSession(sessionId)

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    // Step 2: Add user message to history
    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    }
    this.sessionManager.addMessage(sessionId, userMsg)

    // Step 3: Build context
    this.addThinkingStep(thinkingSteps, "build_context", "Building conversation context", startTime)
    const context = this.contextManager.buildContext(session)

    // Step 4: Analyze intent and select tools
    this.addThinkingStep(thinkingSteps, "analyze_intent", "Analyzing user intent", startTime)
    const intent = await this.analyzeIntent(userMessage)

    // Step 5: Execute domain tools if needed
    let toolResults: Record<string, unknown> = {}
    if (this.config.enableDomainTools && intent.requiresTools) {
      this.addThinkingStep(thinkingSteps, "execute_tools", "Executing domain tools", startTime, {
        tools: intent.suggestedTools,
      })
      toolResults = await this.executeDomainTools(intent.suggestedTools, userMessage)
    }

    // Step 6: Generate response
    this.addThinkingStep(thinkingSteps, "generate_response", "Generating AI response", startTime)
    const responseText = await this.generateResponse(context, userMessage, toolResults)

    // Step 7: Add assistant message to history
    const assistantMsg: Message = {
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
      metadata: { thinkingSteps },
    }
    this.sessionManager.addMessage(sessionId, assistantMsg)

    // Return complete response
    return {
      text: responseText,
      thinkingSteps: this.config.enableThinking ? thinkingSteps : undefined,
      metadata: {
        sessionId,
        processingTime: Date.now() - startTime,
        toolsUsed: Object.keys(toolResults),
      },
    }
  }

  /**
   * Registers a domain tool for use by the orchestrator
   * @param tool - The domain tool to register
   */
  public registerDomainTool(tool: DomainTool): void {
    this.domainTools.set(tool.name, tool)
    console.log(`[AIOrchestrator] Registered domain tool: ${tool.name} (${tool.domain})`)
  }

  /**
   * Gets information about all registered domain tools
   * @returns Array of tool descriptions
   */
  public getAvailableTools(): Array<{ name: string; domain: string; description: string }> {
    return Array.from(this.domainTools.values()).map((tool) => ({
      name: tool.name,
      domain: tool.domain,
      description: tool.description,
    }))
  }

  /**
   * Loads domain tools from various modules
   * This will be expanded as domain tools are implemented
   */
  private async loadDomainTools(): Promise<void> {
    console.log("[AIOrchestrator] Loading domain tools...")

    // Domain tools will be dynamically loaded here
    // For now, we'll set up the infrastructure

    console.log("[AIOrchestrator] Domain tools loaded")
  }

  /**
   * Analyzes user intent to determine required tools and processing
   * @param message - User message to analyze
   * @returns Intent analysis result
   */
  private async analyzeIntent(message: string): Promise<{
    requiresTools: boolean
    suggestedTools: string[]
    confidence: number
  }> {
    // Simple keyword-based intent analysis
    // This will be enhanced with more sophisticated NLP in later tasks

    const lowerMessage = message.toLowerCase()
    const suggestedTools: string[] = []

    // Check for mathematical operations
    if (/\d+\s*[+\-*/]\s*\d+|calculate|compute|math/.test(lowerMessage)) {
      suggestedTools.push("mathematics-calculator")
    }

    // Check for code-related queries
    if (/typescript|javascript|code|function|class|interface/.test(lowerMessage)) {
      suggestedTools.push("typescript-analyzer")
    }

    // Check for grammar/writing queries
    if (/grammar|spell|write|correct|punctuation/.test(lowerMessage)) {
      suggestedTools.push("english-grammar-checker")
    }

    return {
      requiresTools: suggestedTools.length > 0,
      suggestedTools,
      confidence: suggestedTools.length > 0 ? 0.8 : 0.5,
    }
  }

  /**
   * Executes specified domain tools with the given input
   * @param toolNames - Names of tools to execute
   * @param input - Input data for the tools
   * @returns Results from tool execution
   */
  private async executeDomainTools(toolNames: string[], input: unknown): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {}

    for (const toolName of toolNames) {
      const tool = this.domainTools.get(toolName)

      if (!tool) {
        console.warn(`[AIOrchestrator] Tool not found: ${toolName}`)
        continue
      }

      try {
        // Validate input if validator exists
        if (tool.validate && !tool.validate(input)) {
          console.warn(`[AIOrchestrator] Invalid input for tool: ${toolName}`)
          continue
        }

        // Execute tool
        const result = await tool.execute(input)
        results[toolName] = result
      } catch (error) {
        console.error(`[AIOrchestrator] Error executing tool ${toolName}:`, error)
        results[toolName] = { error: "Tool execution failed" }
      }
    }

    return results
  }

  /**
   * Generates an AI response based on context, message, and tool results
   * @param context - Conversation context
   * @param message - User message
   * @param toolResults - Results from domain tools
   * @returns Generated response text
   */
  private async generateResponse(
    context: string,
    message: string,
    toolResults: Record<string, unknown>,
  ): Promise<string> {
    // This is a placeholder for the actual AI generation logic
    // In a production system, this would call an LLM API or local model

    let response = `I understand you said: "${message}"\n\n`

    // Include tool results if available
    if (Object.keys(toolResults).length > 0) {
      response += "Based on my analysis:\n"
      for (const [toolName, result] of Object.entries(toolResults)) {
        response += `- ${toolName}: ${JSON.stringify(result)}\n`
      }
      response += "\n"
    }

    // Add contextual response
    response += "I am ZacAi Atomic, a hybrid multi-domain modular AI assistant. "
    response += "I can help you with mathematics, TypeScript programming, grammar checking, and more. "
    response += "My modular architecture allows me to use specialized tools for different domains."

    return response
  }

  /**
   * Adds a thinking step to the tracking array
   * @param steps - Array to add step to
   * @param step - Step identifier
   * @param description - Human-readable description
   * @param startTime - Process start time
   * @param data - Optional additional data
   */
  private addThinkingStep(
    steps: ThinkingStep[],
    step: string,
    description: string,
    startTime: number,
    data?: Record<string, unknown>,
  ): void {
    steps.push({
      step,
      description,
      timestamp: Date.now() - startTime,
      data,
    })
  }

  /**
   * Gets the current session count
   * @returns Number of active sessions
   */
  public getSessionCount(): number {
    return this.sessionManager.getSessionCount()
  }

  /**
   * Checks if the orchestrator is initialized
   * @returns True if initialized
   */
  public isInitialized(): boolean {
    return this.initialized
  }
}

/**
 * File: src/ai/core/types/aiTypes.ts
 * Purpose: Core type definitions for the AI system
 * Depends on: None (base types)
 * Depended on by: All AI modules
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Represents a single message in a conversation
 */
export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  metadata?: Record<string, unknown>
}

/**
 * Represents a thinking step in the AI's reasoning process
 */
export interface ThinkingStep {
  step: string
  description: string
  timestamp: number
  data?: Record<string, unknown>
}

/**
 * Session context containing conversation history and state
 */
export interface SessionContext {
  sessionId: string
  messages: Message[]
  createdAt: number
  lastAccessedAt: number
  metadata: Record<string, unknown>
}

/**
 * Domain-specific tool interface
 */
export interface DomainTool {
  name: string
  domain: string
  description: string
  execute: (input: unknown) => Promise<unknown>
  validate?: (input: unknown) => boolean
}

/**
 * AI response structure
 */
export interface AIResponse {
  text: string
  thinkingSteps?: ThinkingStep[]
  metadata?: Record<string, unknown>
  confidence?: number
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  maxContextLength: number
  enableThinking: boolean
  enableDomainTools: boolean
  defaultDomains: string[]
}

/**
 * Token information for input processing
 */
export interface TokenInfo {
  token: string
  position: number
  type: "word" | "punctuation" | "whitespace" | "special"
}

/**
 * Embedding vector representation
 */
export interface EmbeddingVector {
  vector: number[]
  dimension: number
  normalized: boolean
}

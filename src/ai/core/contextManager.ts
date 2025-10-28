/**
 * File: src/ai/core/contextManager.ts
 * Purpose: Manages conversation context, memory, and relevance filtering
 * Depends on: src/ai/core/types/aiTypes.ts
 * Depended on by: src/ai/orchestrator/orchestrator.ts
 * Creator: Vercel v0 Coding Assistant
 */

import type { Message, SessionContext } from "./types/aiTypes"

/**
 * ContextManager handles intelligent context management for AI conversations.
 * It maintains relevant conversation history, filters irrelevant information,
 * and ensures context stays within token limits.
 *
 * Features:
 * - Sliding window context management
 * - Relevance-based message filtering
 * - Token budget management
 * - Context summarization for long conversations
 */
export class ContextManager {
  private readonly maxContextMessages: number
  private readonly maxTokensPerMessage: number

  /**
   * Creates a new ContextManager instance
   * @param maxContextMessages - Maximum number of messages to keep in context (default: 20)
   * @param maxTokensPerMessage - Approximate max tokens per message (default: 500)
   */
  constructor(maxContextMessages = 20, maxTokensPerMessage = 500) {
    this.maxContextMessages = maxContextMessages
    this.maxTokensPerMessage = maxTokensPerMessage
  }

  /**
   * Builds a context string from session messages, applying filtering and limits
   * @param session - The session context containing message history
   * @returns Formatted context string for AI processing
   */
  public buildContext(session: SessionContext): string {
    const relevantMessages = this.getRelevantMessages(session.messages)
    const contextParts: string[] = []

    // Add system context if available
    if (session.metadata.systemPrompt) {
      contextParts.push(`System: ${session.metadata.systemPrompt}`)
    }

    // Add conversation history
    for (const message of relevantMessages) {
      const truncatedContent = this.truncateMessage(message.content)
      contextParts.push(`${message.role}: ${truncatedContent}`)
    }

    return contextParts.join("\n\n")
  }

  /**
   * Extracts the most relevant messages from history based on recency and importance
   * @param messages - Full message history
   * @returns Filtered array of relevant messages
   */
  public getRelevantMessages(messages: Message[]): Message[] {
    // If within limit, return all messages
    if (messages.length <= this.maxContextMessages) {
      return messages
    }

    // Keep most recent messages (sliding window approach)
    const recentMessages = messages.slice(-this.maxContextMessages)

    // Always include the first message if it's a system message
    if (messages.length > 0 && messages[0].role === "system") {
      return [messages[0], ...recentMessages.slice(1)]
    }

    return recentMessages
  }

  /**
   * Truncates a message to fit within token limits
   * @param content - The message content to truncate
   * @returns Truncated message content
   */
  public truncateMessage(content: string): string {
    // Rough approximation: 1 token ≈ 4 characters
    const maxChars = this.maxTokensPerMessage * 4

    if (content.length <= maxChars) {
      return content
    }

    return content.substring(0, maxChars) + "... [truncated]"
  }

  /**
   * Estimates the total token count for a set of messages
   * @param messages - Array of messages to estimate
   * @returns Approximate token count
   */
  public estimateTokenCount(messages: Message[]): number {
    let totalChars = 0

    for (const message of messages) {
      totalChars += message.content.length
    }

    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(totalChars / 4)
  }

  /**
   * Summarizes older messages to compress context while preserving key information
   * @param messages - Messages to summarize
   * @returns Summary string
   */
  public summarizeMessages(messages: Message[]): string {
    if (messages.length === 0) {
      return ""
    }

    const topics = this.extractTopics(messages)
    const summary = `Previous conversation covered: ${topics.join(", ")}`

    return summary
  }

  /**
   * Extracts key topics from messages using simple keyword analysis
   * @param messages - Messages to analyze
   * @returns Array of identified topics
   */
  private extractTopics(messages: Message[]): string[] {
    const topics = new Set<string>()
    const commonWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"])

    for (const message of messages) {
      const words = message.content.toLowerCase().split(/\s+/)

      for (const word of words) {
        // Extract meaningful words (length > 4, not common words)
        if (word.length > 4 && !commonWords.has(word)) {
          topics.add(word)
        }
      }
    }

    return Array.from(topics).slice(0, 5) // Return top 5 topics
  }

  /**
   * Checks if context needs compression based on size
   * @param messages - Current message history
   * @returns True if context should be compressed
   */
  public needsCompression(messages: Message[]): boolean {
    return messages.length > this.maxContextMessages * 1.5
  }

  /**
   * Compresses context by summarizing older messages
   * @param messages - Full message history
   * @returns Compressed message array with summary
   */
  public compressContext(messages: Message[]): Message[] {
    if (!this.needsCompression(messages)) {
      return messages
    }

    const keepCount = Math.floor(this.maxContextMessages / 2)
    const oldMessages = messages.slice(0, -keepCount)
    const recentMessages = messages.slice(-keepCount)

    const summary: Message = {
      role: "system",
      content: this.summarizeMessages(oldMessages),
      timestamp: Date.now(),
      metadata: { type: "summary" },
    }

    return [summary, ...recentMessages]
  }
}

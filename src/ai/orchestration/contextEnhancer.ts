/**
 * File: src/ai/orchestration/contextEnhancer.ts
 * Purpose: Enhances prompts with dialogue flow, sentiment analysis, slot filling,
 * and user profile information for more contextually aware responses.
 *
 * Dependencies:
 * - src/ai/context_management/dialogueFlowController.ts
 * - src/ai/context_management/sentimentEmotionDetector.ts
 * - src/ai/context_management/slotFiller.ts
 * - src/ai/context_management/userProfileHandler.ts
 *
 * Depended on by:
 * - src/ai/orchestration/aiOrchestrator.ts
 * - src/ai/orchestration/promptHandler.ts
 */

import { DialogueFlowController } from "../context_management/dialogueFlowController"
import { detectSentiment } from "../context_management/sentimentEmotionDetector"
import { SlotFiller } from "../context_management/slotFiller"
import { UserProfileHandler, type UserProfile } from "../context_management/userProfileHandler"

/**
 * Enhanced context with all metadata
 */
export interface EnhancedContext {
  originalText: string
  dialogueState: string
  sentiment: {
    polarity: "positive" | "negative" | "neutral"
    emotion: string
    confidence: number
  }
  slots: Record<string, string | null>
  userProfile: UserProfile
  conversationTurn: number
}

/**
 * Context Enhancer - Adds rich contextual information to prompts
 */
export class ContextEnhancer {
  private dialogueController: DialogueFlowController
  private slotFiller: SlotFiller
  private profileHandler: UserProfileHandler

  constructor() {
    this.dialogueController = new DialogueFlowController()
    this.slotFiller = new SlotFiller()
    this.profileHandler = new UserProfileHandler()
  }

  /**
   * Enhance a prompt with full contextual information
   */
  public async enhance(text: string, sessionId: string, history: string[] = []): Promise<EnhancedContext> {
    // Get dialogue state
    const dialogueState = this.dialogueController.getState(sessionId)

    // Detect sentiment and emotion
    const sentiment = this.enrichSentiment(detectSentiment(text))

    // Extract slots (entities like names, dates, locations)
    const slots = this.slotFiller.fill(text)

    // Get user profile
    const userProfile = this.profileHandler.getProfile(sessionId)

    // Update dialogue flow
    this.dialogueController.updateFlow(sessionId, text, sentiment.emotion)

    // Update user profile with new information
    if (slots.name) {
      this.profileHandler.updateProfile(sessionId, { name: slots.name })
    }

    return {
      originalText: text,
      dialogueState,
      sentiment,
      slots,
      userProfile,
      conversationTurn: history.length + 1,
    }
  }

  /**
   * Get conversation summary for a session
   */
  public getConversationSummary(sessionId: string): string {
    const profile = this.profileHandler.getProfile(sessionId)
    const state = this.dialogueController.getState(sessionId)

    const historyCount = Array.isArray(profile.history) ? profile.history.length : 0
    return `User: ${profile.name || "Unknown"}, State: ${state}, History: ${historyCount} turns`
  }

  private enrichSentiment(raw: ReturnType<typeof detectSentiment>): {
    polarity: "positive" | "negative" | "neutral"
    emotion: string
    confidence: number
  } {
    return {
      polarity: raw.sentiment,
      emotion: this.deriveEmotion(raw.sentiment),
      confidence: raw.score,
    }
  }

  private deriveEmotion(polarity: "positive" | "negative" | "neutral"): string {
    switch (polarity) {
      case "positive":
        return "optimistic"
      case "negative":
        return "concerned"
      default:
        return "neutral"
    }
  }
}

// Export singleton
export const contextEnhancer = new ContextEnhancer()

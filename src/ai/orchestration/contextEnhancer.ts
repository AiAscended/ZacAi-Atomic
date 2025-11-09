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
import { UserProfileHandler } from "../context_management/userProfileHandler"

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
  slots: Record<string, string>
  userProfile: {
    name?: string
    preferences?: Record<string, unknown>
    history?: string[]
  }
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
  public async enhance(text: string, sessionId: string, history: string[]): Promise<EnhancedContext> {
    // Get dialogue state - use a simple state string since getState doesn't exist
    const dialogueState = `turn-${history.length + 1}`

    // Detect sentiment and emotion
    const sentimentResult = detectSentiment(text)
    const sentiment = {
      polarity: sentimentResult.sentiment,
      emotion: sentimentResult.sentiment, // Use sentiment as emotion fallback
      confidence: sentimentResult.score
    }

    // Extract slots (entities like names, dates, locations)
    const slots = this.slotFiller.extractSlots(text)

    // Get user profile
    const userProfile = this.profileHandler.getProfile(sessionId)

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
    const state = `session-${sessionId}`

    return `User: ${profile.name || "Unknown"}, State: ${state}, History: ${(profile.history ?? []).length || 0} turns`
  }
}

// Export singleton
export const contextEnhancer = new ContextEnhancer()

/**
 * File: src/ai/context_management/dialogueFlowController.ts
 * Purpose: Minimal dialogue flow controller that sequences intents to handlers.
 */

import { classifyIntent } from "./intentClassifier"

type Handler = (text: string, context?: Record<string, unknown>) => Promise<unknown>

const handlers = new Map<string, Handler>()

export const registerHandler = (intent: string, h: Handler) => handlers.set(intent, h)

export const handleTurn = async (text: string, context: Record<string, unknown> = {}) => {
  const { intent } = classifyIntent(text)
  const h = handlers.get(intent) ?? handlers.get("general_chat")
  if (!h) return { status: "no_handler", intent }
  const result = await h(text, context)
  return { status: "handled", intent, result }
}

export class DialogueFlowController {
  private handlers: Map<string, Handler> = new Map()
  private sessionStates: Map<string, string> = new Map()

  registerHandler(intent: string, handler: Handler): void {
    this.handlers.set(intent, handler)
  }

  async handleTurn(
    text: string,
    context: Record<string, unknown> = {},
  ): Promise<{
    status: string
    intent: string
    result?: unknown
  }> {
    const { intent } = classifyIntent(text)
    const handler = this.handlers.get(intent) ?? this.handlers.get("general_chat")

    if (!handler) {
      return { status: "no_handler", intent }
    }

    const result = await handler(text, context)
    return { status: "handled", intent, result }
  }

  getRegisteredIntents(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Get the current dialogue state for a session
   */
  getState(sessionId: string): string {
    return this.sessionStates.get(sessionId) || "initial"
  }

  /**
   * Update the dialogue flow state based on user input and emotion
   */
  updateFlow(sessionId: string, text: string, emotion: string): void {
    const { intent } = classifyIntent(text)
    // Update state based on intent and emotion
    const newState = `${intent}_${emotion}`
    this.sessionStates.set(sessionId, newState)
  }
}

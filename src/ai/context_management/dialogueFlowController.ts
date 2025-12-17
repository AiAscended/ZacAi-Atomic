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
  private sessions: Map<
    string,
    {
      intent: string
      emotion?: string
      turns: number
      history: Array<{ text: string; emotion?: string }>
    }
  > = new Map()

  registerHandler(intent: string, handler: Handler): void {
    this.handlers.set(intent, handler)
  }

  getState(sessionId: string): string {
    return this.sessions.get(sessionId)?.intent ?? "idle"
  }

  updateFlow(sessionId: string, text: string, emotion?: string): void {
    const { intent } = classifyIntent(text)
    const existing = this.sessions.get(sessionId) ?? { intent: "idle", turns: 0, history: [] as Array<{ text: string; emotion?: string }> }
    const updated = {
      intent,
      emotion: emotion ?? existing.emotion,
      turns: existing.turns + 1,
      history: [...existing.history, { text, emotion }].slice(-20),
    }
    this.sessions.set(sessionId, updated)
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
    if (typeof context.sessionId === "string") {
      this.updateFlow(context.sessionId, text)
    }
    return { status: "handled", intent, result }
  }

  getRegisteredIntents(): string[] {
    return Array.from(this.handlers.keys())
  }
}

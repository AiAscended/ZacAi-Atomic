/**
 * File: src/ai/context_management/dialogueFlowController.ts
 * Purpose: Minimal dialogue flow controller that sequences intents to handlers.
 */

import { classifyIntent } from "./intentClassifier";

type Handler = (
  text: string,
  context?: Record<string, unknown>,
) => Promise<unknown>;

const handlers = new Map<string, Handler>();

export const registerHandler = (intent: string, h: Handler) =>
  handlers.set(intent, h);

export const handleTurn = async (
  text: string,
  context: Record<string, unknown> = {},
) => {
  const { intent } = classifyIntent(text);
  const h = handlers.get(intent) ?? handlers.get("general_chat");
  if (!h) return { status: "no_handler", intent };
  const result = await h(text, context);
  return { status: "handled", intent, result };
};

export class DialogueFlowController {
  private handlers: Map<string, Handler> = new Map();
  private states: Map<string, any> = new Map();

  registerHandler(intent: string, handler: Handler): void {
    this.handlers.set(intent, handler);
  }

  getState(sessionId: string): any {
    return this.states.get(sessionId) || {};
  }

  setState(sessionId: string, state: any): void {
    this.states.set(sessionId, state);
  }

  updateFlow(sessionId: string, updates: any): void {
    const currentState = this.getState(sessionId);
    this.setState(sessionId, { ...currentState, ...updates });
  }

  async handleTurn(
    text: string,
    context: Record<string, unknown> = {},
  ): Promise<{
    status: string;
    intent: string;
    result?: unknown;
  }> {
    const { intent } = classifyIntent(text);
    const handler =
      this.handlers.get(intent) ?? this.handlers.get("general_chat");

    if (!handler) {
      return { status: "no_handler", intent };
    }

    const result = await handler(text, context);
    return { status: "handled", intent, result };
  }

  getRegisteredIntents(): string[] {
    return Array.from(this.handlers.keys());
  }

  getState(sessionId: string): string {
    return this.sessionStates.get(sessionId) ?? "neutral"
  }

  updateFlow(sessionId: string, text: string, emotionOrIntent?: string): void {
    const stateDescriptor = emotionOrIntent || this.sessionStates.get(sessionId) || "neutral"
    this.sessionStates.set(sessionId, stateDescriptor)
  }
}

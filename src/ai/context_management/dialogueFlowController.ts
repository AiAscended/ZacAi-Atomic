/**
 * File: src/ai/context_management/dialogueFlowController.ts
 * Purpose: Minimal dialogue flow controller that sequences intents to handlers.
 */

import { classifyIntent } from './intentClassifier';

type Handler = (text: string, context?: Record<string, unknown>) => Promise<unknown>;

const handlers = new Map<string, Handler>();

export const registerHandler = (intent: string, h: Handler) => handlers.set(intent, h);

export const handleTurn = async (text: string, context: Record<string, unknown> = {}) => {
  const { intent } = classifyIntent(text);
  const h = handlers.get(intent) ?? handlers.get('general_chat');
  if (!h) return { status: 'no_handler', intent };
  const result = await h(text, context);
  return { status: 'handled', intent, result };
};

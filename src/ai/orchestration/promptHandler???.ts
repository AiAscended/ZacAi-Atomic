/**
 * File: src/ai/orchestration/promptHandler.ts
 * Wrapper to handle AI prompt processing request,
 * calling main orchestrator with error handling and session support.
 *
 * Depends on:
 * - src/ai/orchestration/aiOrchestrator.ts
 */

import { AIOrchestrator } from "./aiOrchestrator";

const orchestrator = new AIOrchestrator();

export const promptHandler = {
  /**
   * Initialize main orchestrator system.
   * Typically called on session start.
   */
  async initialize() {
    await orchestrator.initialize();
  },

  /**
   * Handle a user prompt, forwarding to AIOrchestrator
   * and returning response including modular output and metadata.
   * @param prompt User input text
   * @param sessionId Session identification string
   * @param context Additional context such as chat history
   * @returns Modular AI response with text, confidence, domains and thinking steps
   */
  async handlePrompt(
    prompt: string,
    sessionId: string,
    context?: Record<string, unknown>,
  ) {
    try {
      const response = await orchestrator.processPrompt(
        prompt,
        sessionId,
        context,
      );
      return response;
    } catch (error) {
      console.error("Error in promptHandler.handlePrompt:", error);
      throw error;
    }
  },
};

/**
 * File: src/ai/context_management/interactionLogger.ts
 * Records and manages logs of user interactions, AI responses, and system events
 * allowing for better debugging, user history retrieval, and analytics.
 *
 * Usage:
 * - log(sessionId, userPrompt, aiResponse)
 * - getLogs(sessionId)
 */

interface InteractionLog {
  sessionId: string;
  timestamp: number;
  userPrompt: string;
  aiResponse: string;
}

export class InteractionLogger {
  private logs: InteractionLog[] = [];

  /**
   * Log a single user interaction with AI response.
   * @param sessionId session identifier
   * @param userPrompt raw user message
   * @param aiResponse AI generated response
   */
  log(sessionId: string, userPrompt: string, aiResponse: string) {
    this.logs.push({
      sessionId,
      timestamp: Date.now(),
      userPrompt,
      aiResponse,
    });
  }

  /**
   * Retrieve logs for a given session ID.
   * @param sessionId session identifier
   * @returns array of InteractionLog
   */
  getLogs(sessionId: string): InteractionLog[] {
    return this.logs.filter((log) => log.sessionId === sessionId);
  }
}

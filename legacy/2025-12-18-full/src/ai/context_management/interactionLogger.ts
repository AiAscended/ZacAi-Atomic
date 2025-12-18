/**
 * File: src/ai/context_management/interactionLogger.ts
 * Purpose: Lightweight in-memory logger for orchestrator interactions.
 */

interface InteractionRecord {
  sessionId: string
  prompt: string
  responsePreview: string
  timestamp: number
}

export class InteractionLogger {
  private recent: InteractionRecord[] = []
  private maxEntries = 100

  log(sessionId: string, prompt: string, response: { text: string }): void {
    const entry: InteractionRecord = {
      sessionId,
      prompt,
      responsePreview: response.text.slice(0, 280),
      timestamp: Date.now(),
    }

    this.recent.unshift(entry)
    if (this.recent.length > this.maxEntries) {
      this.recent.pop()
    }

    console.info("[InteractionLogger] Logged interaction", {
      sessionId,
      promptLength: prompt.length,
      responseLength: response.text.length,
    })
  }

  getRecent(limit = 20): InteractionRecord[] {
    return this.recent.slice(0, limit)
  }
}

/**
 * File: src/ai/orchestration/simplePromptHandler.ts
 * Purpose: Simplified prompt handler for browser-based preview environment
 */

import { SimpleOrchestrator, type SimplePrompt, type SimpleResponse } from "./simpleOrchestrator"

export class SimplePromptHandler {
  private orchestrator: SimpleOrchestrator

  constructor() {
    this.orchestrator = SimpleOrchestrator.getInstance()
  }

  public async initialize(): Promise<void> {
    await this.orchestrator.initialize()
  }

  public async handlePrompt(
    rawText: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<SimpleResponse> {
    const prompt: SimplePrompt = {
      text: rawText,
      sessionId,
      timestamp: Date.now(),
      metadata,
    }

    return await this.orchestrator.processPrompt(prompt)
  }

  public createSession(): string {
    return this.orchestrator.createSession()
  }
}

export const simplePromptHandler = new SimplePromptHandler()

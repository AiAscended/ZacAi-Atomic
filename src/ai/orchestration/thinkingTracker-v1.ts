/**
 * File: src/ai/orchestration/thinkingTracker.ts
 * Purpose: Tracks and records the AI's thinking process during prompt processing
 * for debugging, testing, and UI display
 *
 * Dependencies: None
 * Depended on by: src/ai/orchestration/aiOrchestrator.ts
 */

export interface ThinkingStep {
  step: string
  description: string
  timestamp: number
  data?: Record<string, unknown>
}

export class ThinkingTracker {
  private steps: ThinkingStep[] = []
  private startTime = 0

  public start(): void {
    this.steps = []
    this.startTime = Date.now()
  }

  public addStep(step: string, description: string, data?: Record<string, unknown>): void {
    this.steps.push({
      step,
      description,
      timestamp: Date.now() - this.startTime,
      data,
    })
  }

  public getSteps(): ThinkingStep[] {
    return [...this.steps]
  }

  public clear(): void {
    this.steps = []
    this.startTime = 0
  }
}

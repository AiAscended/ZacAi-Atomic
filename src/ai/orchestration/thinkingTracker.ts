/**
 * File: src/ai/orchestration/thinkingTracker.ts
 * Purpose: Manages AI incremental thinking process tracking and events
 * for visualization of detailed reasoning and task/token processing steps.
 *
 * This module cleanly separates reasoning/event tracking from main Orchestrator logic.
 *
 * Depends on: None
 * Used by: src/ai/orchestration/aiOrchestrator.ts, src/ai/orchestration/promptHandler.ts
 */

interface ThinkingStep {
  step: string; // short id or step name
  description: string; // human-readable description
  timestamp: number; // time ms elapsed since process start
  data?: Record<string, unknown>; // additional debugging/context data
}

export class ThinkingTracker {
  private startTime: number;
  private steps: ThinkingStep[] = [];

  constructor() {
    this.startTime = Date.now();
    this.steps = [];
  }

  /**
   * Add a thinking step event with optional data.
   * Records timestamp relative to start.
   * @param step short id of step
   * @param description human-readable description
   * @param data any extra debugging info
   */
  addStep(step: string, description: string, data?: Record<string, unknown>) {
    const now = Date.now();
    this.steps.push({
      step,
      description,
      timestamp: now - this.startTime,
      data,
    });
  }

  /**
   * Get the full array of recorded thinking steps.
   * @returns ThinkingStep[]
   */
  getSteps(): ThinkingStep[] {
    return this.steps;
  }

  /**
   * Reset thinking tracker to new session.
   */
  reset() {
    this.startTime = Date.now();
    this.steps = [];
  }
}

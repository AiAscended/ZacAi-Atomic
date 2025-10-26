/**
 * File: src/ai/orchestration/workflowEngine.ts
 * Purpose: Tiny workflow executor that runs a sequence of async steps with simple error handling.
 */

export type Step = (context: Record<string, unknown>) => Promise<void>;

export const runWorkflow = async (steps: Step[], context: Record<string, unknown> = {}) => {
  for (const step of steps) {
    try {
      await step(context);
    } catch (err) {
      // simple failure: attach error and stop
      context['workflowError'] = err;
      throw err;
    }
  }
  return context;
};

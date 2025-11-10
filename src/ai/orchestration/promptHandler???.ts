/**
 * Legacy compatibility wrapper to maintain previous imports from
 * `src/ai/orchestration/promptHandler`. Prefer using the updated
 * implementation in `promptHandler.ts` that builds on MainOrchestrator.
 */

export {
  PromptHandler,
  promptHandler,
} from "./promptHandler"

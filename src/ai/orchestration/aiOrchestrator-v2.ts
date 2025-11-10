/**
 * File: src/ai/orchestration/aiOrchestrator-v2.ts
 *
 * Legacy compatibility wrapper that re-exports the modern main orchestrator.
 * Prefer importing from `./mainOrchestrator` directly in new code.
 */

export {
  MainOrchestrator,
  type OrchestratorResponse,
} from "./mainOrchestrator"

export {
  PromptHandler,
  promptHandler,
} from "./promptHandler"


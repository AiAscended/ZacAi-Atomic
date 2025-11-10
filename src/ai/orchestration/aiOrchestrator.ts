/**
 * File: src/ai/orchestration/aiOrchestrator.ts
 * Legacy compatibility wrapper that now re-exports the MainOrchestrator API.
 * Prefer importing from ./mainOrchestrator directly in new code.
 */

export {
	MainOrchestrator,
	type OrchestratorResponse,
} from "./mainOrchestrator"

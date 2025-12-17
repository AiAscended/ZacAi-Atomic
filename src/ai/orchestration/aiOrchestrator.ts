/**
 * File: src/ai/orchestration/aiOrchestrator.ts
 * Purpose: Compatibility wrapper that forwards to the new main orchestrator.
 * This keeps existing imports working while consolidating on the modern flow.
 */

import { mainOrchestrator, type OrchestratorResponse } from "./main-orchestrator";

export class AIOrchestrator {
	async initialize(): Promise<void> {
		await mainOrchestrator.initialize();
	}

	async processPrompt(
		prompt: string,
		sessionId: string,
		context: Record<string, unknown> = {},
	): Promise<OrchestratorResponse> {
		return mainOrchestrator.processPrompt(prompt, sessionId, context);
	}
}

export type { OrchestratorResponse };

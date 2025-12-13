/**
 * File: src/ai/orchestration/aiOrchestrator.ts
 * Compatibility adapter exposing the legacy AIOrchestrator
 * name while delegating all work to MainOrchestrator.
 */

import {
	MainOrchestrator,
	type OrchestratorResponse,
} from "./mainOrchestrator"

export class AIOrchestrator {
	private readonly orchestrator: MainOrchestrator

	constructor() {
		this.orchestrator = MainOrchestrator.getInstance()
	}

	async initialize(): Promise<void> {
		await this.orchestrator.initialize()
	}

	async processPrompt(
		prompt: string,
		sessionId: string,
		context?: Record<string, unknown>
	): Promise<OrchestratorResponse> {
		return this.orchestrator.processPrompt(prompt, sessionId, context)
	}

	public getStatus() {
		return this.orchestrator.getStatus()
	}
}

/**
 * Fallback orchestrator used to keep admin heartbeat endpoint online
 * when the full orchestration stack is unavailable.
 */

export interface OrchestratorResponse {
  message: string;
  status: "ok" | "degraded";
  components?: Array<{ id: string; status: string }>;
}

class MainOrchestrator {
  async initialize() {
    return { status: "ok", initializedAt: Date.now() };
  }

  async processPrompt(prompt: string, sessionId: string, context: Record<string, unknown>) {
    return {
      message: `Fallback orchestrator processed prompt: ${prompt}`,
      status: "degraded",
      sessionId,
      context,
      components: [{ id: "orchestrator", status: "degraded" }],
    } satisfies OrchestratorResponse & { sessionId: string; context: Record<string, unknown> };
  }
}

export const mainOrchestrator = new MainOrchestrator();

/**
 * Minimal prompt handler that gracefully degrades when the full
 * orchestrator stack is unavailable. It captures user prompts,
 * runs lightweight kernel diagnostics, and returns a safe fallback
 * response instead of throwing module resolution errors.
 */

import { SystemKernel } from "@zacai/core";
import { domainRegistry } from "../knowledge-domains/domainRegistry";
import { registerAllDomains } from "../knowledge-domains/registerAllDomains";

interface PromptContext {
  history?: Array<{ role: string; content: string }>;
}

interface PromptResponse {
  text: string;
  domains: string[];
  confidence: number;
  sources?: Array<unknown>;
  metadata?: Record<string, unknown>;
  contentBlocks?: {
    textBlocks: Array<{ id: string; content: string }>;
    codeBlocks: Array<{ id: string; language: string; code: string; filename?: string }>;
  };
}

const kernel = new SystemKernel();

async function runDiagnostics() {
  const health = kernel.runHealthChecks();
  const plan = kernel.planRecovery();
  const state = kernel.getState();
  const audit = kernel.recentAudit();
  return { health, plan, state, audit };
}

export const promptHandler = {
  async initialize() {
    registerAllDomains();
    const diagnostics = await runDiagnostics();
    return { status: "degraded", domains: domainRegistry.getAllDomains(), diagnostics };
  },

  async handlePrompt(message: string, sessionId?: string, context?: PromptContext): Promise<PromptResponse> {
    registerAllDomains();
    const diagnostics = await runDiagnostics();

    const domains = domainRegistry.getAllDomains();
    const fallbackText =
      "System is running in degraded mode while knowledge-domain modules are offline. " +
      `Your message was captured for processing: "${message}". Diagnostics and recovery have been triggered.`;

    return {
      text: fallbackText,
      domains: domains.length ? domains.map((d) => d.id) : ["general"],
      confidence: domains.some((d) => d.status === "online") ? 0.7 : 0.2,
      sources: [],
      metadata: {
        fallback: true,
        sessionId,
        historySize: context?.history?.length ?? 0,
        diagnostics,
      },
      contentBlocks: {
        textBlocks: [{ id: "fallback-message", content: fallbackText }],
        codeBlocks: [],
      },
    };
  },
};

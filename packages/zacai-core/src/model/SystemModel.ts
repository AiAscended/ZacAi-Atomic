import type { SystemPrompt, SystemResponse } from "../types/index.js";
import { SystemKernel } from "../kernel/SystemKernel.js";

export class SystemModel {
  private kernel: SystemKernel;

  constructor(kernel?: SystemKernel) {
    this.kernel = kernel ?? new SystemKernel();
  }

  async handlePrompt(prompt: SystemPrompt): Promise<SystemResponse> {
    const lower = prompt.text.toLowerCase();

    if (lower.includes("health") || prompt.mode === "status") {
      return {
        summary: "System health report",
        health: this.kernel.runHealthChecks(),
        state: this.kernel.getState(),
        audit: this.kernel.recentAudit(),
      };
    }

    if (lower.includes("recover") || prompt.mode === "recovery") {
      const plan = this.kernel.planRecovery();
      return {
        summary: "Generated recovery plan",
        plan,
        state: this.kernel.getState(),
        audit: this.kernel.recentAudit(),
      };
    }

    return {
      summary: "Acknowledged system prompt",
      state: this.kernel.getState(),
      audit: this.kernel.recentAudit(),
    };
  }
}

import {
  DiagnosticReport,
  HealthSignal,
  RemediationAction,
  RemediationOutcome,
  SelfHealPlaybook,
} from "../types";
import { systemModel, SystemModelEvent } from "../system-model";

export interface SelfHealOptions {
  autoStart?: boolean;
  log?: (message: string, data?: Record<string, unknown>) => void;
}

export class SelfHealingEngine {
  private playbooks: SelfHealPlaybook[] = [];
  private listening = false;
  private unsubscribe?: () => void;
  private readonly healthHistory: HealthSignal[] = [];

  constructor(private readonly options: SelfHealOptions = {}) {
    if (options.autoStart) {
      this.start();
    }
  }

  registerPlaybook(playbook: SelfHealPlaybook) {
    this.playbooks.push(playbook);
  }

  start() {
    if (this.listening) return;
    this.unsubscribe = systemModel.subscribe(event => this.handleEvent(event));
    this.listening = true;
    this.log("self-heal-engine-started");
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    this.listening = false;
    this.log("self-heal-engine-stopped");
  }

  async evaluateSignal(signal: HealthSignal): Promise<RemediationOutcome[]> {
    this.healthHistory.push(signal);
    const snapshot = systemModel.getSnapshot();
    const component = systemModel.getComponent(signal.componentId);
    const context = { signal, component, snapshot };

    const applicable = this.playbooks.filter(playbook => playbook.conditions(signal));
    const outcomes: RemediationOutcome[] = [];

    for (const playbook of applicable) {
      for (const action of playbook.actions) {
        try {
          this.log("running-remediation", { actionId: action.id, componentId: signal.componentId });
          const outcome = await action.executor(context);
          outcomes.push(outcome);
          if (!outcome.success) {
            this.log("remediation-failed", { actionId: action.id, message: outcome.message });
          }
        } catch (error) {
          outcomes.push({
            success: false,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    return outcomes;
  }

  async runDiagnostics(limit = 25): Promise<DiagnosticReport> {
    const recentSignals = this.healthHistory.slice(-limit);
    const snapshot = systemModel.getSnapshot();
    const recommended: RemediationAction[] = [];

    for (const signal of recentSignals) {
      const playbook = this.playbooks.find(pb => pb.conditions(signal));
      if (playbook) {
        recommended.push(...playbook.actions);
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      signals: recentSignals,
      plan: snapshot.activePlans.at(0),
      recommendedActions: recommended,
    };
  }

  private handleEvent(event: SystemModelEvent) {
    if (event.type === "health-signal") {
      void this.evaluateSignal(event.signal);
    }
  }

  private log(message: string, data?: Record<string, unknown>) {
    if (this.options.log) {
      this.options.log(message, data);
    }
  }
}

export const selfHealingEngine = new SelfHealingEngine({ autoStart: true });

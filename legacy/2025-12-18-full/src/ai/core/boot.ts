import fs from "fs/promises";
import path from "path";
import { BootOptions, BootPhase, BootReport } from "../types";
import { selfHealingEngine } from "./self-heal";
import { ensureHeartOrgansRegistered, markHeartOrganStatus } from "./heart-structure";
import { systemModel } from "../system-model";

const HEART_STATE_DIR = path.join(process.cwd(), "src", "ai", "data", "heart-state");

const defaultBootPhases: BootPhase[] = [
  {
    id: "filesystem",
    label: "Filesystem",
    description: "Verify directories for heart telemetry and memory",
    checks: [
      {
        id: "ensure-heart-state-dir",
        description: "Ensure heart state directory exists",
        critical: true,
        run: async () => {
          await fs.mkdir(HEART_STATE_DIR, { recursive: true });
          return true;
        },
      },
    ],
  },
  {
    id: "core-components",
    label: "Core Components",
    description: "Guarantee mandatory components are registered",
    checks: [
      {
        id: "verify-main-orchestrator",
        description: "Main orchestrator component is registered",
        critical: true,
        run: async () => systemModel.getComponent("main-orchestrator") !== null,
      },
      {
        id: "verify-core-heart",
        description: "Core heart component metadata updated",
        critical: true,
        run: async () => systemModel.getComponent("heart-core") !== null,
      },
    ],
  },
  {
    id: "self-heal",
    label: "Self-heal",
    description: "Confirm self-healing loop is listening",
    checks: [
      {
        id: "self-heal-engine",
        description: "Self-healing engine running",
        critical: false,
        run: async () => {
          selfHealingEngine.start();
          return true;
        },
      },
    ],
  },
];

export async function bootHeart(options: BootOptions = {}): Promise<BootReport> {
  const phases = options.additionalPhases ? [...defaultBootPhases, ...options.additionalPhases] : defaultBootPhases;
  const report: BootReport = {
    startedAt: new Date().toISOString(),
    completedAt: "",
    phases: phases.map(phase => ({ id: phase.id, status: "pending", issues: [] })),
    blocked: false,
  };

  for (const phase of phases) {
    const phaseStatus = report.phases.find(p => p.id === phase.id)!;
    phaseStatus.status = "running";

    for (const check of phase.checks) {
      try {
        const passed = await check.run();
        if (!passed) {
          const message = `${check.id} failed`;
          phaseStatus.issues.push(message);
          if (check.critical) {
            phaseStatus.status = "failed";
            report.blocked = true;
            report.completedAt = new Date().toISOString();
            return report;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        phaseStatus.issues.push(message);
        if (check.critical) {
          phaseStatus.status = "failed";
          report.blocked = true;
          report.completedAt = new Date().toISOString();
          return report;
        }
      }
    }

    if (phaseStatus.status !== "failed") {
      phaseStatus.status = "passed";
    }
  }

  report.completedAt = new Date().toISOString();
  return report;
}

export function registerHeartCore(): void {
  ensureHeartOrgansRegistered();
  markHeartOrganStatus("heart-core", "healthy", "Heart core registered", {
    registeredAt: new Date().toISOString(),
  });
  markHeartOrganStatus("main-orchestrator", "healthy", "Main orchestrator registered");
}

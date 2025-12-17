import { ensureSystemWatcher } from "../orchestration/system"
import { selfHealingEngine } from "../core/self-heal"
import { systemKernel } from "../system-kernel"
import type { DiagnosticReport } from "../types"
import { systemModel } from "./SystemModel"

export type OperationalMode = "maintenance" | "active"

export interface SystemAgentStatus {
  running: boolean
  loopIntervalMs: number
  lastHeartbeatAt: string | null
  lastDiagnostics?: DiagnosticReport | null
  maintenanceMode: boolean
  issues: string[]
}

export interface ModeConstraint {
  requestedMode?: OperationalMode
  activeMode: OperationalMode
  allowWrites: boolean
  reason?: string
}

interface SystemAgentOptions {
  loopIntervalMs?: number
  autoStart?: boolean
}

export class SystemAgent {
  private loopHandle: ReturnType<typeof setInterval> | null = null
  private loopIntervalMs: number
  private running = false
  private kernelReady = false
  private lastDiagnostics: DiagnosticReport | null = null
  private lastHeartbeatAt: string | null = null
  private issues: string[] = []

  constructor(private readonly options: SystemAgentOptions = {}) {
    this.loopIntervalMs = options.loopIntervalMs ?? 60_000
    if (options.autoStart) {
      void this.start()
    }
  }

  async start(options?: SystemAgentOptions): Promise<void> {
    if (options?.loopIntervalMs) {
      this.loopIntervalMs = options.loopIntervalMs
    }

    await this.ensureKernelReady()

    if (this.running) {
      return
    }

    this.running = true
    await this.runOnce("startup")
    this.loopHandle = setInterval(() => {
      void this.runOnce("interval")
    }, this.loopIntervalMs)
  }

  async stop(): Promise<void> {
    if (this.loopHandle) {
      clearInterval(this.loopHandle)
      this.loopHandle = null
    }
    this.running = false
  }

  async runOnce(trigger: string): Promise<void> {
    await this.refreshContext()
    const diagnostics = await selfHealingEngine.runDiagnostics()
    this.lastDiagnostics = diagnostics
    this.lastHeartbeatAt = new Date().toISOString()
    this.issues = diagnostics.recommendedActions.map(action => action.description)

    systemModel.recordHealthSignal({
      componentId: "system-agent",
      status: diagnostics.recommendedActions.length ? "degraded" : "healthy",
      message: `SystemAgent heartbeat (${trigger})`,
      metadata: {
        recommendedActions: diagnostics.recommendedActions.map(action => action.id),
        signals: diagnostics.signals.length,
      },
      timestamp: this.lastHeartbeatAt,
    })
  }

  getModeConstraints(requestedMode?: OperationalMode): ModeConstraint {
    const context = systemModel.getContext()
    const maintenanceMode = context.maintenanceMode
    const activeMode: OperationalMode = maintenanceMode ? "maintenance" : requestedMode ?? "active"
    const allowWrites = !maintenanceMode

    return {
      requestedMode,
      activeMode,
      allowWrites,
      reason: maintenanceMode && requestedMode === "active" ? "System locked in maintenance mode" : undefined,
    }
  }

  getStatus(): SystemAgentStatus {
    const context = systemModel.getContext()
    return {
      running: this.running,
      loopIntervalMs: this.loopIntervalMs,
      lastHeartbeatAt: this.lastHeartbeatAt,
      lastDiagnostics: this.lastDiagnostics,
      maintenanceMode: context.maintenanceMode,
      issues: this.issues,
    }
  }

  private async ensureKernelReady(): Promise<void> {
    if (this.kernelReady) {
      return
    }

    await ensureSystemWatcher({ autoRebuild: false })
    await systemKernel.initialize()
    systemKernel.registerComponent({
      id: "system-agent",
      name: "System Agent",
      kind: "agent",
      capabilities: ["monitoring", "diagnostics", "self-heal"],
      metadata: {
        loopIntervalMs: this.loopIntervalMs,
        registeredAt: new Date().toISOString(),
      },
    })
    this.kernelReady = true
  }

  private async refreshContext(force = false): Promise<void> {
    await systemKernel.refreshContext(force)
    const current = systemModel.getContext()

    systemModel.updateContext({
      metadata: {
        ...(current.metadata ?? {}),
        systemAgent: {
          refreshedAt: new Date().toISOString(),
          loopIntervalMs: this.loopIntervalMs,
        },
      },
    })
  }
}

const shouldAutoStart = process.env.NODE_ENV !== "test"
export const systemAgent = new SystemAgent({ autoStart: shouldAutoStart })

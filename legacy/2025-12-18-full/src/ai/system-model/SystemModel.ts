/**
 * SystemModel
 *  - Acts as the OS brain for ZacAi, maintaining live component/goal/plan registries
 *  - Pure data holder: no side-effects beyond bookkeeping and event emission
 */
import { EventEmitter } from "events"
import type {
  ComponentHealth,
  ComponentHealthStatus,
  ExecutionContext,
  HealthSignal,
  PlanGraph,
  SystemComponent,
  SystemGoal,
  SystemSnapshot,
} from "../types"

export type SystemModelEvent =
  | { type: "component-registered"; component: SystemComponent }
  | { type: "component-updated"; component: SystemComponent }
  | { type: "health-signal"; signal: HealthSignal }
  | { type: "goal-created"; goal: SystemGoal }
  | { type: "plan-registered"; plan: PlanGraph }

export interface RegisterComponentInput {
  id: string
  name: string
  kind: SystemComponent["kind"]
  version?: string
  dependencies?: SystemComponent["dependencies"]
  capabilities?: string[]
  metadata?: Record<string, unknown>
  entryPoint?: string
}

export class SystemModel {
  private readonly components = new Map<string, SystemComponent>()
  private readonly goals = new Map<string, SystemGoal>()
  private readonly plans = new Map<string, PlanGraph>()
  private readonly emitter = new EventEmitter()
  private context: ExecutionContext = {
    maintenanceMode: true,
    offlineMode: true,
    availableTools: [],
    availableDomains: [],
    environment: "maintenance",
  }

  registerComponent(input: RegisterComponentInput): SystemComponent {
    const now = new Date().toISOString()
    const existing = this.components.get(input.id)

    const component: SystemComponent = {
      id: input.id,
      name: input.name,
      kind: input.kind,
      version: input.version ?? existing?.version,
      status: existing?.status ?? "unknown",
      health: existing?.health ?? {
        status: "unknown",
        metrics: {},
        summary: "Not yet evaluated",
        lastChecked: now,
      },
      dependencies: input.dependencies ?? existing?.dependencies ?? [],
      capabilities: input.capabilities ?? existing?.capabilities ?? [],
      entryPoint: input.entryPoint ?? existing?.entryPoint,
      metadata: {
        ...(existing?.metadata ?? {}),
        ...(input.metadata ?? {}),
      },
      lastUpdated: now,
    }

    this.components.set(component.id, component)
    this.emit({ type: existing ? "component-updated" : "component-registered", component })
    return component
  }

  updateContext(next: Partial<ExecutionContext>) {
    this.context = { ...this.context, ...next }
  }

  getContext(): ExecutionContext {
    return this.context
  }

  updateComponentHealth(componentId: string, health: Partial<ComponentHealth>): SystemComponent | null {
    const existing = this.components.get(componentId)
    if (!existing) {
      return null
    }

    const updated: SystemComponent = {
      ...existing,
      status: health.status ?? existing.status,
      health: {
        ...existing.health,
        ...health,
        metrics: { ...existing.health.metrics, ...(health.metrics ?? {}) },
        lastChecked: health.lastChecked ?? new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    }

    this.components.set(componentId, updated)
    this.emit({ type: "component-updated", component: updated })
    return updated
  }

  recordHealthSignal(signal: HealthSignal): void {
    const component = this.components.get(signal.componentId)
    if (component && component.status !== signal.status) {
      this.updateComponentHealth(signal.componentId, {
        status: signal.status,
        summary: signal.message,
        metrics: signal.metrics ?? component.health.metrics,
        detail: signal.metadata,
      })
    }
    this.emit({ type: "health-signal", signal })
  }

  listComponents(kind?: SystemComponent["kind"]): SystemComponent[] {
    const values = Array.from(this.components.values())
    if (!kind) return values
    return values.filter(component => component.kind === kind)
  }

  getComponent(id: string): SystemComponent | null {
    return this.components.get(id) ?? null
  }

  createGoal(goal: SystemGoal): void {
    this.goals.set(goal.id, goal)
    this.emit({ type: "goal-created", goal })
  }

  listGoals(): SystemGoal[] {
    return Array.from(this.goals.values())
  }

  registerPlan(plan: PlanGraph): void {
    this.plans.set(plan.goalId, plan)
    this.emit({ type: "plan-registered", plan })
  }

  getPlan(goalId: string): PlanGraph | null {
    return this.plans.get(goalId) ?? null
  }

  getSnapshot(): SystemSnapshot {
    return {
      generatedAt: new Date().toISOString(),
      components: this.listComponents(),
      goals: this.listGoals(),
      activePlans: Array.from(this.plans.values()),
      context: this.context,
    }
  }

  subscribe(listener: (event: SystemModelEvent) => void): () => void {
    this.emitter.on("event", listener as never)
    return () => this.emitter.off("event", listener as never)
  }

  private emit(event: SystemModelEvent) {
    this.emitter.emit("event", event)
  }

  markComponentStatus(componentId: string, status: ComponentHealthStatus, summary?: string) {
    return this.updateComponentHealth(componentId, {
      status,
      summary: summary ?? this.components.get(componentId)?.health.summary ?? "",
    })
  }

  resetForTesting(): void {
    this.components.clear()
    this.goals.clear()
    this.plans.clear()
    this.context = {
      maintenanceMode: true,
      offlineMode: true,
      availableTools: [],
      availableDomains: [],
      environment: "maintenance",
    }
  }
}

export const systemModel = new SystemModel()

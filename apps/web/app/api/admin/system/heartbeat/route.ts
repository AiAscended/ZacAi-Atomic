import { NextRequest, NextResponse } from "next/server"
import { mainOrchestrator, type OrchestratorResponse } from "@/ai/orchestration/main-orchestrator"
import { systemModel, selfHealingEngine } from "@/ai/core"
import type { DiagnosticReport, PlanGraph, SystemComponent } from "@/ai/types"

export interface HeartbeatRequestBody {
  action?: string
  prompt?: string
  context?: Record<string, unknown>
}

type HeartbeatTrigger = "self-test" | "custom-prompt"

export class HeartbeatRequestError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message)
    this.name = "HeartbeatRequestError"
  }
}

interface NormalizedHeartbeatRequest {
  prompt: string
  trigger: HeartbeatTrigger
  sessionId: string
  context: Record<string, unknown>
}

export const DEFAULT_HEARTBEAT_PROMPT =
  "Run a ZacAi Heart core diagnostic. Summarize operational status, component readiness, and any blockers. Respond succinctly in two paragraphs."

interface HeartbeatResult {
  timestamp: string
  response: OrchestratorResponse
  diagnostics: DiagnosticReport
  trigger: HeartbeatTrigger
  prompt: string
}

const CORE_COMPONENT_IDS = new Set([
  "heart-core",
  "main-orchestrator",
  "orchestration-goal-interpreter",
  "orchestration-executor",
  "response-synthesizer",
  "inference-engine",
  "monitoring-center",
  "self-heal-engine",
])

let lastHeartbeat: HeartbeatResult | null = null

function normalizeHeartbeatRequest(body: HeartbeatRequestBody = {}): NormalizedHeartbeatRequest {
  const sanitizedPrompt = body.prompt?.trim()
  const isSelfTest = body.action === "self-test"

  if (!sanitizedPrompt && !isSelfTest) {
    throw new HeartbeatRequestError("Request must include a prompt or action \"self-test\"")
  }

  const trigger: HeartbeatTrigger = isSelfTest && !sanitizedPrompt ? "self-test" : "custom-prompt"
  const resolvedPrompt = sanitizedPrompt && sanitizedPrompt.length > 0 ? sanitizedPrompt : DEFAULT_HEARTBEAT_PROMPT
  const contextOverrides = typeof body.context === "object" && body.context !== null ? body.context : {}

  const baseContext = {
    mode: "maintenance",
    origin: "admin-dashboard",
    actor: "system-admin",
    intent: trigger === "self-test" ? "core-self-test" : "admin-manual-command",
    requestType: trigger,
  }

  return {
    prompt: resolvedPrompt,
    trigger,
    sessionId: `admin-heartbeat-${Date.now()}`,
    context: { ...baseContext, ...contextOverrides },
  }
}

async function ensureCoreReady() {
  try {
    await mainOrchestrator.initialize()
  } catch (error) {
    console.error("[heartbeat] Failed to initialize orchestrator", error)
    throw error
  }
}

function serializePlan(plan: PlanGraph | null) {
  if (!plan) {
    return null
  }

  return {
    goalId: plan.goalId,
    version: plan.version,
    createdAt: plan.createdAt,
    steps: Object.values(plan.steps).map(step => ({
      id: step.id,
      label: step.label,
      status: step.status,
      updatedAt: step.updatedAt,
      executor: step.executor,
      targetComponent: step.targetComponent,
    })),
  }
}

function filterCoreComponents(components: SystemComponent[]) {
  return components
    .filter(component => CORE_COMPONENT_IDS.has(component.id))
    .map(component => ({
      id: component.id,
      name: component.name,
      kind: component.kind,
      status: component.status,
      summary: component.health.summary,
      lastUpdated: component.lastUpdated,
      dependencies: component.dependencies,
    }))
}

export async function GET() {
  try {
    await ensureCoreReady()
    const snapshot = systemModel.getSnapshot()
    const plan = systemModel.getPlan("goal-heart-main-orchestrator")

    return NextResponse.json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      context: snapshot.context,
      goals: snapshot.goals,
      plan: serializePlan(plan),
      lastHeartbeat,
    })
  } catch (error) {
    console.error("[heartbeat] GET failed", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function executeHeartbeatCommand(body: HeartbeatRequestBody = {}) {
  const normalizedRequest = normalizeHeartbeatRequest(body)
  await ensureCoreReady()

  const response = await mainOrchestrator.processPrompt(
    normalizedRequest.prompt,
    normalizedRequest.sessionId,
    normalizedRequest.context,
  )

  const diagnostics = await selfHealingEngine.runDiagnostics()
  lastHeartbeat = {
    timestamp: new Date().toISOString(),
    response,
    diagnostics,
    trigger: normalizedRequest.trigger,
    prompt: normalizedRequest.prompt,
  }

  return {
    ok: true,
    result: lastHeartbeat,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as HeartbeatRequestBody
    const result = await executeHeartbeatCommand(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[heartbeat] POST failed", error)
    const status = error instanceof HeartbeatRequestError ? error.statusCode : 500
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status },
    )
  }
}

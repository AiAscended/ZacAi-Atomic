'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface HeartbeatPlanStep {
  id: string
  label: string
  status: string
  updatedAt: string
  executor: string
  targetComponent?: string
}

interface HeartbeatComponent {
  id: string
  name: string
  kind: string
  status: string
  summary: string
  lastUpdated: string
  dependencies: Array<{ id: string; contract: string }>
}

interface HeartbeatDiagnostics {
  generatedAt: string
  signals: Array<{ componentId: string; status: string }>
  recommendedActions: Array<{ id: string; label?: string }>
}

interface HeartbeatAnalysis {
  timestamp: string
  response: {
    text: string
    confidence: number
    domains: string[]
    sources?: string[]
  }
  diagnostics: HeartbeatDiagnostics
}

export interface HeartbeatResponse {
  ok: boolean
  generatedAt: string
  context: {
    maintenanceMode: boolean
    offlineMode: boolean
    availableTools: string[]
    availableDomains: string[]
    environment: string
    metadata?: Record<string, unknown>
  }
  components: HeartbeatComponent[]
  goals: Array<{ id: string; objective: string; priority: number }>
  plan: {
    goalId: string
    version: string
    createdAt: string
    steps: HeartbeatPlanStep[]
  } | null
  lastHeartbeat: HeartbeatAnalysis | null
}

interface HeartStatusPanelProps {
  heartbeat: HeartbeatResponse | null
}

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100',
  running: 'bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100',
  ready: 'bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-100',
  pending: 'bg-slate-100 text-slate-900 dark:bg-slate-500/20 dark:text-slate-100',
  failed: 'bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100',
  skipped: 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100',
}

function formatTimestamp(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export function HeartStatusPanel({ heartbeat }: HeartStatusPanelProps) {
  if (!heartbeat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heart Plan Execution</CardTitle>
          <CardDescription>Waiting for the first heartbeat reading…</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connect to the admin dashboard to trigger the initial core heartbeat.</p>
        </CardContent>
      </Card>
    )
  }

  const planSteps = heartbeat.plan?.steps ?? []
  const lastHeartbeat = heartbeat.lastHeartbeat
  const actions = lastHeartbeat?.diagnostics.recommendedActions ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Heart Plan Execution</CardTitle>
          <CardDescription>
            {heartbeat.plan
              ? `Goal ${heartbeat.plan.goalId} · version ${heartbeat.plan.version}`
              : 'Plan not registered'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {planSteps.length === 0 && (
            <p className="text-sm text-muted-foreground">No steps recorded yet. Trigger a self-test to populate the plan graph.</p>
          )}
          {planSteps.map(step => (
            <div key={step.id} className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Target · {step.targetComponent ?? 'n/a'} · Updated {formatTimestamp(step.updatedAt)}
                  </p>
                </div>
                <Badge className={cn('capitalize', statusStyles[step.status] ?? 'bg-secondary text-secondary-foreground')}>
                  {step.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Latest Self-Test</CardTitle>
          <CardDescription>
            {lastHeartbeat ? `Captured ${formatTimestamp(lastHeartbeat.timestamp)}` : 'No self-test has been run yet'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {lastHeartbeat ? (
            <>
              <p className="whitespace-pre-line rounded-md bg-muted/70 p-3 text-muted-foreground">
                {lastHeartbeat.response.text}
              </p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-700 dark:text-emerald-200">
                  Confidence {(lastHeartbeat.response.confidence * 100).toFixed(1)}%
                </span>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 font-medium text-sky-700 dark:text-sky-200">
                  Domains {lastHeartbeat.response.domains.join(', ') || 'n/a'}
                </span>
                <span className="rounded-full bg-purple-500/10 px-3 py-1 font-medium text-purple-700 dark:text-purple-200">
                  Signals {lastHeartbeat.diagnostics.signals.length}
                </span>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Recommended follow-ups</p>
                {actions.length === 0 ? (
                  <p className="text-xs text-muted-foreground/80">No remediation required.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-xs">
                    {actions.slice(0, 4).map(action => (
                      <li key={action.id} className="rounded-md bg-muted/50 px-3 py-2">
                        {action.label ?? action.id}
                      </li>
                    ))}
                    {actions.length > 4 && (
                      <li className="text-muted-foreground">+{actions.length - 4} additional actions</li>
                    )}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Run a self-test to record the first telemetry sample.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Activity, HeartPulse, RefreshCw, ShieldCheck, Terminal, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SystemAwarenessPanel } from "@/components/admin/dev-console/SystemAwarenessPanel"
import { HeartStatusPanel, type HeartbeatResponse } from "@/components/admin/dashboard/HeartStatusPanel"

export default function DashboardPage() {
  const [heartbeat, setHeartbeat] = useState<HeartbeatResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningSelfTest, setRunningSelfTest] = useState(false)

  const fetchHeartbeat = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/system/heartbeat', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Failed to load heartbeat')
      }
      setHeartbeat(payload as HeartbeatResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load heartbeat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchHeartbeat()
  }, [fetchHeartbeat])

  const handleSelfTest = useCallback(async () => {
    try {
      setRunningSelfTest(true)
      setError(null)
      const response = await fetch('/api/admin/system/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'self-test' }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Core self-test failed')
      }
      await fetchHeartbeat()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run self-test')
    } finally {
      setRunningSelfTest(false)
    }
  }, [fetchHeartbeat])

  const stats = useMemo(() => {
    const maintenance = heartbeat?.context.maintenanceMode ?? true
    const totalComponents = heartbeat?.components.length ?? 0
    const healthyComponents = heartbeat?.components.filter(component => component.status === 'healthy').length ?? 0
    const planSteps = heartbeat?.plan?.steps ?? []
    const planCompleted = planSteps.filter(step => step.status === 'completed').length
    const lastSelfTest = heartbeat?.lastHeartbeat?.timestamp

    return [
      {
        label: 'Maintenance Mode',
        value: maintenance ? 'ENABLED' : 'DISABLED',
        helper: maintenance ? 'Non-critical systems paused' : 'All systems live',
        icon: ShieldCheck,
        accent: maintenance ? 'text-amber-500' : 'text-emerald-500',
      },
      {
        label: 'Core Components Healthy',
        value: `${healthyComponents}/${totalComponents}`,
        helper: 'Heart organs reporting healthy',
        icon: HeartPulse,
        accent: 'text-rose-500',
      },
      {
        label: 'Heart Plan Progress',
        value: planSteps.length ? `${planCompleted}/${planSteps.length}` : '0/0',
        helper: 'Steps completed this cycle',
        icon: Activity,
        accent: 'text-sky-500',
      },
      {
        label: 'Last Self-Test',
        value: lastSelfTest ? new Date(lastSelfTest).toLocaleTimeString() : 'Not run',
        helper: heartbeat?.lastHeartbeat?.response.confidence
          ? `Confidence ${(heartbeat.lastHeartbeat.response.confidence * 100).toFixed(1)}%`
          : 'Awaiting first run',
        icon: Zap,
        accent: 'text-purple-500',
      },
    ]
  }, [heartbeat])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Core Operations Center</h1>
          <p className="text-sm text-muted-foreground">Monitor the ZacAi Heart Core while the rest of the stack stays in maintenance mode.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchHeartbeat} disabled={loading || runningSelfTest}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleSelfTest} disabled={runningSelfTest}>
            {runningSelfTest ? (
              <>Running self-test…</>
            ) : (
              <>
                <HeartPulse className="mr-2 h-4 w-4" />
                Run Self-Test
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/60 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold">{loading ? '—' : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.helper}</p>
                </div>
                <Icon className={cn('h-8 w-8', stat.accent)} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <HeartStatusPanel heartbeat={heartbeat} />

      <SystemAwarenessPanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Terminal className="h-4 w-4" />
            CLI Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Run <span className="font-mono text-xs">npm run heart:self-test</span> in the admin terminal to watch the Heart
            Core exercise its self-heal diagnostics live. The tests stream through the Dev Console terminal panel and feed the
            dashboard’s heartbeat history.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

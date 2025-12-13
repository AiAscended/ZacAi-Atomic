"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { AlertTriangle, GitBranch, RefreshCw, ShieldCheck, Sparkles, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { SystemErrorRecord } from "@/lib/errors/types"

type AutoResolveStrategy = "self-heal" | "rollback"

interface ErrorResponse {
  success: boolean
  data: {
    errors: SystemErrorRecord[]
    stats: {
      active: number
      resolved: number
      critical: number
      warning: number
    }
    autoResolve: {
      autoResolveErrors: boolean
      errorRecoveryStrategy: AutoResolveStrategy
      maxAutoResolveAttempts: number
    }
  }
}

const severityStyles: Record<SystemErrorRecord["severity"], { icon: ReactNode; tone: string; label: string }> = {
  info: {
    icon: <Sparkles className="h-4 w-4 text-sky-500" />,
    tone: "sky",
    label: "Info",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    tone: "yellow",
    label: "Warning",
  },
  error: {
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    tone: "red",
    label: "Error",
  },
  critical: {
    icon: <ShieldCheck className="h-4 w-4 text-rose-500" />,
    tone: "rose",
    label: "Critical",
  },
}

const statusCopy: Record<SystemErrorRecord["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "destructive" },
  resolving: { label: "Resolving", variant: "secondary" },
  resolved: { label: "Resolved", variant: "default" },
  failed: { label: "Failed", variant: "outline" },
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<SystemErrorRecord[]>([])
  const [stats, setStats] = useState({ active: 0, resolved: 0, critical: 0, warning: 0 })
  const [autoResolve, setAutoResolve] = useState({
    autoResolveErrors: false,
    errorRecoveryStrategy: "self-heal" as AutoResolveStrategy,
    maxAutoResolveAttempts: 1,
  })
  const [loading, setLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const repoOwner = process.env.NEXT_PUBLIC_GITHUB_OWNER || "AiAscended"
  const repoName = process.env.NEXT_PUBLIC_GITHUB_REPO || "ZacAi-Atomic"

  const fetchErrors = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/admin/errors")
      if (!response.ok) {
        throw new Error("Unable to load incidents")
      }
      const payload = (await response.json()) as ErrorResponse
      if (payload.success) {
        setErrors(payload.data.errors)
        setStats(payload.data.stats)
        setAutoResolve(payload.data.autoResolve)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchErrors()
  }, [fetchErrors])

  const updateAutoResolve = useCallback(
    async (updates: Partial<typeof autoResolve>) => {
      const next = { ...autoResolve, ...updates }
      setAutoResolve(next)
      try {
        await fetch("/api/admin/errors/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            autoResolveErrors: next.autoResolveErrors,
            errorRecoveryStrategy: next.errorRecoveryStrategy,
            maxAutoResolveAttempts: next.maxAutoResolveAttempts,
          }),
        })
      } catch (error) {
        console.error("Failed to persist auto-resolve settings", error)
      }
    },
    [autoResolve]
  )

  const handleResolve = useCallback(
    async (id: string, mode: "auto" | "manual") => {
      setResolvingId(id)
      setErrorMessage(null)
      try {
        const response = await fetch(`/api/admin/errors/${id}/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
          }),
        })

        if (!response.ok) {
          const problem = await response.json().catch(() => null)
          throw new Error(problem?.error || "Unable to resolve incident")
        }

        await fetchErrors()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Resolution failed")
      } finally {
        setResolvingId(null)
      }
    },
    [fetchErrors]
  )

  const newestUpdate = useMemo(() => {
    if (!errors.length) return null
    return errors.reduce((latest, current) => {
      if (!latest) return current
      return latest.detectedAt > current.detectedAt ? latest : current
    }, errors[0])
  }, [errors])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Resilience Console</p>
          <h1 className="text-3xl font-bold">Error Detection & Self-Healing</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchErrors} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Incidents</div>
          <div className="text-3xl font-semibold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">Tracked in the registry</p>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="text-3xl font-semibold">{stats.resolved}</div>
          <p className="text-xs text-muted-foreground">Closed via manual or auto heal</p>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical Alerts</div>
          <div className="text-3xl font-semibold text-rose-500">{stats.critical}</div>
          <p className="text-xs text-muted-foreground">Requires immediate attention</p>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Warnings</div>
          <div className="text-3xl font-semibold text-yellow-500">{stats.warning}</div>
          <p className="text-xs text-muted-foreground">Monitoring for drift & anomalies</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Self-Healing Policy</p>
            <h2 className="text-xl font-semibold">Auto Resolution Guardrails</h2>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="auto-resolve">Auto resolve</Label>
            <Switch
              id="auto-resolve"
              checked={autoResolve.autoResolveErrors}
              onCheckedChange={(checked) => updateAutoResolve({ autoResolveErrors: checked })}
            />
          </div>
        </div>
        <Separator />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select
              value={autoResolve.errorRecoveryStrategy}
              onValueChange={(value: AutoResolveStrategy) => updateAutoResolve({ errorRecoveryStrategy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self-heal">GitHub self-heal (branch rollback)</SelectItem>
                <SelectItem value="rollback">Stable main rollback only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Determines whether ZacAi initiates the GitHub self-heal workflow or performs a hard rollback reference.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Max attempts</Label>
            <Select
              value={String(autoResolve.maxAutoResolveAttempts)}
              onValueChange={(value) => updateAutoResolve({ maxAutoResolveAttempts: Number(value) })}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Caps how many automated GitHub recoveries an incident can attempt before requiring manual review.
            </p>
          </div>
          <div className="rounded-lg border p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Latest ingest</p>
            {newestUpdate ? (
              <div className="flex items-center gap-2 text-xs">
                <Timer className="h-4 w-4" />
                {new Date(newestUpdate.detectedAt).toLocaleString()}
              </div>
            ) : (
              <p>No incidents ingested yet</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">Incident Queue</h2>
          <div className="text-sm text-muted-foreground">{errors.length} items • realtime from system activity logs</div>
        </div>

        {errorMessage && (
          <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading incidents…</p>
        ) : errors.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No active incidents. ZacAi is healthy.
          </div>
        ) : (
          <div className="space-y-4">
            {errors.map((incident) => {
              const severity = severityStyles[incident.severity]
              const status = statusCopy[incident.status]

              return (
                <div key={incident.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        {severity.icon}
                        {severity.label}
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{incident.subsystem}</div>
                        <p className="text-lg font-semibold text-foreground">{incident.message}</p>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase">Domain</p>
                      <p className="font-medium text-foreground">{incident.domain}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Detected</p>
                      <p>{new Date(incident.detectedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Last Update</p>
                      <p>{new Date(incident.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {incident.metadata?.affectedFiles?.length ? (
                    <div className="mt-4">
                      <p className="text-xs uppercase text-muted-foreground mb-1">Impacted files</p>
                      <div className="flex flex-wrap gap-2">
                        {incident.metadata.affectedFiles.map((file) => (
                          <Badge key={file} variant="outline">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {incident.resolution.githubBackupBranch && (
                      <a
                        href={`https://github.com/${repoOwner}/${repoName}/tree/${incident.resolution.githubBackupBranch}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <GitBranch className="h-4 w-4" />
                        Backup: {incident.resolution.githubBackupBranch}
                      </a>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResolve(incident.id, "manual")}
                        disabled={resolvingId === incident.id}
                      >
                        Mark Resolved
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResolve(incident.id, autoResolve.autoResolveErrors ? "auto" : "manual")}
                        disabled={resolvingId === incident.id}
                      >
                        {resolvingId === incident.id ? "Resolving…" : autoResolve.autoResolveErrors ? "Auto Resolve" : "Resolve"}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

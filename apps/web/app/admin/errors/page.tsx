"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from "lucide-react";

type IncidentSeverity = "info" | "warning" | "error";

interface Incident {
  id: string;
  message: string;
  severity: IncidentSeverity;
  domain: string;
  timestamp: string;
}

export default function ErrorsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder data to keep the page functional while the
    // full incident registry is offline.
    setIncidents([
      {
        id: "1",
        message: "Knowledge-domain registry unreachable; running in degraded mode",
        severity: "warning",
        domain: "System",
        timestamp: new Date().toLocaleString(),
      },
      {
        id: "2",
        message: "Awaiting module loader bootstrap",
        severity: "info",
        domain: "Orchestrator",
        timestamp: new Date().toLocaleString(),
      },
    ]);
    setLoading(false);
  }, []);

  const iconFor = (severity: IncidentSeverity) => {
    if (severity === "error") return <XCircle className="h-5 w-5 text-red-500" />;
    if (severity === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Resilience Console</p>
          <h1 className="text-3xl font-bold">Error Detection & Self-Healing</h1>
        </div>
        <Button variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Active Incidents</p>
            <p className="text-3xl font-semibold">{incidents.length}</p>
          </div>
          <Badge variant="outline">Degraded Mode</Badge>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading incidents…</p>
        ) : incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active incidents.</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex items-start gap-3 rounded-lg border p-3">
                {iconFor(incident.severity)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{incident.domain}</span>
                    <span className="text-xs text-muted-foreground">{incident.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.message}</p>
                  <Badge variant="outline" className="text-xs capitalize w-fit">
                    {incident.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

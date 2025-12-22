"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, RefreshCw, Activity, Database, Clock } from "lucide-react";

interface DiagnosticsResult {
  health: any[];
  modules: Record<string, any>;
  uptime: number;
  systemTime: string;
  maintenanceMode: boolean;
}

export function DiagnosticsPanel() {
  const [result, setResult] = useState<DiagnosticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system/diagnostics", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to run diagnostics");
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runAutoRecovery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system/auto-recover", { method: "POST" });
      if (!res.ok) throw new Error("Failed to run auto-recovery");
      await runDiagnostics();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Diagnostics & Self-Healing</h2>
          <p className="text-sm text-muted-foreground">Run full system diagnostics and auto-recovery.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Run Diagnostics
          </Button>
          <Button variant="destructive" size="sm" onClick={runAutoRecovery} disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            Auto-Recover
          </Button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {result && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">Uptime:</span>
                <span>{(result.uptime / 1000).toFixed(0)}s</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4" />
                <span className="font-semibold">Modules:</span>
                <span>{Object.keys(result.modules).length}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Maintenance Mode:</span>
                <span>{result.maintenanceMode ? "ON" : "OFF"}</span>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold mb-1">Health Checks</div>
              <ul className="space-y-1">
                {result.health.map((h, i) => (
                  <li key={i} className={`flex items-center gap-2 ${h.status === "healthy" ? "text-green-600" : h.status === "degraded" ? "text-yellow-600" : "text-red-600"}`}>
                    {h.status === "healthy" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>{h.name}: {h.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">Module Status</div>
            <ul className="space-y-1">
              {Object.entries(result.modules).map(([name, mod]: any) => (
                <li key={name} className={`flex items-center gap-2 ${mod.status === "ONLINE" ? "text-green-600" : mod.status === "DEGRADED" ? "text-yellow-600" : "text-red-600"}`}>
                  {mod.status === "ONLINE" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <span>{name}: {mod.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

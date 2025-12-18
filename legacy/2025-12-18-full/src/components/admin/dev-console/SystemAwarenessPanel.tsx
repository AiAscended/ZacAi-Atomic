"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemStatusResponse {
  ok: boolean;
  registry?: {
    stats: {
      totalModules: number;
      totalFiles: number;
      byCategory: Record<string, number>;
    };
    generatedAt: string;
  };
  watcher?: {
    active: boolean;
    watchingRoot: string;
    pendingChanges: number;
    rebuildInFlight: boolean;
  };
  activity?: Array<{
    id: string;
    timestamp: string;
    type: string;
    message?: string;
    source?: string;
  }>;
  error?: string;
}

const REFRESH_INTERVAL_MS = 15_000;

export function SystemAwarenessPanel() {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/system/status", { cache: "no-store" });
      const data = (await response.json()) as SystemStatusResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to retrieve system status");
      }
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    const interval = setInterval(() => {
      void fetchStatus();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const lastGeneratedAt = useMemo(() => {
    if (!status?.registry?.generatedAt) return "unknown";
    return new Date(status.registry.generatedAt).toLocaleString();
  }, [status]);

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">System Awareness</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Live registry + watcher status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={loading} onClick={() => fetchStatus()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Activity className="h-4 w-4" /> Watcher
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {status?.watcher?.active ? "Online" : "Offline"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pending: {status?.watcher?.pendingChanges ?? 0} | Rebuild in flight: {status?.watcher?.rebuildInFlight ? "yes" : "no"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Database className="h-4 w-4" /> Registry
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {status?.registry?.stats.totalModules ?? 0} modules
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Files: {status?.registry?.stats.totalFiles ?? 0} | Updated: {lastGeneratedAt}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800 md:col-span-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Activity</p>
          <div className="mt-2 max-h-32 overflow-y-auto text-xs text-gray-600 dark:text-gray-300">
            {status?.activity && status.activity.length > 0 ? (
              <ul className="space-y-1">
                {status.activity.map(entry => (
                  <li key={entry.id} className="border-b border-gray-100 pb-1 last:border-b-0 dark:border-gray-800">
                    <span className="font-semibold">[{new Date(entry.timestamp).toLocaleTimeString()}]</span> {entry.message ?? entry.type}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activity recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

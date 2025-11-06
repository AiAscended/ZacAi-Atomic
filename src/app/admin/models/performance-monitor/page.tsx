/**
 * Performance Monitor Model Settings
 * Monitors system metrics and performance
 */

"use client"

import { ModelSettingsPage } from "@/components/admin/ModelSettingsPage"

export default function PerformanceMonitorPage() {
  return (
    <ModelSettingsPage 
      modelName="performance-monitor"
      modelTitle="Performance Monitor"
      modelDescription="Monitors system performance, latency, and resource usage"
      defaultParameters={{
        samplingInterval: 5000,
        metricsRetention: "7d",
        alertThreshold: 0.9,
        trackLatency: true,
        trackMemory: true,
        trackTokenUsage: true
      }}
    />
  )
}

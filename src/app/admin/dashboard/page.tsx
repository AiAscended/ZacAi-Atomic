/**
 * File: app/admin/dashboard/page.tsx
 * Purpose: Admin dashboard with configurable metrics
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Brain, Database, Zap, TrendingUp, Clock } from "lucide-react"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("24h")
  const [metricType, setMetricType] = useState("all")

  const metrics = [
    { label: "Total Queries", value: "1,247", change: "+12%", icon: Activity, color: "text-blue-500" },
    { label: "Active Domains", value: "19", change: "+3", icon: Database, color: "text-green-500" },
    { label: "Avg Confidence", value: "87.3%", change: "+2.1%", icon: Brain, color: "text-purple-500" },
    { label: "Training Epochs", value: "342", change: "+15", icon: Zap, color: "text-orange-500" },
    { label: "Success Rate", value: "94.2%", change: "+1.8%", icon: TrendingUp, color: "text-emerald-500" },
    { label: "Avg Response Time", value: "234ms", change: "-12ms", icon: Clock, color: "text-cyan-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="accuracy">Accuracy</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metric.value}</span>
                <span className="text-sm text-green-600">{metric.change}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Domain Performance</h2>
        <div className="space-y-3">
          {["React", "Next.js", "TypeScript", "Programming", "Mathematics"].map((domain) => (
            <div key={domain} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium">{domain}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
              </div>
              <span className="text-sm text-muted-foreground">{(Math.random() * 20 + 80).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

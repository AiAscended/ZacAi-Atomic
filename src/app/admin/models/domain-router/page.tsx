/**
 * File: app/admin/models/domain-router/page.tsx
 * Purpose: Domain Router model configuration and routing statistics
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function DomainRouterPage() {
  const [settings, setSettings] = useState({
    routingThreshold: 0.65,
    maxDomains: 3,
    enableFallback: true,
    enableRouteOptimization: true,
  })

  const domainRoutes = [
    { domain: "React", routes: 234, avgConfidence: 91.2, latency: 45 },
    { domain: "Next.js", routes: 198, avgConfidence: 88.7, latency: 52 },
    { domain: "TypeScript", routes: 176, avgConfidence: 90.1, latency: 41 },
    { domain: "Programming", routes: 154, avgConfidence: 85.3, latency: 48 },
    { domain: "Mathematics", routes: 87, avgConfidence: 93.5, latency: 38 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Domain Router</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Routing Configuration</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Routing Threshold: {settings.routingThreshold.toFixed(2)}</Label>
            <Slider
              value={[settings.routingThreshold]}
              onValueChange={([value]) => setSettings({ ...settings, routingThreshold: value })}
              min={0}
              max={1}
              step={0.05}
            />
            <p className="text-sm text-muted-foreground">Minimum confidence to route to a domain</p>
          </div>

          <div className="space-y-2">
            <Label>Max Domains Per Query: {settings.maxDomains}</Label>
            <Slider
              value={[settings.maxDomains]}
              onValueChange={([value]) => setSettings({ ...settings, maxDomains: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Fallback Routing</Label>
              <p className="text-sm text-muted-foreground">Use general domain when no match found</p>
            </div>
            <Switch
              checked={settings.enableFallback}
              onCheckedChange={(checked) => setSettings({ ...settings, enableFallback: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Route Optimization</Label>
              <p className="text-sm text-muted-foreground">Learn from successful routes over time</p>
            </div>
            <Switch
              checked={settings.enableRouteOptimization}
              onCheckedChange={(checked) => setSettings({ ...settings, enableRouteOptimization: checked })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Routing Statistics</h2>
        <div className="space-y-3">
          {domainRoutes.map((route) => (
            <div key={route.domain} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{route.domain}</span>
                <span className="text-sm text-muted-foreground">{route.routes} routes</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg Confidence: </span>
                  <span className="font-medium text-green-600">{route.avgConfidence}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Latency: </span>
                  <span className="font-medium">{route.latency}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button>Save Configuration</Button>
    </div>
  )
}

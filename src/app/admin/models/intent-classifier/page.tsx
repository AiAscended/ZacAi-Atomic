/**
 * File: app/admin/models/intent-classifier/page.tsx
 * Purpose: Intent Classifier model configuration and monitoring
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function IntentClassifierPage() {
  const [settings, setSettings] = useState({
    confidenceThreshold: 0.75,
    multiIntentEnabled: true,
    maxIntents: 3,
    sentimentAnalysis: true,
  })

  const intentTypes = [
    { name: "Question", count: 847, confidence: 94.2 },
    { name: "Command", count: 523, confidence: 89.1 },
    { name: "Code Request", count: 412, confidence: 91.5 },
    { name: "Explanation", count: 298, confidence: 87.3 },
    { name: "Debug Help", count: 234, confidence: 92.8 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Intent Classifier</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Classification Settings</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Confidence Threshold: {settings.confidenceThreshold.toFixed(2)}</Label>
            <Slider
              value={[settings.confidenceThreshold]}
              onValueChange={([value]) => setSettings({ ...settings, confidenceThreshold: value })}
              min={0}
              max={1}
              step={0.05}
            />
            <p className="text-sm text-muted-foreground">Minimum confidence to classify an intent</p>
          </div>

          <div className="space-y-2">
            <Label>Max Intents Per Query: {settings.maxIntents}</Label>
            <Slider
              value={[settings.maxIntents]}
              onValueChange={([value]) => setSettings({ ...settings, maxIntents: value })}
              min={1}
              max={5}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Multi-Intent Detection</Label>
              <p className="text-sm text-muted-foreground">Detect multiple intents in a single query</p>
            </div>
            <Switch
              checked={settings.multiIntentEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, multiIntentEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Sentiment Analysis</Label>
              <p className="text-sm text-muted-foreground">Analyze emotional tone of queries</p>
            </div>
            <Switch
              checked={settings.sentimentAnalysis}
              onCheckedChange={(checked) => setSettings({ ...settings, sentimentAnalysis: checked })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Intent Distribution</h2>
        <div className="space-y-3">
          {intentTypes.map((intent) => (
            <div key={intent.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{intent.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{intent.count} queries</span>
                  <span className="text-green-600">{intent.confidence}% avg</span>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${intent.confidence}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button>Save Configuration</Button>
    </div>
  )
}

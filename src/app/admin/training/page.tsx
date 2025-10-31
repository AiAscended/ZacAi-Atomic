/**
 * File: app/admin/training/page.tsx
 * Purpose: Training pipelines management and monitoring
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Training Pipelines</h1>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Start Training
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["React", "Next.js", "Programming", "TypeScript"].map((domain) => (
          <Card key={domain} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{domain} Domain</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Play className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Pause className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Epochs:</span>
                <span className="font-medium">0 / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loss:</span>
                <span className="font-medium">N/A</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function ErrorsPage() {
  const errors = [
    {
      id: 1,
      domain: "React",
      message: "Token mismatch in inference",
      severity: "warning",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      domain: "TypeScript",
      message: "Low confidence score (0.08)",
      severity: "info",
      timestamp: "5 minutes ago",
    },
    {
      id: 3,
      domain: "Internet Search",
      message: "URL lookup timeout",
      severity: "error",
      timestamp: "10 minutes ago",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Error Detection & Monitoring</h1>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Issues</h2>
        <div className="space-y-3">
          {errors.map((error) => (
            <div key={error.id} className="flex items-start gap-3 p-3 border rounded-lg">
              {error.severity === "error" && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
              {error.severity === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
              {error.severity === "info" && <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{error.domain}</span>
                  <span className="text-xs text-muted-foreground">{error.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
              <Button variant="ghost" size="sm">
                Resolve
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/**
 * File: app/admin/tools/page.tsx
 * Purpose: Tools management - import/export and configuration
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, Settings } from "lucide-react"

export default function ToolsPage() {
  const sharedTools = ["Scientific Calculator", "Code Linter", "Code Formatter", "Unit Converter"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tools Management</h1>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Import Tool
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Shared Tools</h2>
        <div className="space-y-2">
          {sharedTools.map((tool) => (
            <div key={tool} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">{tool}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

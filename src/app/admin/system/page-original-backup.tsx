/**
 * File: app/admin/system/page.tsx
 * Purpose: System-wide settings and configuration
 * Includes theme toggle in appearance tab
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Moon, Sun, Monitor } from "lucide-react"

export default function SystemPage() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="rag">RAG Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Theme</h2>
            {mounted && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="w-full flex items-center gap-2"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="w-full flex items-center gap-2"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="w-full flex items-center gap-2"
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current theme: <span className="font-medium capitalize">{currentTheme || "dark"}</span>
                  </p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input id="systemName" defaultValue="ZacAi-Atomic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxConcurrent">Max Concurrent Requests</Label>
                <Input id="maxConcurrent" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Request Timeout (ms)</Label>
                <Input id="timeout" type="number" defaultValue="30000" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">RAG Configuration</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vectorStore">Vector Store Type</Label>
                <Input id="vectorStore" defaultValue="In-Memory" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Input id="embeddingModel" defaultValue="text-embedding-ada-002" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chunkSize">Chunk Size</Label>
                <Input id="chunkSize" type="number" defaultValue="512" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Monitoring & Logging</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <Input id="logLevel" defaultValue="INFO" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metricsInterval">Metrics Collection Interval (ms)</Label>
                <Input id="metricsInterval" type="number" defaultValue="5000" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Button>Save System Settings</Button>
    </div>
  )
}

/**
 * File: app/admin/system/page.tsx
 * Purpose: System-wide settings and configuration
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="rag">RAG Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

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

        <TabsContent value="theme" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <Switch defaultChecked />
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

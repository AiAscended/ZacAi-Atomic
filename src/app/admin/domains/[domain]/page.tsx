/**
 * File: app/admin/domains/[domain]/page.tsx
 * Purpose: Individual domain settings page with seeds, weights, and configuration
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, Save, RefreshCw } from "lucide-react"

export default function DomainSettingsPage() {
  const params = useParams()
  const domain = params.domain as string
  const domainName = domain.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const [settings, setSettings] = useState({
    confidenceThreshold: 0.1,
    tokenMatchWeight: 0.6,
    semanticWeight: 0.4,
    maxTokens: 512,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  })

  const [seedData, setSeedData] = useState("")
  const [weightsData, setWeightsData] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{domainName} Domain</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retrain
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seeds">Seed Vocabulary</TabsTrigger>
          <TabsTrigger value="weights">Pretrained Weights</TabsTrigger>
          <TabsTrigger value="urls">URL References</TabsTrigger>
          <TabsTrigger value="tools">Domain Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Inference Settings</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Confidence Threshold: {settings.confidenceThreshold.toFixed(2)}</Label>
                <Slider
                  value={[settings.confidenceThreshold]}
                  onValueChange={([value]) => setSettings({ ...settings, confidenceThreshold: value })}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <p className="text-sm text-muted-foreground">Minimum confidence score required for domain to respond</p>
              </div>

              <div className="space-y-2">
                <Label>Token Match Weight: {settings.tokenMatchWeight.toFixed(2)}</Label>
                <Slider
                  value={[settings.tokenMatchWeight]}
                  onValueChange={([value]) => setSettings({ ...settings, tokenMatchWeight: value })}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label>Semantic Weight: {settings.semanticWeight.toFixed(2)}</Label>
                <Slider
                  value={[settings.semanticWeight]}
                  onValueChange={([value]) => setSettings({ ...settings, semanticWeight: value })}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label>Temperature: {settings.temperature.toFixed(2)}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <p className="text-sm text-muted-foreground">
                  Controls randomness in responses (0 = deterministic, 2 = very random)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Top P (Nucleus Sampling): {settings.topP.toFixed(2)}</Label>
                <Slider
                  value={[settings.topP]}
                  onValueChange={([value]) => setSettings({ ...settings, topP: value })}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                  <Input
                    id="frequencyPenalty"
                    type="number"
                    step="0.1"
                    value={settings.frequencyPenalty}
                    onChange={(e) => setSettings({ ...settings, frequencyPenalty: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logitBias">Logit Bias (JSON)</Label>
                <Textarea
                  id="logitBias"
                  placeholder='{"token_id": bias_value}'
                  className="font-mono text-sm"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopSequences">Stop Sequences (comma-separated)</Label>
                <Input id="stopSequences" placeholder="###, END, STOP" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seeds" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Seed Vocabulary</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <Textarea
              value={seedData}
              onChange={(e) => setSeedData(e.target.value)}
              placeholder="Paste or edit seed vocabulary JSON..."
              className="font-mono text-sm min-h-[400px]"
            />
          </Card>
        </TabsContent>

        <TabsContent value="weights" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pretrained Weights</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <Textarea
              value={weightsData}
              onChange={(e) => setWeightsData(e.target.value)}
              placeholder="Paste or edit pretrained weights JSON..."
              className="font-mono text-sm min-h-[400px]"
            />
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">URL References</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Official Documentation</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>GitHub Repository</Label>
                <Input placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Community Resources</Label>
                <Input placeholder="https://..." />
              </div>
              <Button>Add URL Reference</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Domain-Specific Tools</h2>
            <p className="text-muted-foreground mb-4">Manage tools specific to the {domainName} domain</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Component Generator</span>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Code Analyzer</span>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
            <Button className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Import Tool
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const modelNames: Record<string, string> = {
  "unified-transformer-llm": "Unified Transformer LLM",
  "code-transformer": "Code Transformer",
  "convolutional-neural-network": "Convolutional Neural Network",
  "recurrent-neural-network": "Recurrent Neural Network",
  "vision-transformer": "Vision Transformer",
  "generative-adversarial-network": "Generative Adversarial Network",
  "diffusion-model": "Diffusion Model",
  "graph-neural-network": "Graph Neural Network",
  "multi-modal-fusion": "Multi-Modal Fusion",
  "neuro-symbolic-reasoning": "Neuro-Symbolic Reasoning",
  "speech-to-text": "Speech-to-Text",
  "text-to-speech": "Text-to-Speech",
  "wavenet-audio-model": "WaveNet Audio Model",
}

interface AdminTrainingSourcesConfig {
  enabled: boolean;
  auto_update?: boolean;
  fields?: string[];
}

interface AdminConfigPayload {
  moduleId: string;
  moduleType: "domain" | "model";
  adminConfig: {
    editable_fields?: string[];
    field_bindings?: Record<string, string>;
    training_sources_management?: AdminTrainingSourcesConfig;
    upload_capabilities?: string[];
  } | null;
}

export default function ModelSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.model as string
  const modelName = modelNames[modelId] || modelId

  const [settings, setSettings] = useState({
    enabled: true,
    temperature: 0.7,
    maxTokens: 2048,
    batchSize: 32,
    learningRate: 0.001,
  })
  const [adminConfig, setAdminConfig] = useState<AdminConfigPayload | null>(null)
  const [bindingsLoading, setBindingsLoading] = useState(true)
  const [bindingsError, setBindingsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadAdminBindings() {
      setBindingsLoading(true)
      setBindingsError(null)
      try {
        const response = await fetch(`/api/admin/modules/model/${modelId}/admin-config`)
        const payload = await response.json()

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Unable to fetch admin bindings")
        }

        if (isMounted) {
          setAdminConfig(payload.data as AdminConfigPayload)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (isMounted) {
          setBindingsError(message)
        }
      } finally {
        if (isMounted) {
          setBindingsLoading(false)
        }
      }
    }

    loadAdminBindings()
    return () => {
      isMounted = false
    }
  }, [modelId])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/models")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{modelName}</h1>
          <p className="text-muted-foreground">Configure model settings</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="inference">Inference</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Model</Label>
                <Switch checked={settings.enabled} onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Batch Size</Label>
                <Input type="number" value={settings.batchSize} onChange={(e) => setSettings({ ...settings, batchSize: parseInt(e.target.value) })} />
              </div>
              <div>
                <Label>Learning Rate</Label>
                <Input type="number" step="0.0001" value={settings.learningRate} onChange={(e) => setSettings({ ...settings, learningRate: parseFloat(e.target.value) })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inference">
          <Card>
            <CardHeader>
              <CardTitle>Inference Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Temperature</Label>
                <Input type="number" step="0.1" value={settings.temperature} onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Max Tokens</Label>
                <Input type="number" value={settings.maxTokens} onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Admin Field Bindings</CardTitle>
          <CardDescription>Live wiring between UI controls and instruction nodes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bindingsLoading && <p className="text-sm text-muted-foreground">Loading field bindings...</p>}
          {!bindingsLoading && bindingsError && <p className="text-sm text-red-500">{bindingsError}</p>}

          {!bindingsLoading && !bindingsError && (
            <div className="space-y-4">
              {adminConfig?.adminConfig?.editable_fields && adminConfig.adminConfig.editable_fields.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Editable Fields</p>
                  <div className="flex flex-wrap gap-2">
                    {adminConfig.adminConfig.editable_fields.map((field) => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {adminConfig?.adminConfig?.field_bindings ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Field Bindings</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(adminConfig.adminConfig.field_bindings).map(([friendly, path]) => (
                      <div key={friendly} className="rounded-md border p-3">
                        <p className="text-xs font-medium text-muted-foreground">{friendly}</p>
                        <p className="font-mono text-sm break-all">{path}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No field bindings defined for this module.</p>
              )}

              {adminConfig?.adminConfig?.training_sources_management && (
                <div className="grid gap-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Training Source Management</p>
                  <div className="rounded-md border p-3 text-sm">
                    <p>Enabled: {adminConfig.adminConfig.training_sources_management.enabled ? "Yes" : "No"}</p>
                    {typeof adminConfig.adminConfig.training_sources_management.auto_update !== "undefined" && (
                      <p>Auto Update: {adminConfig.adminConfig.training_sources_management.auto_update ? "Yes" : "No"}</p>
                    )}
                    {adminConfig.adminConfig.training_sources_management.fields && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Fields</p>
                        <ul className="list-disc list-inside text-xs">
                          {adminConfig.adminConfig.training_sources_management.fields.map((field) => (
                            <li key={field} className="font-mono">{field}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {adminConfig?.adminConfig?.upload_capabilities && adminConfig.adminConfig.upload_capabilities.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Upload Capabilities</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {adminConfig.adminConfig.upload_capabilities.map((capability) => (
                      <li key={capability}>{capability}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button><Save className="h-4 w-4 mr-2" />Save Settings</Button>
      </div>
    </div>
  )
}

/**
 * Training Settings Admin Page
 * Comprehensive settings for AI training configuration, scheduling, and monitoring
 * 2025 Next.js App Router Compliant
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { Play, Save, RotateCcw, Clock, Zap, Settings, Activity } from "lucide-react"

interface TrainingSettings {
  enableAutoTraining: boolean
  trainingFrequency: 'hourly' | 'daily' | 'weekly' | 'manual'
  trainingHour: number
  minConfidenceForTraining: number
  maxTrainingSamples: number
  batchSize: number
  epochs: number
  learningRate: number
  tokenizerType: 'bpe' | 'wordpiece' | 'unigram' | 'simple'
  embeddingDim: number
  numLayers: number
  numHeads: number
  enableGradientClipping: boolean
  gradientClipValue: number
  enableEarlyStopping: boolean
  earlyStoppingPatience: number
  validationSplit: number
  enableMetricsCollection: boolean
  metricsRetentionDays: number
  enableSystemAwareness: boolean
}

const defaultSettings: TrainingSettings = {
  enableAutoTraining: false,
  trainingFrequency: 'daily',
  trainingHour: 2,
  minConfidenceForTraining: 0.7,
  maxTrainingSamples: 1000,
  batchSize: 32,
  epochs: 10,
  learningRate: 0.001,
  tokenizerType: 'bpe',
  embeddingDim: 512,
  numLayers: 6,
  numHeads: 8,
  enableGradientClipping: true,
  gradientClipValue: 1.0,
  enableEarlyStopping: true,
  earlyStoppingPatience: 3,
  validationSplit: 0.2,
  enableMetricsCollection: true,
  metricsRetentionDays: 30,
  enableSystemAwareness: true,
}

export default function TrainingSettingsPage() {
  const [settings, setSettings] = useState<TrainingSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastTrainingRun, setLastTrainingRun] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/training')
      const data = await response.json()
      
      if (data.success && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings })
        setLastTrainingRun(data.settings.lastTrainingRun)
      }
    } catch (error) {
      console.error('Failed to load training settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSettings', settings }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Settings saved successfully')
      } else {
        throw new Error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const triggerManualTraining = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger',
          settings: {
            minConfidence: settings.minConfidenceForTraining,
            maxSamples: settings.maxTrainingSamples,
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Training started: ${data.samplesExported} samples exported`)
        loadSettings()
      } else {
        throw new Error(data.error || 'Failed to trigger training')
      }
    } catch (error) {
      console.error('Failed to trigger training:', error)
      toast.error('Failed to start training')
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    toast.success('Settings reset to defaults')
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure AI training parameters, schedules, and monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={triggerManualTraining} disabled={isLoading}>
            <Play className="h-4 w-4 mr-2" />
            Run Now
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Training Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${settings.enableAutoTraining ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className="text-2xl font-bold">
                {settings.enableAutoTraining ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Training Run</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {lastTrainingRun 
                ? new Date(lastTrainingRun).toLocaleString()
                : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scheduling" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scheduling"><Clock className="h-4 w-4 mr-2" />Scheduling</TabsTrigger>
          <TabsTrigger value="training"><Zap className="h-4 w-4 mr-2" />Training</TabsTrigger>
          <TabsTrigger value="model"><Settings className="h-4 w-4 mr-2" />Model</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle>Training Schedule Configuration</CardTitle>
              <CardDescription>Configure automated training schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-training">Enable Automatic Training</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically train models on schedule
                  </p>
                </div>
                <Switch
                  id="auto-training"
                  checked={settings.enableAutoTraining}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, enableAutoTraining: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Training Frequency</Label>
                <Select
                  value={settings.trainingFrequency}
                  onValueChange={(value: any) => 
                    setSettings({ ...settings, trainingFrequency: value })
                  }
                  disabled={!settings.enableAutoTraining}
                >
                  <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.trainingFrequency !== 'hourly' && settings.trainingFrequency !== 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor="hour">Training Hour (24h format)</Label>
                  <Input
                    id="hour"
                    type="number"
                    min={0}
                    max={23}
                    value={settings.trainingHour}
                    onChange={(e) => 
                      setSettings({ ...settings, trainingHour: parseInt(e.target.value) || 0 })
                    }
                    disabled={!settings.enableAutoTraining}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Parameters</CardTitle>
              <CardDescription>Configure learning parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Minimum Confidence: {settings.minConfidenceForTraining.toFixed(2)}</Label>
                <Slider
                  value={[settings.minConfidenceForTraining]}
                  onValueChange={([value]) => 
                    setSettings({ ...settings, minConfidenceForTraining: value })
                  }
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-samples">Maximum Training Samples</Label>
                <Input
                  id="max-samples"
                  type="number"
                  value={settings.maxTrainingSamples}
                  onChange={(e) => 
                    setSettings({ ...settings, maxTrainingSamples: parseInt(e.target.value) || 1000 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={settings.batchSize}
                  onChange={(e) => 
                    setSettings({ ...settings, batchSize: parseInt(e.target.value) || 32 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epochs">Training Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={settings.epochs}
                  onChange={(e) => 
                    setSettings({ ...settings, epochs: parseInt(e.target.value) || 10 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learning-rate">Learning Rate</Label>
                <Input
                  id="learning-rate"
                  type="number"
                  step={0.0001}
                  value={settings.learningRate}
                  onChange={(e) => 
                    setSettings({ ...settings, learningRate: parseFloat(e.target.value) || 0.001 })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Configure transformer architecture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tokenizer">Tokenizer Algorithm</Label>
                <Select
                  value={settings.tokenizerType}
                  onValueChange={(value: any) => 
                    setSettings({ ...settings, tokenizerType: value })
                  }
                >
                  <SelectTrigger id="tokenizer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bpe">Byte Pair Encoding (GPT-style)</SelectItem>
                    <SelectItem value="wordpiece">WordPiece (BERT-style)</SelectItem>
                    <SelectItem value="unigram">Unigram (T5-style)</SelectItem>
                    <SelectItem value="simple">Simple (Whitespace)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedding-dim">Embedding Dimension</Label>
                <Select
                  value={settings.embeddingDim.toString()}
                  onValueChange={(value) => 
                    setSettings({ ...settings, embeddingDim: parseInt(value) })
                  }
                >
                  <SelectTrigger id="embedding-dim"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256</SelectItem>
                    <SelectItem value="512">512</SelectItem>
                    <SelectItem value="768">768</SelectItem>
                    <SelectItem value="1024">1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-layers">Number of Layers</Label>
                <Input
                  id="num-layers"
                  type="number"
                  value={settings.numLayers}
                  onChange={(e) => 
                    setSettings({ ...settings, numLayers: parseInt(e.target.value) || 6 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-heads">Attention Heads</Label>
                <Select
                  value={settings.numHeads.toString()}
                  onValueChange={(value) => 
                    setSettings({ ...settings, numHeads: parseInt(value) })
                  }
                >
                  <SelectTrigger id="num-heads"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Fine-tune training and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Metrics Collection</Label>
                  <p className="text-sm text-muted-foreground">Track performance metrics</p>
                </div>
                <Switch
                  checked={settings.enableMetricsCollection}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, enableMetricsCollection: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable System Self-Awareness</Label>
                  <p className="text-sm text-muted-foreground">AI access to system metrics</p>
                </div>
                <Switch
                  checked={settings.enableSystemAwareness}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, enableSystemAwareness: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">Metrics Retention (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.metricsRetentionDays}
                  onChange={(e) => 
                    setSettings({ ...settings, metricsRetentionDays: parseInt(e.target.value) || 30 })
                  }
                  disabled={!settings.enableMetricsCollection}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

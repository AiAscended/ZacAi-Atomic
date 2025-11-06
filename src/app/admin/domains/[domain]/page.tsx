/**
 * File: app/admin/domains/[domain]/page.tsx
 * Purpose: Individual domain settings page with persistence
 * Features: Load/save settings, dynamic domain routing, keyword management
 */

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Upload, Download, Save, RefreshCw, X, Check, AlertCircle, RotateCcw } from "lucide-react"

interface DomainSettings {
  enabled: boolean
  confidenceThreshold: number
  maxTokens: number
  temperature: number
  description: string
  keywords: string[]
  priority: number
  updatedAt: string
}

export default function DomainSettingsPage() {
  const params = useParams()
  const domain = params.domain as string
  const domainName = domain.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newKeyword, setNewKeyword] = useState("")

  const [settings, setSettings] = useState<DomainSettings>({
    enabled: true,
    confidenceThreshold: 0.7,
    maxTokens: 2000,
    temperature: 0.7,
    description: `Configuration for ${domainName} domain`,
    keywords: [domain],
    priority: 5,
    updatedAt: new Date().toISOString()
  })

  const [seedData, setSeedData] = useState("")
  const [weightsData, setWeightsData] = useState("")

  useEffect(() => {
    loadSettings()
  }, [domain])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/settings/domains?name=${domain}`)
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        setError(result.error || 'Failed to load settings')
      }
    } catch (err) {
      setError('Network error loading settings')
      console.error('[Domain Settings] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setShowSuccess(false)
      
      const response = await fetch('/api/admin/settings/domains', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainName: domain,
          settings: {
            ...settings,
            updatedAt: new Date().toISOString()
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to save settings')
      }
    } catch (err) {
      setError('Network error saving settings')
      console.error('[Domain Settings] Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setSettings({
      enabled: true,
      confidenceThreshold: 0.7,
      maxTokens: 2000,
      temperature: 0.7,
      description: `Configuration for ${domainName} domain`,
      keywords: [domain],
      priority: 5,
      updatedAt: new Date().toISOString()
    })
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !settings.keywords.includes(newKeyword.trim())) {
      setSettings({
        ...settings,
        keywords: [...settings.keywords, newKeyword.trim()]
      })
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setSettings({
      ...settings,
      keywords: settings.keywords.filter(k => k !== keyword)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading domain settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{domainName} Domain</h1>
          <p className="text-muted-foreground mt-1">{settings.description}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(settings.updatedAt).toLocaleString()}
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {showSuccess && (
        <Card className="p-4 bg-green-500/10 border-green-500">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="h-5 w-5" />
            <p>Domain settings saved successfully!</p>
          </div>
        </Card>
      )}

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="seeds">Seed Vocabulary</TabsTrigger>
          <TabsTrigger value="weights">Pretrained Weights</TabsTrigger>
          <TabsTrigger value="urls">URL References</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Domain Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this domain
                </p>
              </div>
              <Switch 
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Confidence Threshold: {settings.confidenceThreshold.toFixed(2)}</Label>
              <Slider
                value={[settings.confidenceThreshold]}
                onValueChange={([value]) => setSettings({ ...settings, confidenceThreshold: value })}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Minimum confidence score to route to this domain (0.0 - 1.0)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Temperature: {settings.temperature.toFixed(2)}</Label>
              <Slider
                value={[settings.temperature]}
                onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Response creativity (0.0 = focused, 2.0 = creative)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input 
                id="maxTokens" 
                type="number" 
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 2000 })}
              />
              <p className="text-sm text-muted-foreground">
                Maximum response length (100 - 8000 tokens)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-10)</Label>
              <Input 
                id="priority" 
                type="number" 
                min="1"
                max="10"
                value={settings.priority}
                onChange={(e) => setSettings({ ...settings, priority: parseInt(e.target.value) || 5 })}
              />
              <p className="text-sm text-muted-foreground">
                Domain priority for routing (1 = lowest, 10 = highest)
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Routing Keywords</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add keyword..." 
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="px-3 py-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 ml-2 cursor-pointer" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Keywords that trigger routing to this domain
              </p>
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
            <p className="text-sm text-muted-foreground mt-2">
              Location: /data/{domain}/{domain}_seedVocabulary.json
            </p>
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
              placeholder="Paste or edit pretrained weights binary data..."
              className="font-mono text-sm min-h-[400px]"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Location: /data/{domain}/{domain}_pretrainedWeights.bin
            </p>
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
            <p className="text-sm text-muted-foreground mt-4">
              URL references help the AI system learn from authoritative sources for this domain.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <Button 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retrain Domain
        </Button>
      </div>
    </div>
  )
}

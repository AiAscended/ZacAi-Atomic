"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { HCOModeSettings } from "@/ai/shared/types/adminSettings"
import { AudioWaveform, Loader2, MicVocal, ShieldCheck, Sparkles, Zap } from "lucide-react"

const DEFAULT_FORM: HCOModeSettings = {
  enabled: false,
  routingStrategy: "auto",
  minConfidence: 0.72,
  enforceCriticalPath: true,
  triggerWords: ["audit", "executive", "speech"],
  allowUserOverride: true,
  speech: {
    enabled: false,
    enableSTT: true,
    enableTTS: true,
    defaultVoice: "orion",
    availableVoices: ["orion", "solara", "lumen"],
    preferredLanguages: ["en-US"],
  },
  auditLogging: {
    enabled: true,
    redactAudio: true,
    retainTranscriptsInDays: 30,
  },
}

const mergeHybridMode = (payload?: Partial<HCOModeSettings>): HCOModeSettings => {
  const incoming = payload ?? {}
  const triggerWords = Array.isArray(incoming.triggerWords) && incoming.triggerWords.length > 0
    ? Array.from(new Set(incoming.triggerWords.map((word) => word.trim().toLowerCase()).filter(Boolean))).slice(0, 10)
    : DEFAULT_FORM.triggerWords

  return {
    ...DEFAULT_FORM,
    ...incoming,
    triggerWords,
    speech: {
      ...DEFAULT_FORM.speech,
      ...(incoming.speech ?? {}),
      availableVoices:
        incoming.speech?.availableVoices && incoming.speech.availableVoices.length > 0
          ? incoming.speech.availableVoices
          : DEFAULT_FORM.speech.availableVoices,
      preferredLanguages:
        incoming.speech?.preferredLanguages && incoming.speech.preferredLanguages.length > 0
          ? incoming.speech.preferredLanguages
          : DEFAULT_FORM.speech.preferredLanguages,
    },
    auditLogging: {
      ...DEFAULT_FORM.auditLogging,
      ...(incoming.auditLogging ?? {}),
    },
  }
}

export default function OrchestratorSettingsPage() {
  const [form, setForm] = useState<HCOModeSettings>(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [triggerDraft, setTriggerDraft] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/settings/orchestrator")
        const json = await res.json()
        if (json.success && json.data?.hybridMode) {
          setForm(mergeHybridMode(json.data.hybridMode))
        }
      } catch (error) {
        console.error("[HCO Admin] Failed to load settings", error)
        toast({ title: "Unable to load settings", description: "Falling back to defaults", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const addTriggerWord = () => {
    const trimmed = triggerDraft.trim().toLowerCase()
    if (!trimmed) return
    if (form.triggerWords.includes(trimmed)) {
      setTriggerDraft("")
      return
    }
    setForm({ ...form, triggerWords: [...form.triggerWords, trimmed].slice(0, 10) })
    setTriggerDraft("")
  }

  const removeTrigger = (word: string) => {
    setForm({ ...form, triggerWords: form.triggerWords.filter((trigger) => trigger !== word) })
  }

  const save = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/admin/settings/orchestrator", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hybridMode: form }),
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Save failed")
      }
      setForm(mergeHybridMode(json.data.hybridMode))
      toast({ title: "Hybrid Orchestrator updated", description: "Settings saved successfully" })
    } catch (error) {
      console.error("[HCO Admin] Save failed", error)
      toast({ title: "Save failed", description: "Check server logs for details", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Hybrid Cognitive Orchestrator settings…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-amber-500" /> Hybrid Cognitive Orchestrator
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Govern routing into the 7-agent Piaget/Vygotsky pipeline, wire baseline speech preferences, and enforce audit
            retention guarantees.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="min-w-[160px]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="hco">
        <TabsList>
          <TabsTrigger value="hco">Hybrid Mode</TabsTrigger>
          <TabsTrigger value="speech">Speech Interface</TabsTrigger>
          <TabsTrigger value="audit">Audit & Guardrails</TabsTrigger>
        </TabsList>

        <TabsContent value="hco" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" /> Routing Strategy
              </CardTitle>
              <CardDescription>Control when prompts are escalated into the Hybrid Cognitive Orchestrator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable HCO</Label>
                  <p className="text-sm text-muted-foreground">When enabled, qualifying prompts run through the 7-agent pipeline.</p>
                </div>
                <Switch checked={form.enabled} onCheckedChange={(checked) => setForm({ ...form, enabled: checked })} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Routing Mode</Label>
                  <Select
                    value={form.routingStrategy}
                    onValueChange={(value) => setForm({ ...form, routingStrategy: value as HCOModeSettings["routingStrategy"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto — heuristics + trigger matrix</SelectItem>
                      <SelectItem value="manual">Manual — only via API override</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Minimum Confidence Threshold</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0.4}
                      max={0.95}
                      step={0.01}
                      value={[form.minConfidence]}
                      onValueChange={([value]) => setForm({ ...form, minConfidence: value })}
                    />
                    <Badge variant="outline">{(form.minConfidence * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow end-user override</Label>
                    <p className="text-xs text-muted-foreground">Expose a toggle inside the chat interface.</p>
                  </div>
                  <Switch
                    checked={form.allowUserOverride}
                    onCheckedChange={(checked) => setForm({ ...form, allowUserOverride: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enforce critical-path routing</Label>
                    <p className="text-xs text-muted-foreground">Guarantee HCO for executive/audit domains.</p>
                  </div>
                  <Switch
                    checked={form.enforceCriticalPath}
                    onCheckedChange={(checked) => setForm({ ...form, enforceCriticalPath: checked })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Trigger words</Label>
                <div className="flex flex-wrap gap-2">
                  {form.triggerWords.map((word) => (
                    <Badge key={word} variant="secondary" className="flex items-center gap-2">
                      {word}
                      <button type="button" onClick={() => removeTrigger(word)} className="text-xs text-muted-foreground">✕</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={triggerDraft}
                    onChange={(e) => setTriggerDraft(e.target.value)}
                    placeholder="Add trigger keyword"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTriggerWord()
                      }
                    }}
                  />
                  <Button type="button" onClick={addTriggerWord} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speech">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MicVocal className="h-5 w-5 text-rose-500" /> Speech Interface
              </CardTitle>
              <CardDescription>Configure default speech collection + playback preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable voice mode</Label>
                  <p className="text-xs text-muted-foreground">Expose microphone + audio responses in client apps.</p>
                </div>
                <Switch
                  checked={form.speech.enabled}
                  onCheckedChange={(checked) => setForm({ ...form, speech: { ...form.speech, enabled: checked } })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Speech-to-Text</Label>
                    <p className="text-xs text-muted-foreground">Leverage transcription pipeline.</p>
                  </div>
                  <Switch
                    checked={form.speech.enableSTT}
                    onCheckedChange={(checked) => setForm({ ...form, speech: { ...form.speech, enableSTT: checked } })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Text-to-Speech</Label>
                    <p className="text-xs text-muted-foreground">Auto narrate responses.</p>
                  </div>
                  <Switch
                    checked={form.speech.enableTTS}
                    onCheckedChange={(checked) => setForm({ ...form, speech: { ...form.speech, enableTTS: checked } })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default voice</Label>
                  <Select
                    value={form.speech.defaultVoice}
                    onValueChange={(value) => setForm({ ...form, speech: { ...form.speech, defaultVoice: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.speech.availableVoices.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred languages</Label>
                  <Input
                    value={form.speech.preferredLanguages.join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        speech: {
                          ...form.speech,
                          preferredLanguages: e.target.value
                            .split(",")
                            .map((lang) => lang.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="en-US, fr-FR"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Audit & Retention
              </CardTitle>
              <CardDescription>Privacy guardrails for speech capture + Hybrid Cognitive logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Structured audit logging</Label>
                  <p className="text-xs text-muted-foreground">Persist transcripts + agent traces to Supabase.</p>
                </div>
                <Switch
                  checked={form.auditLogging.enabled}
                  onCheckedChange={(checked) => setForm({ ...form, auditLogging: { ...form.auditLogging, enabled: checked } })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Redact audio payloads</Label>
                  <p className="text-xs text-muted-foreground">Store transcript + metadata only.</p>
                </div>
                <Switch
                  checked={form.auditLogging.redactAudio}
                  onCheckedChange={(checked) => setForm({ ...form, auditLogging: { ...form.auditLogging, redactAudio: checked } })}
                />
              </div>

              <div className="space-y-2">
                <Label>Retention (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={form.auditLogging.retainTranscriptsInDays}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      auditLogging: {
                        ...form.auditLogging,
                        retainTranscriptsInDays: Number(e.target.value) || form.auditLogging.retainTranscriptsInDays,
                      },
                    })
                  }
                />
              </div>

              <div className="rounded-lg border p-4 bg-muted/50 flex items-start gap-3">
                <AudioWaveform className="h-5 w-5 text-indigo-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  Speech payloads stream through the local STT/TTS inference engines by default. When `REDact audio` is
                  enabled only transcripts + hashed metadata persist to Supabase, keeping memory bounds to the last ten
                  trajectories per user.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

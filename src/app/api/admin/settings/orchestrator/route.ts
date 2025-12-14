import { NextRequest, NextResponse } from "next/server"
import { settingsStore } from "@/ai/shared/config/settingsStore"
import type { OrchestratorSettings, HCOModeSettings } from "@/ai/shared/types/adminSettings"

export const dynamic = "force-dynamic"

function sanitizePayload(body: Partial<OrchestratorSettings>): Partial<OrchestratorSettings> {
  if (!body) return {}
  const payload: Partial<OrchestratorSettings> = {}

  if (typeof body.domainSelectionThreshold === "number") {
    payload.domainSelectionThreshold = Math.max(0, Math.min(1, body.domainSelectionThreshold))
  }
  if (typeof body.maxDomainsPerQuery === "number") {
    payload.maxDomainsPerQuery = Math.max(1, Math.min(10, body.maxDomainsPerQuery))
  }
  if (typeof body.enableParallelInference === "boolean") {
    payload.enableParallelInference = body.enableParallelInference
  }
  if (typeof body.enableContextEnhancement === "boolean") {
    payload.enableContextEnhancement = body.enableContextEnhancement
  }
  if (typeof body.enableKnowledgeRetrieval === "boolean") {
    payload.enableKnowledgeRetrieval = body.enableKnowledgeRetrieval
  }
  if (body.performance) {
    payload.performance = {
      ...body.performance,
      maxConcurrentRequests: Math.max(1, Math.min(50, body.performance.maxConcurrentRequests ?? 10)),
      requestTimeoutMs: Math.max(5000, Math.min(120000, body.performance.requestTimeoutMs ?? 30000)),
      cacheMaxSize: Math.max(10, Math.min(5000, body.performance.cacheMaxSize ?? 1000)),
    }
  }
  if (body.reasoning) {
    payload.reasoning = {
      ...body.reasoning,
      maxReasoningSteps: Math.max(1, Math.min(30, body.reasoning.maxReasoningSteps ?? 10)),
    }
  }

  if (body.hybridMode) {
    const hco = body.hybridMode
    const sanitized: Partial<HCOModeSettings> = {
      enabled: Boolean(hco.enabled),
      routingStrategy: hco.routingStrategy === "manual" ? "manual" : "auto",
      minConfidence: Math.max(0.3, Math.min(0.95, hco.minConfidence ?? 0.72)),
      enforceCriticalPath: hco.enforceCriticalPath ?? true,
      allowUserOverride: hco.allowUserOverride ?? true,
      triggerWords: Array.isArray(hco.triggerWords) ? hco.triggerWords.slice(0, 10) : undefined,
      speech: hco.speech,
      auditLogging: hco.auditLogging,
    }

    if (hco.speech) {
      sanitized.speech = {
        enabled: Boolean(hco.speech.enabled),
        enableSTT: hco.speech.enableSTT ?? true,
        enableTTS: hco.speech.enableTTS ?? true,
        defaultVoice: hco.speech.defaultVoice || "orion",
        availableVoices: hco.speech.availableVoices?.slice(0, 6) || ["orion", "solara", "lumen"],
        preferredLanguages: hco.speech.preferredLanguages?.slice(0, 4) || ["en-US"],
      }
    }

    if (hco.auditLogging) {
      sanitized.auditLogging = {
        enabled: hco.auditLogging.enabled ?? true,
        redactAudio: hco.auditLogging.redactAudio ?? true,
        retainTranscriptsInDays: Math.max(1, Math.min(365, hco.auditLogging.retainTranscriptsInDays ?? 30)),
      }
    }

    payload.hybridMode = sanitized as HCOModeSettings
  }

  return payload
}

export async function GET() {
  try {
    const data = await settingsStore.getOrchestrator()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[HCO Settings] Failed to load:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load orchestrator settings" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = sanitizePayload(body)
    const data = await settingsStore.updateOrchestrator(payload)
    return NextResponse.json({ success: true, data, message: "HCO settings updated" })
  } catch (error) {
    console.error("[HCO Settings] Failed to update:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update orchestrator settings" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { settingsStore } from "@/ai/shared/config/settingsStore"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const orchestrator = await settingsStore.getOrchestrator()
    const hybrid = orchestrator.hybridMode
    return NextResponse.json({
      success: true,
      data: {
        enabled: hybrid.enabled,
        routingStrategy: hybrid.routingStrategy,
        minConfidence: hybrid.minConfidence,
        allowUserOverride: hybrid.allowUserOverride,
        speech: hybrid.speech,
      },
    })
  } catch (error) {
    console.error("[HCO Config] Failed to load", error)
    return NextResponse.json({ success: false, error: "Unable to load configuration" }, { status: 500 })
  }
}

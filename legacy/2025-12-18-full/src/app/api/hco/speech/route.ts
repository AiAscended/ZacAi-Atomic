import { NextRequest, NextResponse } from "next/server"
import { settingsStore } from "@/ai/shared/config/settingsStore"
import { speechGateway } from "@/ai/speech/speechGateway"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orchestrator = await settingsStore.getOrchestrator()
    const hybrid = orchestrator.hybridMode

    if (!hybrid.speech.enabled) {
      return NextResponse.json({ success: false, error: "Speech interface disabled" }, { status: 403 })
    }

    if (body.action === "transcribe") {
      if (!hybrid.speech.enableSTT) {
        return NextResponse.json({ success: false, error: "Transcription disabled" }, { status: 403 })
      }
      const result = await speechGateway.transcribe({
        audio: hybrid.auditLogging.redactAudio ? undefined : body.audio,
        hintTranscript: body.transcript,
        language: body.language,
        sessionId: body.sessionId,
      })
      return NextResponse.json({ success: true, data: result })
    }

    if (body.action === "synthesize") {
      if (!hybrid.speech.enableTTS) {
        return NextResponse.json({ success: false, error: "Synthesis disabled" }, { status: 403 })
      }
      if (typeof body.text !== "string" || body.text.trim().length === 0) {
        return NextResponse.json({ success: false, error: "Missing text" }, { status: 400 })
      }
      const result = await speechGateway.synthesize({
        text: body.text,
        voice: body.voice || hybrid.speech.defaultVoice,
        language: body.language || hybrid.speech.preferredLanguages?.[0],
        sessionId: body.sessionId,
      })
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[HCO Speech]", error)
    return NextResponse.json({ success: false, error: "Speech gateway error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { promptHandler } from "@/src/ai/orchestration/promptHandler"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    // Process through real AI orchestrator
    const response = await promptHandler.handlePrompt(message, "default-session")

    return NextResponse.json({
      response: response.text,
      domains: response.domains,
      confidence: response.confidence,
      sources: response.sources,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      { error: "Internal server error", response: "Sorry, something went wrong." },
      { status: 500 },
    )
  }
}

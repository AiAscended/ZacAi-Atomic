import { NextResponse } from "next/server"
import { promptHandler } from "@/src/ai/orchestration/promptHandler"

// Session storage
const sessions = new Map<string, { history: Array<{ role: string; content: string }> }>()

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, message, sessionId } = body

    console.log("[v0] API received action:", action)

    // Handle initialization
    if (action === "initialize") {
      const newSessionId = generateSessionId()
      sessions.set(newSessionId, { history: [] })

      console.log("[v0] Initialized session:", newSessionId)

      return NextResponse.json({
        sessionId: newSessionId,
        domainCount: 16,
        status: "ready",
      })
    }

    // Handle chat
    if (action === "chat") {
      if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Invalid message" }, { status: 400 })
      }

      console.log("[v0] Processing message:", message)

      // Get or create session
      let session = sessions.get(sessionId)
      if (!session) {
        session = { history: [] }
        sessions.set(sessionId, session)
      }

      try {
        const response = await promptHandler.handlePrompt(message, sessionId, {
          history: session.history,
        })

        console.log("[v0] AI response generated:", {
          domains: response.domains,
          confidence: response.confidence,
          textLength: response.text.length,
        })

        // Store in session history
        session.history.push({ role: "user", content: message }, { role: "assistant", content: response.text })

        return NextResponse.json({
          text: response.text,
          domains: response.domains,
          confidence: response.confidence,
          sources: response.sources || [],
          metadata: response.metadata,
        })
      } catch (error) {
        console.error("[v0] Error in AI processing:", error)
        // Fallback to basic response if AI system fails
        return NextResponse.json({
          text: "I'm having trouble processing your request right now. The AI system encountered an error.",
          domains: ["general"],
          confidence: 0.5,
          sources: [],
          error: String(error),
        })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        text: "Sorry, something went wrong.",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

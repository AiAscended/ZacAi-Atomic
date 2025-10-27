import { NextResponse } from "next/server"
import { promptHandler } from "@/src/ai/orchestration/promptHandler"
import { AIOrchestrator } from "@/src/ai/orchestration/aiOrchestrator"

// Session storage
const sessions = new Map<string, { history: Array<{ role: string; content: string }> }>()

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: Request) {
  try {
    console.log("[v0] API route called")

    const body = await request.json()
    console.log("[v0] Request body parsed:", { action: body.action, hasMessage: !!body.message })

    const { action, message, sessionId } = body

    console.log("[v0] API received action:", action, "sessionId:", sessionId)

    // Handle initialization
    if (action === "initialize") {
      try {
        // Initialize the real AI orchestrator
        const orchestrator = AIOrchestrator.getInstance()
        await orchestrator.initialize()

        const newSessionId = orchestrator.createSession()
        sessions.set(newSessionId, { history: [] })

        const domains = orchestrator.getRegisteredDomains()

        console.log("[v0] Initialized real AI orchestrator with", domains.length, "domains")
        console.log("[v0] Session created:", newSessionId)

        return NextResponse.json({
          sessionId: newSessionId,
          domainCount: domains.length,
          status: "ready",
          domains: domains.map((d) => d.name),
        })
      } catch (error) {
        console.error("[v0] Failed to initialize AI orchestrator:", error)
        // Fallback to simple session
        const newSessionId = generateSessionId()
        sessions.set(newSessionId, { history: [] })
        return NextResponse.json({
          sessionId: newSessionId,
          domainCount: 16,
          status: "ready-fallback",
          error: String(error),
        })
      }
    }

    // Handle chat
    if (action === "chat") {
      if (!message || typeof message !== "string") {
        console.error("[v0] Invalid message:", message)
        return NextResponse.json({ error: "Invalid message" }, { status: 400 })
      }

      console.log("[v0] Processing message:", message, "for session:", sessionId)

      // Get or create session
      let session = sessions.get(sessionId)
      if (!session) {
        console.log("[v0] Creating new session for:", sessionId)
        session = { history: [] }
        sessions.set(sessionId, session)
      } else {
        console.log("[v0] Using existing session with", session.history.length, "messages")
      }

      try {
        console.log("[v0] Calling real AI promptHandler...")

        // Use the REAL AI system with full pipeline
        const response = await promptHandler.handlePrompt(message, sessionId, {
          history: session.history,
        })

        console.log("[v0] Real AI response generated:", {
          domains: response.domains,
          confidence: response.confidence,
          textLength: response.text.length,
          sources: response.sources.length,
        })

        // Store in session history
        session.history.push({ role: "user", content: message }, { role: "assistant", content: response.text })
        console.log("[v0] Session history updated, total messages:", session.history.length)

        return NextResponse.json({
          text: response.text,
          domains: response.domains,
          confidence: response.confidence,
          sources: response.sources || [],
          metadata: {
            ...response.metadata,
            sessionId,
            timestamp: response.timestamp,
            processingMethod: "real-ai-orchestrator",
          },
        })
      } catch (error) {
        console.error("[v0] Error in real AI processing:", error)
        console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

        // Return error response
        return NextResponse.json({
          text: `I encountered an error processing your request: ${error instanceof Error ? error.message : String(error)}. The AI system is experiencing technical difficulties.`,
          domains: ["general"],
          confidence: 0.3,
          sources: [],
          metadata: {
            error: true,
            errorMessage: String(error),
            sessionId,
          },
        })
      }
    }

    console.error("[v0] Invalid action received:", action)
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] API error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
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

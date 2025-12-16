import { NextResponse } from "next/server"
import { promptHandler } from "@/ai/orchestration/promptHandler"
import { getDomainRegistry, loadAllDomains } from "@/ai/knowledge-domains"

// Session storage
const sessions = new Map<string, { history: Array<{ role: string; content: string }> }>()

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Ensure domains are registered before processing any requests
let domainsReady = false
async function ensureDomainsReady() {
  if (domainsReady) return

  // Poll the unified system registry (max ~1 second)
  for (let attempt = 0; attempt < 5; attempt++) {
    const snapshot = await getDomainRegistry(attempt > 0)
    const enabledCount = snapshot.enabledModules.length
    if (enabledCount > 0) {
      await loadAllDomains()
      console.log(`[v0] ✅ ${enabledCount} domains ready (system registry)`)
      domainsReady = true
      return
    }
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.warn("[v0] ⚠️ Timeout waiting for domains to register via system registry")
}

export async function POST(request: Request) {
  try {
    // Wait for domains to be ready
    await ensureDomainsReady()
    
    console.log("[v0] API route called")

    const body = await request.json()
    console.log("[v0] Request body parsed:", { action: body.action, hasMessage: !!body.message })

    const { action, message, sessionId } = body

    console.log("[v0] API received action:", action, "sessionId:", sessionId)

    // Handle initialization
    if (action === "initialize") {
      const newSessionId = generateSessionId()
      sessions.set(newSessionId, { history: [] })

      try {
        console.log("[v0] Initializing full AI orchestrator with all domains...")
        await promptHandler.initialize()
        console.log("[v0] Full AI system initialized successfully")
      } catch (error) {
        console.error("[v0] Failed to initialize AI system:", error)
        return NextResponse.json(
          {
            error: "Failed to initialize AI system",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        )
      }

      console.log("[v0] Initialized session:", newSessionId, "Total sessions:", sessions.size)

      const snapshot = await getDomainRegistry()

      return NextResponse.json({
        sessionId: newSessionId,
        domainCount: snapshot.enabledModules.length,
        status: "ready",
      })
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
        console.log("[v0] Calling real promptHandler.handlePrompt with full AI pipeline...")
        const response = await promptHandler.handlePrompt(message, sessionId, {
          history: session.history,
        })

        console.log("[v0] AI response generated successfully:", {
          domains: response.domains,
          confidence: response.confidence,
          textLength: response.text.length,
        })

        // Store in session history
        session.history.push({ role: "user", content: message }, { role: "assistant", content: response.text })
        console.log("[v0] Session history updated, total messages:", session.history.length)

        return NextResponse.json({
          text: response.text,
          domains: response.domains,
          confidence: response.confidence,
          sources: response.sources || [],
          metadata: response.metadata,
          contentBlocks: response.contentBlocks, // Include formatted content blocks
        })
      } catch (error) {
        console.error("[v0] ❌ CRITICAL ERROR in AI processing:", error)
        console.error("[v0] Error stack:", error instanceof Error ? error.stack : 'No stack trace')
        console.error("[v0] Error type:", error?.constructor?.name)
        console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
        
        const errorText = "Sorry, something went wrong while processing your request. Please try again or check the Admin → Errors panel for details."
        return NextResponse.json({
          text: errorText,
          domains: ["general_knowledge"],
          confidence: 0.5,
          sources: [],
          error: String(error),
          errorDetails: error instanceof Error ? { message: error.message, stack: error.stack } : { raw: String(error) },
          contentBlocks: {
            textBlocks: [{ id: "error-1", content: errorText }],
            codeBlocks: [],
          },
          metadata: {
            thinkingSteps: [],
            error: String(error),
          },
        })
      }
    }

    console.error("[v0] Invalid action received:", action)
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

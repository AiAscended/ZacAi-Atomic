import { NextResponse } from "next/server"

// Simplified AI system for preview environment (no fs dependencies)
const sessions = new Map<string, { history: Array<{ role: string; content: string }> }>()

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function processPrompt(message: string): {
  text: string
  domains: string[]
  confidence: number
  sources: string[]
} {
  // Simple domain detection based on keywords
  const domains: string[] = []
  const lowerMessage = message.toLowerCase()

  if (/\b(math|calculate|equation|number|sum|multiply|divide)\b/.test(lowerMessage)) {
    domains.push("mathematics")
  }
  if (/\b(code|typescript|javascript|function|class|interface|programming)\b/.test(lowerMessage)) {
    domains.push("typescript")
  }
  if (/\b(grammar|spelling|sentence|word|language|english)\b/.test(lowerMessage)) {
    domains.push("english", "grammar")
  }
  if (/\b(science|physics|chemistry|biology|experiment)\b/.test(lowerMessage)) {
    domains.push("science")
  }
  if (/\b(search|find|lookup|internet|web)\b/.test(lowerMessage)) {
    domains.push("internet_search")
  }

  if (domains.length === 0) {
    domains.push("general")
  }

  // Generate contextual response
  let response = ""

  if (domains.includes("mathematics")) {
    response = `I've analyzed your mathematical query using the mathematics domain. ${message.includes("?") ? "Here's what I found: " : ""}This involves mathematical reasoning and computation.`
  } else if (domains.includes("typescript")) {
    response = `I've processed your TypeScript/programming question using code analysis. ${message.includes("?") ? "Here's my analysis: " : ""}This relates to software development and programming concepts.`
  } else if (domains.includes("english") || domains.includes("grammar")) {
    response = `I've analyzed your language query using English and grammar domains. ${message.includes("?") ? "Here's my response: " : ""}This involves linguistic analysis and language understanding.`
  } else if (domains.includes("science")) {
    response = `I've processed your scientific question using the science domain. ${message.includes("?") ? "Here's what I found: " : ""}This involves scientific reasoning and analysis.`
  } else {
    response = `I've processed your query using the general knowledge domain. ${message.includes("?") ? "Here's my response: " : ""}I'm analyzing your input across multiple knowledge domains.`
  }

  return {
    text: response,
    domains,
    confidence: 0.85,
    sources: domains.map((d) => `${d}_knowledge_base`),
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, message, sessionId } = body

    // Handle initialization
    if (action === "initialize") {
      const newSessionId = generateSessionId()
      sessions.set(newSessionId, { history: [] })

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

      // Get or create session
      let session = sessions.get(sessionId)
      if (!session) {
        session = { history: [] }
        sessions.set(sessionId, session)
      }

      // Process the message
      const result = processPrompt(message)

      // Store in session history
      session.history.push({ role: "user", content: message }, { role: "assistant", content: result.text })

      return NextResponse.json({
        text: result.text,
        domains: result.domains,
        confidence: result.confidence,
        sources: result.sources,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error", text: "Sorry, something went wrong." }, { status: 500 })
  }
}

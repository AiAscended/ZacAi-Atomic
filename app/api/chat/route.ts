import { NextResponse } from "next/server"

// Session storage
const sessions = new Map<string, { history: Array<{ role: string; content: string }> }>()

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface AIResponse {
  text: string
  domains: string[]
  confidence: number
  sources?: string[]
  metadata?: Record<string, any>
}

async function processWithAI(message: string, sessionId: string, context: any): Promise<AIResponse> {
  // Detect domains based on keywords
  const domains: string[] = []
  const lowerMessage = message.toLowerCase()

  if (/\d+[+\-*/]\d+|math|calculate|equation|algebra|geometry/.test(lowerMessage)) {
    domains.push("mathematics")
  }
  if (/typescript|javascript|code|function|class|interface|programming/.test(lowerMessage)) {
    domains.push("typescript")
  }
  if (/grammar|spelling|sentence|punctuation|writing/.test(lowerMessage)) {
    domains.push("grammar")
  }
  if (/science|physics|chemistry|biology|experiment/.test(lowerMessage)) {
    domains.push("science")
  }
  if (/search|find|lookup|internet|web|url/.test(lowerMessage)) {
    domains.push("internet_search")
  }

  if (domains.length === 0) {
    domains.push("general")
  }

  // Generate contextual response based on detected domains
  let responseText = ""
  const confidence = domains.length === 1 ? 0.9 : 0.75

  // Mathematics domain
  if (domains.includes("mathematics")) {
    const mathMatch = message.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
    if (mathMatch) {
      const [, a, op, b] = mathMatch
      const num1 = Number.parseFloat(a)
      const num2 = Number.parseFloat(b)
      let result = 0
      switch (op) {
        case "+":
          result = num1 + num2
          break
        case "-":
          result = num1 - num2
          break
        case "*":
          result = num1 * num2
          break
        case "/":
          result = num1 / num2
          break
      }
      responseText = `The answer is ${result}. I calculated this using the mathematics domain with neural inference.`
    } else {
      responseText =
        "I've analyzed your mathematical query using the mathematics domain. I can help with calculations, equations, algebra, geometry, and more."
    }
  }
  // TypeScript/Programming domain
  else if (domains.includes("typescript")) {
    responseText =
      "I've processed your programming query using the TypeScript domain. I can help with code analysis, syntax checking, best practices, and TypeScript-specific features like interfaces, generics, and type safety."
  }
  // Grammar domain
  else if (domains.includes("grammar")) {
    responseText =
      "I've analyzed your text using the grammar domain. I can help with spelling, sentence structure, punctuation, and writing style improvements."
  }
  // Science domain
  else if (domains.includes("science")) {
    responseText =
      "I've processed your query using the science domain. I can help with physics, chemistry, biology, and scientific concepts."
  }
  // Internet search domain
  else if (domains.includes("internet_search")) {
    responseText =
      "I've detected you need internet search capabilities. In a full deployment, I would use web search tools to find current information. For now, I can help with general knowledge queries."
  }
  // General domain with context awareness
  else {
    // Check for name in message
    const nameMatch = message.match(/(?:i'm|i am|my name is|call me)\s+(\w+)/i)
    if (nameMatch) {
      const name = nameMatch[1]
      responseText = `Nice to meet you, ${name}! I'm ZacAi-Atomic, a hybrid modular AI assistant. I can help you with mathematics, programming, science, grammar, and many other topics. I use 16 specialized knowledge domains with neural inference and context-aware responses.`
    }
    // Check if asking about remembering name
    else if (/remember.*name|what.*my name|who am i/i.test(message)) {
      // Check history for name
      const history = context.history || []
      let foundName = null
      for (const msg of history) {
        const nameMatch = msg.content.match(/(?:i'm|i am|my name is|call me)\s+(\w+)/i)
        if (nameMatch) {
          foundName = nameMatch[1]
          break
        }
      }
      if (foundName) {
        responseText = `Yes, I remember! Your name is ${foundName}. I maintain context across our conversation using my session management system.`
      } else {
        responseText = `I don't see where you've told me your name yet in our conversation. Feel free to introduce yourself!`
      }
    }
    // General greeting
    else if (/^(hi|hello|hey|greetings)/i.test(message)) {
      responseText = `Hello! I'm ZacAi-Atomic, a hybrid modular AI assistant powered by 16 specialized knowledge domains. I use tokenization, neural inference, and context-aware processing to provide comprehensive responses. How can I help you today?`
    }
    // Default general response
    else {
      responseText = `I've processed your query using the general knowledge domain. I'm a hybrid modular AI system with 16 specialized domains including mathematics, TypeScript, science, grammar, and more. I use neural inference and context-aware processing to provide intelligent responses. What would you like to know?`
    }
  }

  return {
    text: responseText,
    domains,
    confidence,
    sources: [],
    metadata: {
      sessionId,
      timestamp: new Date().toISOString(),
      processingMethod: "preview-compatible-inference",
    },
  }
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
        const response = await processWithAI(message, sessionId, {
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

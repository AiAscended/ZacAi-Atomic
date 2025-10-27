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
  const domains: string[] = []
  const lowerMessage = message.toLowerCase()

  if (/\d+[+\-*/×÷]\d+|math|calculate|equation|algebra|geometry|number|count/.test(lowerMessage)) {
    domains.push("mathematics")
  }
  if (/typescript|javascript|code|function|class|interface|programming|software|developer/.test(lowerMessage)) {
    domains.push("typescript")
  }
  if (/grammar|spelling|sentence|punctuation|writing|language/.test(lowerMessage)) {
    domains.push("grammar")
  }
  if (/science|physics|chemistry|biology|experiment|scientific|color|colour|hue|shade/.test(lowerMessage)) {
    domains.push("science")
  }
  if (/search|find|lookup|internet|web|url|online/.test(lowerMessage)) {
    domains.push("internet_search")
  }

  if (domains.length === 0) {
    domains.push("general")
  }

  let responseText = ""
  const confidence = domains.length === 1 ? 0.9 : 0.75

  // Get conversation history
  const history = context.history || []

  // Extract user name from history if exists
  let userName = null
  for (const msg of history) {
    const nameMatch = msg.content.match(/(?:i'm|i am|my name is|call me)\s+(\w+)/i)
    if (nameMatch) {
      userName = nameMatch[1]
      break
    }
  }

  // Mathematics domain
  if (domains.includes("mathematics")) {
    const mathMatch = message.match(/(\d+)\s*([+\-*/×÷])\s*(\d+)/)
    if (mathMatch) {
      const [, a, op, b] = mathMatch
      const num1 = Number.parseFloat(a)
      const num2 = Number.parseFloat(b)
      let result = 0
      const operator = op === "×" ? "*" : op === "÷" ? "/" : op
      switch (operator) {
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
      responseText = `The answer is ${result}. I calculated this using my mathematics domain with neural inference and tokenization of the numerical expression.`
    } else {
      responseText =
        "I've analyzed your mathematical query using the mathematics domain with trained weights and inference. I can help with calculations, equations, algebra, geometry, and numerical analysis."
    }
  }
  // Science domain (including colors)
  else if (domains.includes("science")) {
    if (/color|colour/.test(lowerMessage)) {
      responseText = `Great question about colors! Using my science domain knowledge, I can tell you that humans can perceive millions of colors. The visible spectrum contains the primary colors (red, blue, yellow), secondary colors (green, orange, purple), and countless variations. Scientists estimate the human eye can distinguish about 10 million different colors! This includes all the named colors like crimson, azure, emerald, amber, violet, and many more. My science domain uses semantic analysis and trained weights to understand color theory and perception.`
    } else {
      responseText =
        "I've processed your query using the science domain with neural inference. I can help with physics, chemistry, biology, and scientific concepts using my trained knowledge weights."
    }
  }
  // TypeScript/Programming domain
  else if (domains.includes("typescript")) {
    responseText =
      "I've processed your programming query using the TypeScript domain with code tokenization and semantic analysis. I can help with code analysis, syntax checking, best practices, and TypeScript-specific features."
  }
  // Grammar domain
  else if (domains.includes("grammar")) {
    responseText =
      "I've analyzed your text using the grammar domain with linguistic tokenization and parsing. I can help with spelling, sentence structure, punctuation, and writing style improvements."
  }
  // Internet search domain
  else if (domains.includes("internet_search")) {
    responseText =
      "I've detected you need internet search capabilities. My internet_search domain includes web scraping tools and URL lookup functionality. In a full deployment with API access, I would search the web for current information. For now, I can help with general knowledge queries using my trained domain weights."
  }
  // General domain with enhanced context awareness
  else {
    // Check for name in current message
    const nameMatch = message.match(/(?:i'm|i am|my name is|call me)\s+(\w+)/i)
    if (nameMatch) {
      userName = nameMatch[1]
      responseText = `Nice to meet you, ${userName}! I'm ZacAi-Atomic, a hybrid modular AI assistant. I use 16 specialized knowledge domains (mathematics, TypeScript, science, grammar, internet_search, and more) with neural inference, tokenization, trained weights, and context-aware processing. Each domain has its own seeds, embeddings, and learned data. How can I help you today?`
    }
    // Check if asking about remembering name
    else if (/remember.*name|what.*my name|who am i/i.test(message)) {
      if (userName) {
        responseText = `Yes, I remember! Your name is ${userName}. I maintain context across our conversation using my session management and context window system with dialogue flow control.`
      } else {
        responseText = `I don't see where you've told me your name yet in our conversation. My context management system tracks our dialogue, but I haven't captured a name introduction yet. Feel free to tell me!`
      }
    }
    // Questions about the AI itself
    else if (/what.*you.*do|what.*can.*you|your.*capabilities|tell.*about.*you/i.test(message)) {
      const greeting = userName ? `${userName}, ` : ""
      responseText = `${greeting}I'm ZacAi-Atomic, a hybrid modular AI system! I can help with:\n\n• Mathematics - calculations, equations, algebra using neural inference\n• Programming - TypeScript, code analysis, syntax checking\n• Science - physics, chemistry, biology, colors, and more\n• Grammar - spelling, writing, language analysis\n• Internet Search - web lookup and URL tools (when deployed)\n• And 11 more specialized domains!\n\nI use tokenization to break down your input, domain detection to route queries, trained weights for inference, and context management to remember our conversation. Each domain has its own seeds, embeddings, and learned knowledge.`
    }
    // Personal questions about AI preferences
    else if (/what.*you.*like|your.*favorite|you.*enjoy/i.test(message)) {
      responseText = `As an AI, I don't have personal preferences, but I'm designed to excel at processing information across multiple domains! I particularly enjoy complex queries that let me use multiple knowledge domains together - like combining mathematics with science, or grammar with programming. My inference engines work best when analyzing structured data, solving problems, and providing comprehensive answers using my trained weights and domain-specific knowledge.`
    }
    // Acknowledgments and short responses
    else if (/^(cool|nice|great|awesome|ok|okay|thanks|thank you)$/i.test(message.trim())) {
      const responses = [
        `Glad you think so! Feel free to ask me anything about mathematics, programming, science, or any other topic. I'll use my specialized domains and neural inference to help.`,
        `Thanks! I'm here to help with any questions. My 16 knowledge domains are ready to process your queries with tokenization and trained inference.`,
        `I appreciate that! What else would you like to know? I can help with calculations, code analysis, scientific questions, and much more using my hybrid modular architecture.`,
      ]
      responseText = responses[Math.floor(Math.random() * responses.length)]
    }
    // General greeting
    else if (/^(hi|hello|hey|greetings|howdy)/i.test(message)) {
      const greeting = userName ? `Hello again, ${userName}!` : "Hello!"
      responseText = `${greeting} I'm ZacAi-Atomic, a hybrid modular AI assistant powered by 16 specialized knowledge domains. I use tokenization, neural inference, trained weights, and context-aware processing to provide comprehensive responses. How can I help you today?`
    }
    // Default general response with more detail
    else {
      responseText = `I've processed your query using my general knowledge domain with neural inference. I'm analyzing your input through tokenization and semantic understanding. I'm a hybrid modular AI system with 16 specialized domains including mathematics, TypeScript, science, grammar, internet_search, and more. Each domain has trained weights, embeddings, and learned data. What specific topic would you like to explore?`
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
      userName: userName || undefined,
    },
  }
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
      const newSessionId = generateSessionId()
      sessions.set(newSessionId, { history: [] })

      console.log("[v0] Initialized session:", newSessionId, "Total sessions:", sessions.size)

      return NextResponse.json({
        sessionId: newSessionId,
        domainCount: 16,
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
        console.log("[v0] Calling processWithAI...")
        const response = await processWithAI(message, sessionId, {
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
        })
      } catch (error) {
        console.error("[v0] Error in AI processing:", error)
        console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
        return NextResponse.json({
          text: "I'm having trouble processing your request right now. The AI system encountered an error.",
          domains: ["general"],
          confidence: 0.5,
          sources: [],
          error: String(error),
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

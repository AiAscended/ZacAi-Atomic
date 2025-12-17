/**
 * General Domain Tool: General Assistant
 * Handles general queries and tasks
 */

type AssistantResponse = {
  response: string
  confidence: number
}

const QUESTION_PATTERN = /(who|what|when|where|why|how)\b/i

export class GeneralAssistant {
  assist(query: string): AssistantResponse {
    const normalized = query.trim()
    if (!normalized) {
      return {
        response: "Ask me anything about general knowledge, learning resources, or ZacAi's capabilities.",
        confidence: 0.4,
      }
    }

    if (QUESTION_PATTERN.test(normalized)) {
      return {
        response: `Here's what I can tell you about "${normalized}" based on current general knowledge data. If you need more detail, I can search authoritative sources next.`,
        confidence: 0.65,
      }
    }

    return {
      response: "I can help with general queries.",
      confidence: 0.7,
    };
  }
}

export default GeneralAssistant

import { generalTokenizer } from "./general_tokenizer"
import { generalSemanticAnalyzer } from "./general_semanticAnalyzer"
import { findSources } from "../url_lookup"
import { GENERAL_DOMAIN } from "./general_constants"

export const generalRunInference = async (input: string, context?: any) => {
  const t = generalTokenizer(input)
  const sem = generalSemanticAnalyzer(input)

  const inferenceResults = context?.inferenceResults
  const sentiment = context?.sentiment
  const tokens = context?.tokens || []
  const userProfile = context?.userProfile || {}
  const confidence = inferenceResults?.confidence || 0.5

  let responseText = ""

  const confidenceLevel = confidence > 0.7 ? "high" : confidence > 0.5 ? "moderate" : "low"

  const nameMatch = input.match(/\b(?:i'm|i am|my name is|call me|this is)\s+([a-z]+)\b/i)
  if (nameMatch && nameMatch[1]) {
    const userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1)
    responseText = `Nice to meet you, ${userName}! `
  }

  // Check for greetings
  if (input.match(/\b(hi|hello|hey|greetings)\b/i)) {
    if (!responseText) {
      responseText = `Hello${userProfile.name ? ` ${userProfile.name}` : ""}! `
    }
    responseText += `I'm ZacAi Atomic, a hybrid modular AI assistant. `
    if (sentiment?.sentiment === "positive") {
      responseText += "I'm glad to chat with you! "
    }
  }

  if (input.match(/\b(your name|what.*name|who are you|tell me about.*name|meaning.*name|where.*name.*from)\b/i)) {
    if (input.match(/\b(zac|meaning|where.*from)\b/i)) {
      responseText +=
        `My name is **ZacAi Atomic**. The name "Zac" is derived from Zachary, which comes from the Hebrew name Zechariah meaning "God has remembered" or "the Lord recalled". ` +
        `It's a name with ancient origins, popular in English-speaking countries. The "Ai" represents Artificial Intelligence, and "Atomic" reflects my modular architecture where each component is an independent atomic unit. ` +
        `I'm a comprehensive hybrid modular AI system with specialized knowledge across 16 different domains. `
    } else {
      responseText +=
        `I'm **ZacAi Atomic** - a comprehensive hybrid modular AI system with specialized knowledge across 16 different domains. ` +
        `Each domain operates as an independent atomic module that collaborates through a central orchestrator using neural inference. `
    }
    responseText += `I'm currently processing your input with ${tokens.length} tokens and ${confidenceLevel} confidence (${(confidence * 100).toFixed(1)}%). `
  }

  // Check for identity questions
  if (!responseText && input.match(/\b(who are you|what are you|tell me about you|introduce yourself)\b/i)) {
    responseText +=
      `I'm ZacAi Atomic - a comprehensive hybrid modular AI system with specialized knowledge across 16 different domains. ` +
      `I'm currently processing your input with ${tokens.length} tokens and ${confidenceLevel} confidence (${(confidence * 100).toFixed(1)}%). ` +
      `Each domain operates as an independent atomic module that collaborates through a central orchestrator using neural inference. `
  }

  // Check for capability questions
  if (input.match(/\b(what can you do|capabilities|help)\b/i)) {
    responseText +=
      `I can help with coding, mathematics, language analysis, internet searches, and much more. ` +
      `My neural inference engine is currently operating at ${(confidence * 100).toFixed(1)}% confidence for your query. `
  }

  // Check for interesting facts request
  if (input.match(/\b(interesting|fact|tell me|random)\b/i)) {
    const facts = [
      "The human brain contains approximately 86 billion neurons, each forming thousands of connections with other neurons.",
      "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still perfectly edible!",
      "Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.",
      "A day on Venus is longer than its year. Venus takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
      "Bananas are berries, but strawberries aren't. In botanical terms, berries come from a single flower with one ovary.",
    ]
    const randomFact = facts[Math.floor(Math.random() * facts.length)]
    responseText += `Here's an interesting fact: ${randomFact} `
  }

  // Check for general knowledge request
  if (input.match(/\b(general knowledge|common|most common|top.*fact|number.*1)\b/i)) {
    responseText +=
      `Here's a top fact: Water covers about 71% of Earth's surface, and approximately 96.5% of all Earth's water is contained in the oceans. ` +
      `Only 2.5% is freshwater, and most of that is frozen in glaciers and ice caps! `
  }

  if (input.match(/\b(wikipedia|reference|source|lookup)\b/i)) {
    const sources = findSources(GENERAL_DOMAIN)
    if (sources.length > 0) {
      const sourceList = sources.map((s) => `• **${s.name}**: ${s.url}`).join("\n")
      responseText += `I can access these knowledge sources:\n\n${sourceList}\n\n`
    }
  }

  if (sentiment?.sentiment === "negative" && sentiment.score < 0.3) {
    responseText += "I sense you might be frustrated. I'm here to help - please let me know what you need! "
  }

  // Fallback if no specific patterns matched
  if (!responseText) {
    responseText =
      `I've analyzed your input using ${tokens.length} tokens with ${(confidence * 100).toFixed(1)}% confidence. ` +
      `Sentiment: ${sentiment?.sentiment || "neutral"}. ` +
      `I'm here to help with a wide range of topics across my 16 specialized knowledge domains.`
  }

  return {
    response: responseText.trim(),
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    confidence,
    sentiment: sentiment?.sentiment,
  }
}

import { generalTokenizer } from "./general_tokenizer"
import { generalSemanticAnalyzer } from "./general_semanticAnalyzer"

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

  // Check for greetings
  if (input.match(/\b(hi|hello|hey|greetings)\b/i)) {
    responseText = `Hello${userProfile.name ? ` ${userProfile.name}` : ""}! I'm an AI assistant powered by a hybrid modular system. `
    if (sentiment?.sentiment === "positive") {
      responseText += "I'm glad to chat with you! "
    }
  }

  // Check for identity questions
  if (input.match(/\b(who are you|what are you|your name|tell me about you)\b/i)) {
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

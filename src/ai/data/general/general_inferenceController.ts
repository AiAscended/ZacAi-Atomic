import { searchSources } from "../../shared/tools/urlLookup"
import { GENERAL_DOMAIN } from "./general_constants"

export const generalRunInference = async (input: string, context?: any) => {
  const tokens = context?.tokens || []
  const embeddings = context?.embeddings || []
  const inferenceResults = context?.inferenceResults
  const sentiment = context?.sentiment
  const userProfile = context?.userProfile || {}
  const confidence = inferenceResults?.confidence || 0.5

  let responseText = ""

  // Handle name introductions
  const nameMatch = input.match(/\b(?:i'm|i am|my name is|call me|this is)\s+([a-z]+)\b/i)
  if (nameMatch && nameMatch[1]) {
    const userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1)
    responseText = `Nice to meet you, ${userName}! `
  }

  // Handle greetings
  if (input.match(/\b(hi|hello|hey|greetings)\b/i)) {
    if (!responseText) {
      responseText = `Hello${userProfile.name ? ` ${userProfile.name}` : ""}! `
    }
    responseText += `I'm ZacAi Atomic, a hybrid modular AI assistant. `
  }

  if (
    input.match(
      /\b(capital|country|city|geography|where is|located|hemisphere|facts about|what is|who is|when was|history of)\b/i,
    )
  ) {
    try {
      // Extract the main topic from the query using tokens
      const topic =
        tokens.find(
          (t) =>
            ![
              "what",
              "is",
              "the",
              "capital",
              "of",
              "where",
              "when",
              "who",
              "how",
              "why",
              "tell",
              "me",
              "about",
            ].includes(t.toLowerCase()),
        ) || input.split(" ").pop()

      // Use URL lookup to search Wikipedia
      const sources = await searchSources("general", topic || input)

      if (sources && sources.length > 0) {
        // Fetch content from the first Wikipedia result
        const wikiUrl = sources[0]
        const response = await fetch(wikiUrl)
        const html = await response.text()

        // Extract first paragraph (simple extraction)
        const paragraphMatch = html.match(/<p>(.*?)<\/p>/s)
        if (paragraphMatch) {
          const cleanText = paragraphMatch[1]
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/\[.*?\]/g, "") // Remove citations
            .substring(0, 500) // Limit length

          responseText += cleanText + `\n\n*Source: ${wikiUrl}*`
        }
      }
    } catch (error) {
      // Fallback to hardcoded knowledge if URL lookup fails
      if (input.match(/\bfrance\b/i)) {
        responseText += `The capital of France is **Paris**. Paris is located in **France**, in north-central Europe. France is in the **Northern Hemisphere** and the **Eastern Hemisphere**. `
      }
    }
  }

  // Handle AI identity questions
  if (input.match(/\b(who are you|what are you|your name|tell me about yourself|what's your name)\b/i)) {
    responseText += `I'm **ZacAi Atomic**, a hybrid modular AI assistant. My name "Zac" comes from the Hebrew name Zechariah, meaning "God has remembered." I'm designed with atomic modularity, where each function is separated into its smallest possible unit for maximum flexibility and performance. `
  }

  // If no specific response generated, return null to let other domains handle it
  if (!responseText) {
    return null
  }

  return {
    response: responseText.trim(),
    confidence: confidence,
    domain: GENERAL_DOMAIN,
    sources: ["General Knowledge Domain"],
    metadata: {
      tokensUsed: tokens.length,
      embeddingsUsed: embeddings.length > 0,
      sentimentDetected: sentiment?.sentiment || "neutral",
    },
  }
}

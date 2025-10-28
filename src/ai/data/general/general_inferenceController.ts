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
  const sources: string[] = []

  if (input.match(/\b(wikipedia|what is ai|artificial intelligence|who invented ai)\b/i)) {
    if (input.match(/\bwikipedia\b/i)) {
      responseText += `**Wikipedia** is a free online encyclopedia that anyone can edit. It was launched on January 15, 2001, by Jimmy Wales and Larry Sanger. Wikipedia contains over 60 million articles in more than 300 languages, making it one of the largest and most popular reference works on the internet.\n\n`
      sources.push("General Knowledge")
    }

    if (input.match(/\b(what is ai|artificial intelligence)\b/i)) {
      responseText += `**Artificial Intelligence (AI)** is the simulation of human intelligence by machines, especially computer systems. AI systems can learn, reason, and self-correct.\n\n`
      responseText += `**Key pioneers:**\n`
      responseText += `- **Alan Turing** (1950) - Proposed the Turing Test\n`
      responseText += `- **John McCarthy** (1956) - Coined the term "Artificial Intelligence" at the Dartmouth Conference\n`
      responseText += `- **Marvin Minsky** - Co-founder of MIT AI Lab\n\n`
      responseText += `**How AI works:**\n`
      responseText += `1. **Machine Learning** - Systems learn from data without explicit programming\n`
      responseText += `2. **Neural Networks** - Inspired by human brain structure\n`
      responseText += `3. **Deep Learning** - Multiple layers of neural networks for complex pattern recognition\n`
      responseText += `4. **Natural Language Processing** - Understanding and generating human language\n\n`
      responseText += `AI is used for image recognition, speech processing, autonomous vehicles, medical diagnosis, and much more.`
      sources.push("AI Knowledge Base")
    }
  }

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
      const sourcesFromLookup = await searchSources("general", topic || input)

      if (sourcesFromLookup && sourcesFromLookup.length > 0) {
        // Fetch content from the first Wikipedia result
        const wikiUrl = sourcesFromLookup[0]
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
        sources.push(...sourcesFromLookup)
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

  if (!responseText) {
    // Try URL lookup as fallback
    try {
      const searchResults = await searchSources("general", input)
      if (searchResults && searchResults.length > 0) {
        responseText = searchResults.join("\n\n")
        sources.push("Wikipedia")
      }
    } catch (error) {
      console.log("[v0] URL lookup failed, using generic response")
    }

    // Final fallback
    if (!responseText) {
      responseText = `I can help with general knowledge questions. I have access to information about geography, history, science, and more. Try asking me about specific topics!`
    }
  }

  return {
    response: responseText.trim(),
    confidence: confidence,
    domain: GENERAL_DOMAIN,
    sources: sources.length > 0 ? sources : ["General Knowledge Domain"],
    metadata: {
      tokensUsed: tokens.length,
      embeddingsUsed: embeddings.length > 0,
      sentimentDetected: sentiment?.sentiment || "neutral",
    },
  }
}

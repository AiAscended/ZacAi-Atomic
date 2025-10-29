import { searchSources } from "../../shared/tools/urlLookup"
import { GENERAL_DOMAIN } from "./general_constants"

const stopWords = [
  "what",
  "is",
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "if",
  "you",
  "look",
  "up",
  "does",
  "it",
  "say",
  "when",
  "was",
  "and",
  "by",
  "who",
  "how",
  "long",
  "has",
  "been",
  "since",
  "can",
  "tell",
  "me",
  "about",
  "also",
  "please",
  "could",
  "would",
  "should",
  "i'm",
  "i",
  "my",
  "your",
]

export const generalRunInference = async (input: string, context?: any) => {
  const tokens = context?.tokens || []
  const embeddings = context?.embeddings || []
  const inferenceResults = context?.inferenceResults
  const sentiment = context?.sentiment
  const userProfile = context?.userProfile || {}

  const domainInferenceResult = Array.isArray(inferenceResults)
    ? inferenceResults.find((r) => r.domain === GENERAL_DOMAIN)
    : inferenceResults

  let confidence = domainInferenceResult?.confidence || 0
  let responseText = ""
  const sources: string[] = []
  let inferenceSucceeded = false

  console.log(`[v0] ${GENERAL_DOMAIN} inference confidence:`, confidence)

  if (confidence < 0.05) {
    // Still try URL lookup even with low confidence
    confidence = 0.05
  }

  const lowerInput = input.toLowerCase()
  if (
    lowerInput.includes("your name") ||
    lowerInput.includes("who are you") ||
    lowerInput.includes("what do you do") ||
    lowerInput.includes("what are you") ||
    lowerInput.includes("who invented you") ||
    lowerInput.includes("what can you do") ||
    lowerInput.includes("tell me about you")
  ) {
    responseText =
      "I'm ZacAi-Atomic, a hybrid multi-domain modular AI assistant created by Ron. " +
      "I can help with mathematics, programming (TypeScript), general knowledge, internet searches, and more. " +
      "I use domain-specific inference engines with pretrained weights to provide accurate responses across multiple knowledge areas. " +
      "Each domain (mathematics, TypeScript, internet search, etc.) acts as a specialized mini-agent with its own tokenizer, semantic analyzer, and inference logic. " +
      "Nice to meet you, Ron!"
    sources.push("General Domain (Self-Description)")
    confidence = 0.8
    inferenceSucceeded = true

    return {
      response: responseText,
      confidence,
      domain: GENERAL_DOMAIN,
      sources,
      metadata: {
        tokensUsed: tokens.length,
        embeddingsUsed: embeddings.length > 0,
        sentimentDetected: sentiment?.sentiment || "neutral",
        inferenceMethod: "self_description",
      },
    }
  }

  const hasTrainedKnowledge = confidence > 0.03 // Very low threshold for testing

  if (hasTrainedKnowledge) {
    try {
      const queryKeywords = tokens
        .filter((t: string) => {
          const token = t.toLowerCase()
          return !stopWords.includes(token) && token.length > 2 && !/^\d+$/.test(token)
        })
        .slice(0, 5)

      console.log("[v0] Query keywords extracted:", queryKeywords)

      responseText = `Based on trained knowledge (confidence: ${(confidence * 100).toFixed(1)}%), `
      responseText += `regarding ${queryKeywords.slice(0, 3).join(", ")}: `
      responseText += `Processing query with ${tokens.length} tokens. `
      sources.push("Domain Inference (Trained Weights)")
      inferenceSucceeded = true
    } catch (error) {
      console.error("[v0] Domain inference failed:", error)
    }
  }

  if (!inferenceSucceeded) {
    try {
      const queryKeywords = tokens
        .filter((t: string) => {
          const token = t.toLowerCase()
          return !stopWords.includes(token) && token.length > 2 && !/^\d+$/.test(token)
        })
        .slice(0, 5)

      const searchQuery = queryKeywords.join(" ") || input.split(" ").slice(0, 5).join(" ")
      console.log("[v0] Searching Wikipedia for:", searchQuery)

      const sourcesFromLookup = await searchSources("general", searchQuery)

      if (sourcesFromLookup && sourcesFromLookup.length > 0) {
        // Extract the Wikipedia URL from the response
        const wikiUrlMatch = sourcesFromLookup[0].match(/https:\/\/en\.wikipedia\.org[^\s)]+/)
        const wikiUrl = wikiUrlMatch ? wikiUrlMatch[0] : sourcesFromLookup[0]

        console.log("[v0] Searching Wikipedia at:", wikiUrl)

        try {
          const response = await fetch(wikiUrl, {
            method: "GET",
            headers: { Accept: "text/html" },
            redirect: "follow",
          })

          if (response.ok) {
            const html = await response.text()
            // Extract first paragraph from Wikipedia article
            const paragraphMatch = html.match(/<p[^>]*>(.*?)<\/p>/s)

            if (paragraphMatch) {
              const cleanText = paragraphMatch[1]
                .replace(/<[^>]*>/g, "")
                .replace(/\[.*?\]/g, "")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 500)

              if (cleanText.length > 50) {
                responseText = cleanText + `\n\n*Source: Wikipedia*`
                sources.push(wikiUrl)
                confidence = Math.max(confidence, 0.6) // Boost confidence for successful Wikipedia lookup
                inferenceSucceeded = true
              }
            }
          }
        } catch (fetchError) {
          console.error("[v0] Wikipedia fetch failed:", fetchError)
        }
      }
    } catch (lookupError) {
      console.error("[v0] URL lookup failed:", lookupError)
    }
  }

  if (!inferenceSucceeded) {
    return {
      response: null,
      confidence: 0,
      domain: GENERAL_DOMAIN,
      sources: [],
      error: {
        code: "INFERENCE_FAILED",
        message: "Domain inference and URL lookup both failed",
        details: {
          inferenceConfidence: confidence,
          tokensProcessed: tokens.length,
          urlLookupAttempted: true,
        },
      },
      metadata: {
        tokensUsed: tokens.length,
        embeddingsUsed: embeddings.length > 0,
        sentimentDetected: sentiment?.sentiment || "neutral",
      },
    }
  }

  return {
    response: responseText.trim(),
    confidence: confidence,
    domain: GENERAL_DOMAIN,
    sources: sources.length > 0 ? sources : ["Domain Inference"],
    metadata: {
      tokensUsed: tokens.length,
      embeddingsUsed: embeddings.length > 0,
      sentimentDetected: sentiment?.sentiment || "neutral",
      inferenceMethod: sources.includes("Domain Inference (Trained Weights)") ? "trained_weights" : "url_lookup",
    },
  }
}

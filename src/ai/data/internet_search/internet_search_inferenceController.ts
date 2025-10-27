/**
 * File: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Purpose: Handles inference for internet search domain with URL lookup integration
 */

import { findSources } from "../url_lookup"
import { INTERNET_SEARCH_DOMAIN } from "./internet_search_constants"

export async function internetSearchRunInference(input: string): Promise<{ response: string }> {
  const lowerInput = input.toLowerCase()

  // Check if user is asking about sources or references
  if (
    lowerInput.includes("source") ||
    lowerInput.includes("reference") ||
    lowerInput.includes("url") ||
    lowerInput.includes("wiki")
  ) {
    const sources = findSources(INTERNET_SEARCH_DOMAIN)

    if (sources.length > 0) {
      const sourceList = sources
        .map((s) => `${s.name}: ${s.url}${s.description ? ` - ${s.description}` : ""}`)
        .join("\n")
      return {
        response: `I have access to the following reference sources:\n${sourceList}\n\nI can look up information from these trusted sources to provide accurate answers.`,
      }
    }
  }

  // Check for general knowledge or fact requests
  if (lowerInput.includes("fact") || lowerInput.includes("interesting") || lowerInput.includes("knowledge")) {
    return {
      response: `Here's an interesting fact: The human brain contains approximately 86 billion neurons, each forming thousands of connections with other neurons. This creates a network more complex than any computer system we've built. The internet itself, which connects billions of devices worldwide, was inspired by how neurons communicate in the brain!`,
    }
  }

  // Default response with capability description
  return {
    response: `I can search for information, provide interesting facts, and access reference sources including Wikipedia and other trusted knowledge bases. What would you like to know?`,
  }
}

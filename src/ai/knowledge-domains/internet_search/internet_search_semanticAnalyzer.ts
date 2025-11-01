/**
 * File: src/ai/data/internet_search/internet_search_semanticAnalyzer.ts
 * Purpose: Analyzes semantic meaning of search queries
 * Depends on: None
 * Depended on by: src/ai/data/internet_search/internet_search_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

export function internetSearchSemanticAnalyzer(input: string): {
  hasSearchIntent: boolean
  hasQuestionWords: boolean
  hasInformationalIntent: boolean
  complexity: number
  queryType: "factual" | "definition" | "history" | "how-to" | "general"
} {
  const lowerInput = input.toLowerCase()

  // Detect search intent
  const searchKeywords = ["search", "find", "lookup", "google", "bing", "tell me", "show me"]
  const hasSearchIntent = searchKeywords.some((keyword) => lowerInput.includes(keyword))

  // Detect question words
  const questionWords = ["who", "what", "where", "when", "why", "how"]
  const hasQuestionWords = questionWords.some((word) => lowerInput.includes(word))

  // Detect informational intent
  const informationalKeywords = ["history", "definition", "explain", "about", "information", "invented"]
  const hasInformationalIntent = informationalKeywords.some((keyword) => lowerInput.includes(keyword))

  // Calculate complexity
  const wordCount = input.split(/\s+/).length
  const complexity = wordCount * 10

  // Determine query type
  let queryType: "factual" | "definition" | "history" | "how-to" | "general" = "general"
  if (lowerInput.includes("who") || lowerInput.includes("invented")) {
    queryType = "factual"
  } else if (lowerInput.includes("what is") || lowerInput.includes("definition")) {
    queryType = "definition"
  } else if (lowerInput.includes("history")) {
    queryType = "history"
  } else if (lowerInput.includes("how")) {
    queryType = "how-to"
  }

  return {
    hasSearchIntent,
    hasQuestionWords,
    hasInformationalIntent,
    complexity,
    queryType,
  }
}

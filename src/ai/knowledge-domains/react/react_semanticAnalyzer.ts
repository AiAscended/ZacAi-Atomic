/**
 * File: src/ai/data/react/react_semanticAnalyzer.ts
 * Purpose: Analyze semantic meaning of React queries and code
 * Depends on: react_parser.ts
 * Depended on by: react_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseReactInput } from "./react_parser"

export interface ReactSemanticAnalysis {
  intent: "learn" | "debug" | "implement" | "optimize" | "explain"
  confidence: number
  topics: string[]
  complexity: "beginner" | "intermediate" | "advanced"
  suggestedResponse: string
}

export function analyzeReactSemantics(input: string): ReactSemanticAnalysis {
  const parseResult = parseReactInput(input)
  const lowerInput = input.toLowerCase()

  let intent: ReactSemanticAnalysis["intent"] = "explain"
  let confidence = 0.5
  const topics: string[] = []
  let complexity: ReactSemanticAnalysis["complexity"] = "beginner"

  // Determine intent
  if (lowerInput.includes("how") || lowerInput.includes("what") || lowerInput.includes("explain")) {
    intent = "learn"
    confidence = 0.8
  } else if (lowerInput.includes("error") || lowerInput.includes("bug") || lowerInput.includes("fix")) {
    intent = "debug"
    confidence = 0.85
  } else if (lowerInput.includes("create") || lowerInput.includes("build") || lowerInput.includes("implement")) {
    intent = "implement"
    confidence = 0.9
  } else if (lowerInput.includes("optimize") || lowerInput.includes("improve") || lowerInput.includes("performance")) {
    intent = "optimize"
    confidence = 0.75
  }

  // Extract topics
  if (parseResult.metadata.hasHooks) topics.push("hooks")
  if (parseResult.metadata.hasState) topics.push("state-management")
  if (parseResult.metadata.hasProps) topics.push("props")
  if (parseResult.metadata.hasJSX) topics.push("jsx")
  if (parseResult.metadata.componentType) topics.push(`${parseResult.metadata.componentType}-component`)
  if (parseResult.metadata.hookTypes) topics.push(...parseResult.metadata.hookTypes)

  // Determine complexity
  if (lowerInput.includes("advanced") || lowerInput.includes("complex") || topics.length > 3) {
    complexity = "advanced"
  } else if (lowerInput.includes("intermediate") || topics.length > 1) {
    complexity = "intermediate"
  }

  const suggestedResponse = generateSuggestedResponse(intent, topics, complexity)

  return {
    intent,
    confidence,
    topics,
    complexity,
    suggestedResponse,
  }
}

function generateSuggestedResponse(
  intent: ReactSemanticAnalysis["intent"],
  topics: string[],
  complexity: ReactSemanticAnalysis["complexity"],
): string {
  const topicStr = topics.length > 0 ? topics.join(", ") : "React concepts"

  switch (intent) {
    case "learn":
      return `I can explain ${topicStr} at a ${complexity} level.`
    case "debug":
      return `I can help debug issues related to ${topicStr}.`
    case "implement":
      return `I can provide implementation guidance for ${topicStr}.`
    case "optimize":
      return `I can suggest optimizations for ${topicStr}.`
    case "explain":
      return `I can provide information about ${topicStr}.`
  }
}

import { parseProgrammingInput } from "./programming_parser"
import { analyzeProgrammingSemantics } from "./programming_semanticAnalyzer"

export interface ProgrammingInferenceResult {
  response: string
  confidence: number
  topics: string[]
  metadata: { intent: string; complexity: string; parseType: string }
}

export async function programmingRunInference(input: string): Promise<ProgrammingInferenceResult | null> {
  const lowerInput = input.toLowerCase()

  const programmingKeywords = [
    "code",
    "program",
    "function",
    "variable",
    "class",
    "algorithm",
    "syntax",
    "debug",
    "compile",
    "runtime",
  ]

  const isProgrammingQuery = programmingKeywords.some((keyword) => lowerInput.includes(keyword))

  if (!isProgrammingQuery) return null

  try {
    const parseResult = parseProgrammingInput(input)
    const semanticAnalysis = analyzeProgrammingSemantics(input)

    let response = `${semanticAnalysis.suggestedResponse} Programming involves understanding core concepts like variables, functions, data structures, and algorithms.`

    if (parseResult.type === "debugging") {
      response = `For debugging: ${semanticAnalysis.suggestedResponse} Start by identifying the error message, checking variable values, and tracing execution flow.`
    } else if (parseResult.type === "design") {
      response = `Design patterns provide reusable solutions to common problems. ${semanticAnalysis.suggestedResponse}`
    }

    return {
      response,
      confidence: semanticAnalysis.confidence,
      topics: semanticAnalysis.topics,
      metadata: {
        intent: semanticAnalysis.intent,
        complexity: semanticAnalysis.complexity,
        parseType: parseResult.type,
      },
    }
  } catch (error) {
    console.error("[Programming Domain] Inference error:", error)
    return null
  }
}

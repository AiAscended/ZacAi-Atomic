/**
 * File: src/ai/knowledge-domains/react/react_inferenceController.ts
 * Purpose: Run inference for React domain queries
 * Depends on: react_parser.ts, react_semanticAnalyzer.ts, react_embeddings.ts
 * Depended on by: react_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseReactInput, type ReactParseResult } from "./react_parser"
import { analyzeReactSemantics, type ReactSemanticAnalysis } from "./react_semanticAnalyzer"

export interface ReactInferenceResult {
  response: string
  confidence: number
  topics: string[]
  metadata: {
    intent: string
    complexity: string
    parseType: string
  }
}

export type ReactInferenceContext = Record<string, unknown>

type ResponseGenerator = (analysis: ReactSemanticAnalysis) => string

const RESPONSE_GENERATORS: Record<ReactParseResult["type"], ResponseGenerator> = {
  component: generateComponentResponse,
  hook: generateHookResponse,
  pattern: generatePatternResponse,
  question: generateQuestionResponse,
  code: generateCodeResponse,
  general: generateGeneralResponse,
}

export async function reactRunInference(
  input: string,
  context?: ReactInferenceContext,
): Promise<ReactInferenceResult | null> {
  const lowerInput = input.toLowerCase()

  if (context && Object.keys(context).length > 0) {
    console.log(`[React Domain] Context keys: ${Object.keys(context).join(", ")}`)
  }

  // Check if this query is relevant to React
  const reactKeywords = [
    "react",
    "component",
    "jsx",
    "tsx",
    "hook",
    "usestate",
    "useeffect",
    "props",
    "state",
    "render",
  ]

  const isReactQuery = reactKeywords.some((keyword) => lowerInput.includes(keyword))

  if (!isReactQuery) {
    return null // Not a React query
  }

  try {
    const parseResult = parseReactInput(input)
    const semanticAnalysis = analyzeReactSemantics(input)

    const responseGenerator = RESPONSE_GENERATORS[parseResult.type] ?? generateGeneralResponse
    const response = responseGenerator(semanticAnalysis)

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
    console.error("[React Domain] Inference error:", error)
    return null
  }
}

function generateComponentResponse(analysis: ReactSemanticAnalysis): string {
  return `React components are the building blocks of React applications. ${analysis.suggestedResponse} Components can be functional or class-based, with functional components being the modern standard.`
}

function generateHookResponse(analysis: ReactSemanticAnalysis): string {
  const hookTypes = analysis.topics.filter((topic) => topic.startsWith("use"))
  if (hookTypes.length > 0) {
    return `React Hooks like ${hookTypes.join(", ")} allow you to use state and other React features in functional components. ${analysis.suggestedResponse}`
  }
  return `React Hooks are functions that let you use state and lifecycle features in functional components. ${analysis.suggestedResponse}`
}

function generatePatternResponse(analysis: ReactSemanticAnalysis): string {
  return `React patterns help organize code and solve common problems. ${analysis.suggestedResponse} Common patterns include composition, render props, higher-order components, and custom hooks.`
}

function generateQuestionResponse(analysis: ReactSemanticAnalysis): string {
  return `${analysis.suggestedResponse} React is a JavaScript library for building user interfaces, focusing on component-based architecture and declarative programming.`
}

function generateCodeResponse(analysis: ReactSemanticAnalysis): string {
  return `Here's guidance for React code: ${analysis.suggestedResponse} React uses JSX syntax to describe UI, and components manage their own state and props.`
}

function generateGeneralResponse(analysis: ReactSemanticAnalysis): string {
  return `${analysis.suggestedResponse} React provides a powerful and flexible way to build modern web applications with reusable components.`
}

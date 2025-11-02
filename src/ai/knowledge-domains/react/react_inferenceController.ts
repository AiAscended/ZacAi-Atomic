/**
 * File: src/ai/data/react/react_inferenceController.ts
 * Purpose: Run inference for React domain queries
 * Depends on: react_parser.ts, react_semanticAnalyzer.ts, react_embeddings.ts
 * Depended on by: react_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseReactInput } from "./react_parser"
import { analyzeReactSemantics } from "./react_semanticAnalyzer"

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

export async function reactRunInference(input: string): Promise<ReactInferenceResult | null> {
  const lowerInput = input.toLowerCase()

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

    let response = ""

    // Generate response based on parse type and semantic analysis
    switch (parseResult.type) {
      case "component":
        response = generateComponentResponse(input, semanticAnalysis)
        break
      case "hook":
        response = generateHookResponse(input, semanticAnalysis)
        break
      case "pattern":
        response = generatePatternResponse(input, semanticAnalysis)
        break
      case "question":
        response = generateQuestionResponse(input, semanticAnalysis)
        break
      case "code":
        response = generateCodeResponse(input, semanticAnalysis)
        break
      default:
        response = generateGeneralResponse(input, semanticAnalysis)
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
    console.error("[React Domain] Inference error:", error)
    return null
  }
}

function generateComponentResponse(_input: string, analysis: any): string {
  return `React components are the building blocks of React applications. ${analysis.suggestedResponse} Components can be functional or class-based, with functional components being the modern standard.`
}

function generateHookResponse(_input: string, analysis: any): string {
  const hookTypes = analysis.topics.filter((t: string) => t.startsWith("use"))
  if (hookTypes.length > 0) {
    return `React Hooks like ${hookTypes.join(", ")} allow you to use state and other React features in functional components. ${analysis.suggestedResponse}`
  }
  return `React Hooks are functions that let you use state and lifecycle features in functional components. ${analysis.suggestedResponse}`
}

function generatePatternResponse(_input: string, analysis: any): string {
  return `React patterns help organize code and solve common problems. ${analysis.suggestedResponse} Common patterns include composition, render props, higher-order components, and custom hooks.`
}

function generateQuestionResponse(_input: string, analysis: any): string {
  return `${analysis.suggestedResponse} React is a JavaScript library for building user interfaces, focusing on component-based architecture and declarative programming.`
}

function generateCodeResponse(_input: string, analysis: any): string {
  return `Here's guidance for React code: ${analysis.suggestedResponse} React uses JSX syntax to describe UI, and components manage their own state and props.`
}

function generateGeneralResponse(_input: string, analysis: any): string {
  return `${analysis.suggestedResponse} React provides a powerful and flexible way to build modern web applications with reusable components.`
}

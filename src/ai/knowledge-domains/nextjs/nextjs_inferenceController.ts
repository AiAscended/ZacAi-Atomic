/**
 * File: src/ai/data/nextjs/nextjs_inferenceController.ts
 * Purpose: Run inference for Next.js domain queries
 * Depends on: nextjs_parser.ts, nextjs_semanticAnalyzer.ts, nextjs_embeddings.ts
 * Depended on by: nextjs_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseNextjsInput } from "./nextjs_parser"
import { analyzeNextjsSemantics } from "./nextjs_semanticAnalyzer"

export interface NextjsInferenceResult {
  response: string
  confidence: number
  topics: string[]
  metadata: {
    intent: string
    complexity: string
    parseType: string
    routerType?: string
  }
}

export async function nextjsRunInference(input: string): Promise<NextjsInferenceResult | null> {
  const lowerInput = input.toLowerCase()

  const nextjsKeywords = [
    "next.js",
    "nextjs",
    "next js",
    "app router",
    "pages router",
    "server component",
    "client component",
    "server action",
    "route handler",
    "next config",
    "vercel",
  ]

  const isNextjsQuery = nextjsKeywords.some((keyword) => lowerInput.includes(keyword))

  if (!isNextjsQuery) {
    return null
  }

  try {
    const parseResult = parseNextjsInput(input)
    const semanticAnalysis = analyzeNextjsSemantics(input)

    let response = ""

    switch (parseResult.type) {
      case "routing":
        response = generateRoutingResponse(input, semanticAnalysis, parseResult)
        break
      case "server-component":
        response = generateServerComponentResponse(input, semanticAnalysis)
        break
      case "client-component":
        response = generateClientComponentResponse(input, semanticAnalysis)
        break
      case "api":
        response = generateApiResponse(input, semanticAnalysis)
        break
      case "config":
        response = generateConfigResponse(input, semanticAnalysis)
        break
      case "deployment":
        response = generateDeploymentResponse(input, semanticAnalysis)
        break
      case "question":
        response = generateQuestionResponse(input, semanticAnalysis)
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
        routerType: parseResult.metadata.routerType,
      },
    }
  } catch (error) {
    console.error("[Next.js Domain] Inference error:", error)
    return null
  }
}

function generateRoutingResponse(_input: string, analysis: any, parseResult: any): string {
  const routerType = parseResult.metadata.routerType || "App Router"
  return `Next.js ${routerType} provides file-based routing. ${analysis.suggestedResponse} The App Router uses the app directory with layouts, pages, and route handlers.`
}

function generateServerComponentResponse(input: string, analysis: any): string {
  return `Server Components in Next.js render on the server and can directly access backend resources. ${analysis.suggestedResponse} They're the default in the App Router and enable better performance.`
}

function generateClientComponentResponse(input: string, analysis: any): string {
  return `Client Components use the "use client" directive and enable interactivity with hooks and browser APIs. ${analysis.suggestedResponse} Use them for interactive UI elements.`
}

function generateApiResponse(input: string, analysis: any): string {
  return `Next.js Route Handlers (route.ts files) replace API Routes in the App Router. ${analysis.suggestedResponse} They support GET, POST, PUT, DELETE, and other HTTP methods.`
}

function generateConfigResponse(input: string, analysis: any): string {
  return `next.config.js configures Next.js behavior including redirects, rewrites, environment variables, and build settings. ${analysis.suggestedResponse}`
}

function generateDeploymentResponse(input: string, analysis: any): string {
  return `Next.js deploys seamlessly to Vercel with zero configuration. ${analysis.suggestedResponse} You can also self-host using Node.js, Docker, or static export.`
}

function generateQuestionResponse(input: string, analysis: any): string {
  return `${analysis.suggestedResponse} Next.js is a React framework that provides server-side rendering, static generation, and a powerful routing system.`
}

function generateGeneralResponse(input: string, analysis: any): string {
  return `${analysis.suggestedResponse} Next.js combines the best of React with powerful features for production applications.`
}

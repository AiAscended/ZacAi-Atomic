/**
 * File: src/ai/knowledge-domains/nextjs/nextjs_inferenceController.ts
 * Purpose: Run inference for Next.js domain queries using REAL AI with seed data
 * Depends on: nextjs_parser.ts, nextjs_semanticAnalyzer.ts, semanticInferenceHelper.ts
 * Depended on by: nextjs_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { parseNextjsInput } from "./nextjs_parser"
import { analyzeNextjsSemantics } from "./nextjs_semanticAnalyzer"
import { performSemanticInference, searchCodeExamples } from "@/ai/shared/inference/semanticInferenceHelper"
import { NEXTJS_DOMAIN } from "./nextjs_constants"

export interface NextjsInferenceResult {
  response: string
  confidence: number
  topics: string[]
  codeExamples?: string[]
  metadata: {
    intent: string
    complexity: string
    parseType: string
    routerType?: string
    inferenceMethod?: string
    matchedSeeds?: number
  }
}

export async function nextjsRunInference(input: string, context?: unknown): Promise<NextjsInferenceResult | null> {
  console.log(`[NextJS] Running REAL AI inference with seed data for: "${input.substring(0, 50)}..."`);
  
  try {
    // Use semantic inference helper to query seed registry
    const semanticResult = await performSemanticInference(input, 'nextjs', context);
    
    // Also run traditional parser and semantic analyzer for metadata
    const parseResult = parseNextjsInput(input);
    const semanticAnalysis = analyzeNextjsSemantics(input);
    
    // Search for code examples if query mentions code/example
    let codeExamples = semanticResult.codeExamples;
    if (!codeExamples && (input.toLowerCase().includes('example') || input.toLowerCase().includes('code'))) {
      const examples = await searchCodeExamples(semanticResult.concepts, 'nextjs');
      if (examples.length > 0) {
        codeExamples = examples.map(ex => `\`\`\`${ex.language || 'typescript'}\n${ex.code}\n\`\`\``);
      }
    }

    return {
      response: semanticResult.response,
      confidence: semanticResult.confidence,
      topics: semanticResult.concepts,
      codeExamples,
      metadata: {
        intent: semanticAnalysis.intent,
        complexity: semanticAnalysis.complexity,
        parseType: parseResult.type,
        routerType: parseResult.metadata.routerType,
        inferenceMethod: semanticResult.metadata.inferenceMethod,
        matchedSeeds: semanticResult.metadata.matchedSeeds,
      },
    }
  } catch (error) {
    console.error("[Next.js Domain] Inference error:", error)
    return null
  }
}

// All hardcoded response functions removed - now using REAL AI with seed registry

export default nextjsRunInference;

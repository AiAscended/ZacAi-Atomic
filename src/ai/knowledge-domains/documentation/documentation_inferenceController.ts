/**
 * File: src/ai/knowledge-domains/documentation/documentation_inferenceController.ts
 * Purpose: Documentation domain inference pipeline wrapper
 * Depends on: documentation_tokenizer.ts, documentation_semanticAnalyzer.ts
 * Depended on by: documentation_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { documentationTokenizer } from "./documentation_tokenizer"
import { documentationSemanticAnalyzer } from "./documentation_semanticAnalyzer"
import { extractSeedsFromPrompt, searchSeeds } from "../../shared/seeds/seedLookup"
import type { SeedEntry } from "../../shared/seeds/seedRegistry"

const formatSeedInsight = (seed: SeedEntry, index: number): string => {
  const label = seed.word || seed.concept || seed.term || `entry-${index + 1}`
  const definition =
    seed.fullData?.definition ||
    seed.fullData?.description ||
    seed.fullData?.explanation ||
    "reference concept"

  return `${index + 1}. ${label}: ${definition}`
}

const detectCodeSample = (text: string): boolean => /[{;]|function\s+|class\s+/i.test(text)

export const documentationRunInference = async (input: string) => {
  const tokens = documentationTokenizer(input)
  const semantics = documentationSemanticAnalyzer(input)
  const isCodeSample = detectCodeSample(input)

  const directSeeds = extractSeedsFromPrompt(input, "documentation")
  const supplementalSeeds = searchSeeds(input, {
    domain: "documentation",
    limit: 8,
  })

  const seedPool: SeedEntry[] = [...directSeeds, ...supplementalSeeds]
  const uniqueSeeds: SeedEntry[] = []
  const seen = new Set<string>()

  for (const seed of seedPool) {
    const key = `${seed.domain}:${seed.word || seed.concept || seed.term}`
    if (!key.trim() || seen.has(key)) continue
    seen.add(key)
    uniqueSeeds.push(seed)
    if (uniqueSeeds.length >= 6) break
  }

  const insightLines = uniqueSeeds.map((seed, index) => formatSeedInsight(seed, index))

  const semanticSummary = `Comments detected: ${semantics.commentCount}. JSDoc: ${semantics.hasJSDoc ? "present" : "missing"}. Coverage: ${semantics.coverage}. Quality: ${semantics.quality}.`

  const recommendation = isCodeSample
    ? "Document each exported function or component with concise JSDoc and include usage examples pulled directly from the API surface."
    : "Structure the narrative into purpose, inputs, orchestration flow, and domain responsibilities to keep future docs aligned with the hybrid pipeline."

  const modeLabel = isCodeSample ? "code sample" : "conceptual brief"

  const responseSections = [
    `**Documentation focus (${modeLabel})**\n${semanticSummary}`,
    insightLines.length > 0 ? `**Knowledge seeds referenced**\n${insightLines.join("\n")}` : undefined,
    `**Recommended next action**\n${recommendation}`,
  ].filter(Boolean)

  const confidenceBase = 0.55
  const seedBoost = uniqueSeeds.length * 0.04
  const jsdocBoost = semantics.hasJSDoc ? 0.1 : semantics.commentCount > 0 ? 0.05 : 0
  const confidence = Math.min(0.92, confidenceBase + seedBoost + jsdocBoost)

  return {
    response: responseSections.join("\n\n"),
    confidence,
    tokens: tokens.tokens,
    tokenCount: tokens.length,
    topics: uniqueSeeds.map(seed => seed.word || seed.concept || seed.term).filter(Boolean) as string[],
    metadata: {
      mode: modeLabel,
      hasJSDoc: semantics.hasJSDoc,
      commentCount: semantics.commentCount,
      coverage: semantics.coverage,
      insights: insightLines,
    },
  }
}

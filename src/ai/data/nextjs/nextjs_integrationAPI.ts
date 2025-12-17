/**
 * File: src/ai/data/nextjs/nextjs_integrationAPI.ts
 * Purpose: Integration API to register Next.js domain with the central registry
 * Depends on: All nextjs domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { NEXTJS_DOMAIN } from "./nextjs_constants"
import { loadNextjsSeedVocabulary } from "./nextjs_vocabularyManager"
import { nextjsRunInference } from "./nextjs_inferenceController"
import { nextjsRunTrainingEpoch } from "./nextjs_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const nextjsInit = async () => {
  await loadNextjsSeedVocabulary()

  registerDomainFiles(NEXTJS_DOMAIN, [
    "src/ai/data/nextjs/nextjs_seedVocabulary.json",
    "src/ai/data/nextjs/nextjs_learnedData.json",
    "src/ai/data/nextjs/nextjs_webDocReferences.json",
    "src/ai/data/nextjs/nextjs_trainingWeights.bin",
    "src/ai/data/nextjs/nextjs_pretrained_weights.json",
    "src/ai/data/nextjs/nextjs_tokens.ts",
    "src/ai/data/nextjs/nextjs_tokenMap.ts",
    "src/ai/data/nextjs/nextjs_embeddings.ts",
    "src/ai/data/nextjs/nextjs_tokenizer.ts",
    "src/ai/data/nextjs/nextjs_parser.ts",
    "src/ai/data/nextjs/nextjs_semanticAnalyzer.ts",
    "src/ai/data/nextjs/nextjs_vocabularyManager.ts",
    "src/ai/data/nextjs/nextjs_learnedDataManager.ts",
    "src/ai/data/nextjs/nextjs_inferenceController.ts",
    "src/ai/data/nextjs/nextjs_trainingController.ts",
    "src/ai/data/nextjs/nextjs_modelWeightsLoader.ts",
    "src/ai/data/nextjs/nextjs_domainRegistrar.ts",
    "src/ai/data/nextjs/nextjs_meta.json",
    "src/ai/data/nextjs/nextjs_constants.ts",
    "src/ai/data/nextjs/nextjs_utils.ts",
    "src/ai/data/nextjs/nextjs_url_lookup.ts",
  ])

  try {
    watchDomainFiles(NEXTJS_DOMAIN)
  } catch (e) {
    // Ignore watch errors
  }

  registerDomain({
    name: NEXTJS_DOMAIN,
    version: "1.0.0",
    initialize: async () => {
      await loadNextjsSeedVocabulary()
    },
    query: async (input: string) => nextjsRunInference(input),
    train: async (opts?: Record<string, unknown>) => {
      const samples = (opts?.samples as any[]) || []
      return nextjsRunTrainingEpoch(samples)
    },
  })
}

void nextjsInit()

export default nextjsInit

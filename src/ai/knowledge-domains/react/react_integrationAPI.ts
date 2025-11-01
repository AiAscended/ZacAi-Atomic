/**
 * File: src/ai/data/react/react_integrationAPI.ts
 * Purpose: Integration API to register React domain with the central registry
 * Depends on: All react domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { REACT_DOMAIN } from "./react_constants"
import { loadReactSeedVocabulary } from "./react_vocabularyManager"
import { reactRunInference } from "./react_inferenceController"
import { reactRunTrainingEpoch } from "./react_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const reactInit = async () => {
  await loadReactSeedVocabulary()

  registerDomainFiles(REACT_DOMAIN, [
    "src/ai/data/react/react_seedVocabulary.json",
    "src/ai/data/react/react_learnedData.json",
    "src/ai/data/react/react_webDocReferences.json",
    "src/ai/data/react/react_trainingWeights.bin",
    "src/ai/data/react/react_pretrained_weights.json",
    "src/ai/data/react/react_tokens.ts",
    "src/ai/data/react/react_tokenMap.ts",
    "src/ai/data/react/react_embeddings.ts",
    "src/ai/data/react/react_tokenizer.ts",
    "src/ai/data/react/react_parser.ts",
    "src/ai/data/react/react_semanticAnalyzer.ts",
    "src/ai/data/react/react_vocabularyManager.ts",
    "src/ai/data/react/react_learnedDataManager.ts",
    "src/ai/data/react/react_inferenceController.ts",
    "src/ai/data/react/react_trainingController.ts",
    "src/ai/data/react/react_modelWeightsLoader.ts",
    "src/ai/data/react/react_domainRegistrar.ts",
    "src/ai/data/react/react_meta.json",
    "src/ai/data/react/react_constants.ts",
    "src/ai/data/react/react_utils.ts",
    "src/ai/data/react/react_url_lookup.ts",
  ])

  try {
    watchDomainFiles(REACT_DOMAIN)
  } catch (e) {
    // Ignore watch errors in environments where file watching isn't supported
  }

  registerDomain({
    name: REACT_DOMAIN,
    version: "1.0.0",
    initialize: async () => {
      await loadReactSeedVocabulary()
    },
    query: async (input: string) => reactRunInference(input),
    train: async (opts?: Record<string, unknown>) => {
      const samples = (opts?.samples as any[]) || []
      return reactRunTrainingEpoch(samples)
    },
  })
}

// Auto-initialize when imported
void reactInit()

export default reactInit

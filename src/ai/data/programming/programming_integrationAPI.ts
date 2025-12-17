/**
 * File: src/ai/data/programming/programming_integrationAPI.ts
 * Purpose: Integration API to register Programming domain with the central registry
 * Depends on: All programming domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { PROGRAMMING_DOMAIN } from "./programming_constants"
import { loadProgrammingSeedVocabulary } from "./programming_vocabularyManager"
import { programmingRunInference } from "./programming_inferenceController"
import { programmingRunTrainingEpoch } from "./programming_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const programmingInit = async () => {
  await loadProgrammingSeedVocabulary()

  registerDomainFiles(PROGRAMMING_DOMAIN, [
    "src/ai/data/programming/programming_seedVocabulary.json",
    "src/ai/data/programming/programming_learnedData.json",
    "src/ai/data/programming/programming_webDocReferences.json",
    "src/ai/data/programming/programming_trainingWeights.bin",
    "src/ai/data/programming/programming_pretrained_weights.json",
    "src/ai/data/programming/programming_tokens.ts",
    "src/ai/data/programming/programming_tokenMap.ts",
    "src/ai/data/programming/programming_embeddings.ts",
    "src/ai/data/programming/programming_tokenizer.ts",
    "src/ai/data/programming/programming_parser.ts",
    "src/ai/data/programming/programming_semanticAnalyzer.ts",
    "src/ai/data/programming/programming_vocabularyManager.ts",
    "src/ai/data/programming/programming_learnedDataManager.ts",
    "src/ai/data/programming/programming_inferenceController.ts",
    "src/ai/data/programming/programming_trainingController.ts",
    "src/ai/data/programming/programming_modelWeightsLoader.ts",
    "src/ai/data/programming/programming_domainRegistrar.ts",
    "src/ai/data/programming/programming_meta.json",
    "src/ai/data/programming/programming_constants.ts",
    "src/ai/data/programming/programming_utils.ts",
    "src/ai/data/programming/programming_url_lookup.ts",
  ])

  try {
    watchDomainFiles(PROGRAMMING_DOMAIN)
  } catch (e) {
    // Ignore watch errors
  }

  registerDomain({
    name: PROGRAMMING_DOMAIN,
    version: "1.0.0",
    initialize: async () => {
      await loadProgrammingSeedVocabulary()
    },
    query: async (input: string) => programmingRunInference(input),
    train: async (opts?: Record<string, unknown>) => {
      const samples = (opts?.samples as any[]) || []
      return programmingRunTrainingEpoch(samples)
    },
  })
}

void programmingInit()

export default programmingInit

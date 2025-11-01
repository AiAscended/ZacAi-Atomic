/**
 * File: src/ai/data/science/science_integrationAPI.ts
 * Purpose: Register science domain into central registry
 * Depends on: All science domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { SCIENCE_DOMAIN } from "./science_constants"
import { loadScienceSeedVocabulary } from "./science_vocabularyManager"
import { scienceRunInference } from "./science_inferenceController"
import { scienceRunTrainingEpoch } from "./science_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const scienceInit = async () => {
  await loadScienceSeedVocabulary()

  registerDomainFiles(SCIENCE_DOMAIN, [
    "src/ai/data/science/science_seedVocabulary.json",
    "src/ai/data/science/science_learnedData.json",
    "src/ai/data/science/science_webDocReferences.json",
    "src/ai/data/science/science_trainingWeights.bin",
    "src/ai/data/science/science_pretrained_weights.json",
    "src/ai/data/science/science_tokens.ts",
    "src/ai/data/science/science_tokenMap.ts",
    "src/ai/data/science/science_embeddings.ts",
    "src/ai/data/science/science_tokenizer.ts",
    "src/ai/data/science/science_parser.ts",
    "src/ai/data/science/science_semanticAnalyzer.ts",
    "src/ai/data/science/science_vocabularyManager.ts",
    "src/ai/data/science/science_learnedDataManager.ts",
    "src/ai/data/science/science_inferenceController.ts",
    "src/ai/data/science/science_trainingController.ts",
    "src/ai/data/science/science_modelWeightsLoader.ts",
    "src/ai/data/science/science_meta.json",
  ])

  try {
    watchDomainFiles(SCIENCE_DOMAIN)
  } catch (e) {
    // ignore watch failures
  }

  registerDomain({
    name: SCIENCE_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadScienceSeedVocabulary()
    },
    query: async (input: string) => scienceRunInference(input),
    train: async (opts?: Record<string, unknown>) => scienceRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void scienceInit()

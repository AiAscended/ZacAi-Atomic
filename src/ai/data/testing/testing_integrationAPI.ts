/**
 * File: src/ai/data/testing/testing_integrationAPI.ts
 * Purpose: Register testing domain into central registry
 * Depends on: All testing domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { TESTING_DOMAIN } from "./testing_constants"
import { loadTestingSeedVocabulary } from "./testing_vocabularyManager"
import { testingRunInference } from "./testing_inferenceController"
import { testingRunTrainingEpoch } from "./testing_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const testingInit = async () => {
  await loadTestingSeedVocabulary()

  registerDomainFiles(TESTING_DOMAIN, [
    "src/ai/data/testing/testing_seedVocabulary.json",
    "src/ai/data/testing/testing_learnedData.json",
    "src/ai/data/testing/testing_webDocReferences.json",
    "src/ai/data/testing/testing_trainingWeights.bin",
    "src/ai/data/testing/testing_pretrained_weights.json",
    "src/ai/data/testing/testing_tokens.ts",
    "src/ai/data/testing/testing_tokenMap.ts",
    "src/ai/data/testing/testing_embeddings.ts",
    "src/ai/data/testing/testing_tokenizer.ts",
    "src/ai/data/testing/testing_parser.ts",
    "src/ai/data/testing/testing_semanticAnalyzer.ts",
    "src/ai/data/testing/testing_vocabularyManager.ts",
    "src/ai/data/testing/testing_learnedDataManager.ts",
    "src/ai/data/testing/testing_inferenceController.ts",
    "src/ai/data/testing/testing_trainingController.ts",
    "src/ai/data/testing/testing_modelWeightsLoader.ts",
    "src/ai/data/testing/testing_meta.json",
  ])

  try {
    watchDomainFiles(TESTING_DOMAIN)
  } catch (e) {}

  registerDomain({
    name: TESTING_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadTestingSeedVocabulary()
    },
    query: async (input: string) => testingRunInference(input),
    train: async (opts?: Record<string, unknown>) => testingRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void testingInit()

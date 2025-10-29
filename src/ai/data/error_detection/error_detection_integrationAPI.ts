/**
 * File: src/ai/data/error_detection/error_detection_integrationAPI.ts
 * Purpose: Register error detection domain into central registry
 * Depends on: All error_detection domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { ERROR_DETECTION_DOMAIN } from "./error_detection_constants"
import { loadErrorDetectionSeedVocabulary } from "./error_detection_vocabularyManager"
import { errorDetectionRunInference } from "./error_detection_inferenceController"
import { errorDetectionRunTrainingEpoch } from "./error_detection_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const errorDetectionInit = async () => {
  await loadErrorDetectionSeedVocabulary()

  registerDomainFiles(ERROR_DETECTION_DOMAIN, [
    "src/ai/data/error_detection/error_detection_seedVocabulary.json",
    "src/ai/data/error_detection/error_detection_learnedData.json",
    "src/ai/data/error_detection/error_detection_webDocReferences.json",
    "src/ai/data/error_detection/error_detection_trainingWeights.bin",
    "src/ai/data/error_detection/error_detection_pretrained_weights.json",
    "src/ai/data/error_detection/error_detection_tokens.ts",
    "src/ai/data/error_detection/error_detection_tokenMap.ts",
    "src/ai/data/error_detection/error_detection_embeddings.ts",
    "src/ai/data/error_detection/error_detection_tokenizer.ts",
    "src/ai/data/error_detection/error_detection_parser.ts",
    "src/ai/data/error_detection/error_detection_semanticAnalyzer.ts",
    "src/ai/data/error_detection/error_detection_vocabularyManager.ts",
    "src/ai/data/error_detection/error_detection_learnedDataManager.ts",
    "src/ai/data/error_detection/error_detection_inferenceController.ts",
    "src/ai/data/error_detection/error_detection_trainingController.ts",
    "src/ai/data/error_detection/error_detection_modelWeightsLoader.ts",
    "src/ai/data/error_detection/error_detection_meta.json",
  ])

  try {
    watchDomainFiles(ERROR_DETECTION_DOMAIN)
  } catch (e) {}

  registerDomain({
    name: ERROR_DETECTION_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadErrorDetectionSeedVocabulary()
    },
    query: async (input: string) => errorDetectionRunInference(input),
    train: async (opts?: Record<string, unknown>) => errorDetectionRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void errorDetectionInit()

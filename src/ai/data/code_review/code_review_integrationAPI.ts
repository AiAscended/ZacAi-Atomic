/**
 * File: src/ai/data/code_review/code_review_integrationAPI.ts
 * Purpose: Register code review domain into central registry
 * Depends on: All code_review domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { CODE_REVIEW_DOMAIN } from "./code_review_constants"
import { loadCodeReviewSeedVocabulary } from "./code_review_vocabularyManager"
import { codeReviewRunInference } from "./code_review_inferenceController"
import { codeReviewRunTrainingEpoch } from "./code_review_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const codeReviewInit = async () => {
  await loadCodeReviewSeedVocabulary()

  registerDomainFiles(CODE_REVIEW_DOMAIN, [
    "src/ai/data/code_review/code_review_seedVocabulary.json",
    "src/ai/data/code_review/code_review_learnedData.json",
    "src/ai/data/code_review/code_review_webDocReferences.json",
    "src/ai/data/code_review/code_review_trainingWeights.bin",
    "src/ai/data/code_review/code_review_pretrained_weights.json",
    "src/ai/data/code_review/code_review_tokens.ts",
    "src/ai/data/code_review/code_review_tokenMap.ts",
    "src/ai/data/code_review/code_review_embeddings.ts",
    "src/ai/data/code_review/code_review_tokenizer.ts",
    "src/ai/data/code_review/code_review_parser.ts",
    "src/ai/data/code_review/code_review_semanticAnalyzer.ts",
    "src/ai/data/code_review/code_review_vocabularyManager.ts",
    "src/ai/data/code_review/code_review_learnedDataManager.ts",
    "src/ai/data/code_review/code_review_inferenceController.ts",
    "src/ai/data/code_review/code_review_trainingController.ts",
    "src/ai/data/code_review/code_review_modelWeightsLoader.ts",
    "src/ai/data/code_review/code_review_meta.json",
  ])

  try {
    watchDomainFiles(CODE_REVIEW_DOMAIN)
  } catch (e) {
    // ignore watch failures
  }

  registerDomain({
    name: CODE_REVIEW_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadCodeReviewSeedVocabulary()
    },
    query: async (input: string) => codeReviewRunInference(input),
    train: async (opts?: Record<string, unknown>) => codeReviewRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void codeReviewInit()

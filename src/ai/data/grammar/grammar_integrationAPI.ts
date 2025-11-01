/**
 * File: src/ai/data/grammar/grammar_integrationAPI.ts
 * Purpose: Register grammar domain into central registry
 * Depends on: All grammar domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerDomain } from "../registry"
import { GRAMMAR_DOMAIN } from "./grammar_constants"
import { loadGrammarSeedVocabulary } from "./grammar_vocabularyManager"
import { grammarRunInference } from "./grammar_inferenceController"
import { grammarRunTrainingEpoch } from "./grammar_trainingController"
import { registerDomainFiles, watchDomainFiles } from "../dataRegistry"

export const grammarInit = async () => {
  await loadGrammarSeedVocabulary()

  registerDomainFiles(GRAMMAR_DOMAIN, [
    "src/ai/data/grammar/grammar_seedVocabulary.json",
    "src/ai/data/grammar/grammar_learnedData.json",
    "src/ai/data/grammar/grammar_webDocReferences.json",
    "src/ai/data/grammar/grammar_trainingWeights.bin",
    "src/ai/data/grammar/grammar_pretrained_weights.json",
    "src/ai/data/grammar/grammar_tokens.ts",
    "src/ai/data/grammar/grammar_tokenMap.ts",
    "src/ai/data/grammar/grammar_embeddings.ts",
    "src/ai/data/grammar/grammar_tokenizer.ts",
    "src/ai/data/grammar/grammar_parser.ts",
    "src/ai/data/grammar/grammar_semanticAnalyzer.ts",
    "src/ai/data/grammar/grammar_vocabularyManager.ts",
    "src/ai/data/grammar/grammar_learnedDataManager.ts",
    "src/ai/data/grammar/grammar_inferenceController.ts",
    "src/ai/data/grammar/grammar_trainingController.ts",
    "src/ai/data/grammar/grammar_modelWeightsLoader.ts",
    "src/ai/data/grammar/grammar_meta.json",
  ])

  try {
    watchDomainFiles(GRAMMAR_DOMAIN)
  } catch (e) {
    // ignore watch failures
  }

  registerDomain({
    name: GRAMMAR_DOMAIN,
    version: "0.1",
    initialize: async () => {
      await loadGrammarSeedVocabulary()
    },
    query: async (input: string) => grammarRunInference(input),
    train: async (opts?: Record<string, unknown>) => grammarRunTrainingEpoch(opts as { epochs?: number }),
  })
}

void grammarInit()

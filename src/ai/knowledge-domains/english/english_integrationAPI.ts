/**
 * File: src/ai/data/english/english_integrationAPI.ts
 * Purpose: Register the english domain into the new `src/ai/data/registry`.
 */

import { registerDomain } from '../registry';
import { ENGLISH_DOMAIN } from './english_constants';
import { loadEnglishSeedVocabulary } from './english_vocabularyManager';
import { englishRunInference } from './english_inferenceController';
import { englishRunTrainingEpoch } from './english_trainingController';
import { registerDomainFiles, watchDomainFiles } from '../dataRegistry';

export const englishInit = async () => {
  await loadEnglishSeedVocabulary();
  // Register domain files with the central data registry so orchestrator can track them
  registerDomainFiles(ENGLISH_DOMAIN, [
    'src/ai/data/english/english_seedVocabulary.json',
    'src/ai/data/english/english_learnedData.json',
    'src/ai/data/english/english_webDocReferences.json',
    'src/ai/data/english/english_trainingWeights.bin',
    'src/ai/data/english/english_pretrained_weights.json',
    'src/ai/data/english/english_tokens.ts',
    'src/ai/data/english/english_tokenMap.ts',
    'src/ai/data/english/english_embeddings.ts',
    'src/ai/data/english/english_tokenizer.ts',
    'src/ai/data/english/english_parser.ts',
    'src/ai/data/english/english_semanticAnalyzer.ts',
    'src/ai/data/english/english_vocabularyManager.ts',
    'src/ai/data/english/english_learnedDataManager.ts',
    'src/ai/data/english/english_inferenceController.ts',
    'src/ai/data/english/english_trainingController.ts',
    'src/ai/data/english/english_modelWeightsLoader.ts',
    'src/ai/data/english/english_meta.json',
  ]);
  // Optionally start fs watchers for domain files (best-effort)
  try {
    watchDomainFiles(ENGLISH_DOMAIN);
  } catch (e) {
    // ignore watch failures in constrained environments
  }
  registerDomain({
    name: ENGLISH_DOMAIN,
    version: '0.1',
    initialize: async () => {
      await loadEnglishSeedVocabulary();
    },
    query: async (input: string) => englishRunInference(input),
    train: async (opts?: Record<string, unknown>) =>
      englishRunTrainingEpoch(opts as { epochs?: number }),
  });
};

// Auto-register on import
void englishInit();

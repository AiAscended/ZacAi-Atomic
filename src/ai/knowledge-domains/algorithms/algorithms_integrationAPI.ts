/**
 * File: src/ai/data/algorithms/algorithms_integrationAPI.ts
 * Purpose: Register algorithms domain into central registry
 * Depends on: All algorithms domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { ALGORITHMS_DOMAIN } from "./algorithms_constants"
import { loadAlgorithmsSeedVocabulary } from "./algorithms_vocabularyManager"
import { algorithmsRunInference } from "./algorithms_inferenceController"
import { algorithmsRunTrainingEpoch } from "./algorithms_trainingController"

const DOMAIN_NAME = 'algorithms';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const algorithmsInit = async () => {
  await loadAlgorithmsSeedVocabulary()

}

void algorithmsInit()

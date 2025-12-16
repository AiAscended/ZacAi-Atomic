/**
 * File: src/ai/data/error_detection/error_detection_integrationAPI.ts
 * Purpose: Register error detection domain into central registry
 * Depends on: All error_detection domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { ERROR_DETECTION_DOMAIN } from "./error_detection_constants"
import { loadErrorDetectionSeedVocabulary } from "./error_detection_vocabularyManager"
import { errorDetectionRunInference } from "./error_detection_inferenceController"
import { errorDetectionRunTrainingEpoch } from "./error_detection_trainingController"

const DOMAIN_NAME = 'error_detection';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const errorDetectionInit = async () => {
  await loadErrorDetectionSeedVocabulary()

}

void errorDetectionInit()

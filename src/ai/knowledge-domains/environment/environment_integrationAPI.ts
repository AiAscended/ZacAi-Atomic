/**
 * File: src/ai/data/environment/environment_integrationAPI.ts
 * Purpose: Register environment domain into central registry
 * Depends on: All environment domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { ENVIRONMENT_DOMAIN } from "./environment_constants"
import { loadEnvironmentSeedVocabulary } from "./environment_vocabularyManager"
import { environmentRunInference } from "./environment_inferenceController"
import { environmentRunTrainingEpoch } from "./environment_trainingController"

const DOMAIN_NAME = 'environment';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const environmentInit = async () => {
  await loadEnvironmentSeedVocabulary()

}

void environmentInit()

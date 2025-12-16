/**
 * File: src/ai/data/testing/testing_integrationAPI.ts
 * Purpose: Register testing domain into central registry
 * Depends on: All testing domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { TESTING_DOMAIN } from "./testing_constants"
import { loadTestingSeedVocabulary } from "./testing_vocabularyManager"
import { testingRunInference } from "./testing_inferenceController"
import { testingRunTrainingEpoch } from "./testing_trainingController"

const DOMAIN_NAME = 'testing';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const testingInit = async () => {
  await loadTestingSeedVocabulary()

}

void testingInit()

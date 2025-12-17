/**
 * File: src/ai/data/documentation/documentation_integrationAPI.ts
 * Purpose: Register documentation domain into central registry
 * Depends on: All documentation domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { DOCUMENTATION_DOMAIN } from "./documentation_constants"
import { loadDocumentationSeedVocabulary } from "./documentation_vocabularyManager"
import { documentationRunInference } from "./documentation_inferenceController"
import { documentationRunTrainingEpoch } from "./documentation_trainingController"

const DOMAIN_NAME = 'documentation';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const documentationInit = async () => {
  await loadDocumentationSeedVocabulary()

}

void documentationInit()

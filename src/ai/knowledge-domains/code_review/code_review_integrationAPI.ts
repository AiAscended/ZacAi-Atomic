/**
 * File: src/ai/data/code_review/code_review_integrationAPI.ts
 * Purpose: Register code review domain into central registry
 * Depends on: All code_review domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { CODE_REVIEW_DOMAIN } from "./code_review_constants"
import { loadCodeReviewSeedVocabulary } from "./code_review_vocabularyManager"
import { codeReviewRunInference } from "./code_review_inferenceController"
import { codeReviewRunTrainingEpoch } from "./code_review_trainingController"

const DOMAIN_NAME = 'code_review';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const codeReviewInit = async () => {
  await loadCodeReviewSeedVocabulary()

}

void codeReviewInit()

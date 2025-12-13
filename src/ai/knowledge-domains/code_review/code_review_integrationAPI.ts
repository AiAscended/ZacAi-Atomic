/**
 * File: src/ai/data/code_review/code_review_integrationAPI.ts
 * Purpose: Register code review domain into central registry
 * Depends on: All code_review domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { CODE_REVIEW_DOMAIN } from "./code_review_constants"
import { loadCodeReviewSeedVocabulary } from "./code_review_vocabularyManager"

const DOMAIN_NAME = 'code_review';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const codeReviewInit = async () => {
  await loadCodeReviewSeedVocabulary()

  domainRegistry.registerDomain({
    name: CODE_REVIEW_DOMAIN,
    displayName: 'Code Review',
    description: 'Code quality analysis, best practices, and review feedback',
    atomicLevel: 'organ',
    modules: [],
    seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
    learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
    weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
    enabled: true
  });
}

void codeReviewInit()

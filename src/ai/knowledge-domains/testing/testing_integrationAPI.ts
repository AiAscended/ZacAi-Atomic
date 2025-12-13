/**
 * File: src/ai/data/testing/testing_integrationAPI.ts
 * Purpose: Register testing domain into central registry
 * Depends on: All testing domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { TESTING_DOMAIN } from "./testing_constants"
import { loadTestingSeedVocabulary } from "./testing_vocabularyManager"

const DOMAIN_NAME = 'testing';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const testingInit = async () => {
  await loadTestingSeedVocabulary()

  domainRegistry.registerDomain({
  name: TESTING_DOMAIN,
  displayName: 'Testing',
  description: 'Test design, test-driven development, and quality assurance',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
}

void testingInit()

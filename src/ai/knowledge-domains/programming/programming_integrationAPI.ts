/**
 * File: src/ai/data/programming/programming_integrationAPI.ts
 * Purpose: Integration API to register Programming domain with the central registry
 * Depends on: All programming domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { PROGRAMMING_DOMAIN } from "./programming_constants"
import { loadProgrammingSeedVocabulary } from "./programming_vocabularyManager"
import { programmingRunInference } from "./programming_inferenceController"
import { programmingRunTrainingEpoch } from "./programming_trainingController"

const DOMAIN_NAME = 'programming';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const programmingInit = async () => {
  await loadProgrammingSeedVocabulary()

  domainRegistry.registerDomain({
  name: PROGRAMMING_DOMAIN,
  displayName: 'Programming',
  description: 'General programming concepts, patterns, and paradigms',
  atomicLevel: 'organ',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
}

void programmingInit()

export default programmingInit

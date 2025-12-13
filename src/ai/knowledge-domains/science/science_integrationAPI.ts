/**
 * File: src/ai/data/science/science_integrationAPI.ts
 * Purpose: Register science domain into central registry
 * Depends on: All science domain modules
 * Depended on by: src/main.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { SCIENCE_DOMAIN } from "./science_constants"
import { loadScienceSeedVocabulary } from './science_vocabularyManager'

const DOMAIN_NAME = 'science';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const scienceInit = async () => {
  await loadScienceSeedVocabulary()

  domainRegistry.registerDomain({
  name: SCIENCE_DOMAIN,
  displayName: 'Science',
  description: 'Scientific concepts, research methods, and analysis',
  atomicLevel: 'cell',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
}

void scienceInit()

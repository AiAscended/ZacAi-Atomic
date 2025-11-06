/**
 * File: src/ai/data/nextjs/nextjs_integrationAPI.ts
 * Purpose: Integration API to register Next.js domain with the central registry
 * Depends on: All nextjs domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { domainRegistry } from '../domainRegistry'
import { NEXTJS_DOMAIN } from "./nextjs_constants"
import { loadNextjsSeedVocabulary } from "./nextjs_vocabularyManager"
import { nextjsRunInference } from "./nextjs_inferenceController"
import { nextjsRunTrainingEpoch } from "./nextjs_trainingController"

const DOMAIN_NAME = 'nextjs';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const nextjsInit = async () => {
  await loadNextjsSeedVocabulary()

  domainRegistry.registerDomain({
  name: NEXTJS_DOMAIN,
  displayName: 'Next.js',
  description: 'Next.js framework, server-side rendering, and app router',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_seeds`),
  learnedDataPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_learned`),
  weightsPath: path.join(DOMAIN_DIR, `${DOMAIN_NAME}_weights`),
  enabled: true
});
}

void nextjsInit()

export default nextjsInit

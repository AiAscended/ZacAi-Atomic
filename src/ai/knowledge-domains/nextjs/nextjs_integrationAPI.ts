/**
 * File: src/ai/data/nextjs/nextjs_integrationAPI.ts
 * Purpose: Integration API to register Next.js domain with the central registry
 * Depends on: All nextjs domain modules
 * Depended on by: src/main.ts, src/ai/data/registerAllDomains.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { NEXTJS_DOMAIN } from "./nextjs_constants"
import { loadNextjsSeedVocabulary } from "./nextjs_vocabularyManager"
import { nextjsRunInference } from "./nextjs_inferenceController"
import { nextjsRunTrainingEpoch } from "./nextjs_trainingController"

const DOMAIN_NAME = 'nextjs';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const nextjsInit = async () => {
  await loadNextjsSeedVocabulary()

}

void nextjsInit()

export default nextjsInit

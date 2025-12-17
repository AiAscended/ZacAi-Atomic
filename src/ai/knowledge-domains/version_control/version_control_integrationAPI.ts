/**
 * File: src/ai/data/version_control/version_control_integrationAPI.ts
 * Purpose: Register version_control domain into central registry
 * Depends on: All version_control domain modules
 * Depended on by: src/ai/data/registry.ts
 * Creator: Vercel v0 Coding Assistant
 */

import path from 'path'

import { VERSION_CONTROL_DOMAIN } from "./version_control_constants"
import { loadVersionControlSeedVocabulary } from "./version_control_vocabularyManager"

const DOMAIN_NAME = 'version_control';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);

export const versionControlInit = async () => {
  await loadVersionControlSeedVocabulary()

}

void versionControlInit()

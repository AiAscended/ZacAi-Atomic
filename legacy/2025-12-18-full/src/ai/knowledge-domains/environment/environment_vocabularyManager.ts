/**
 * File: src/ai/data/environment/environment_vocabularyManager.ts
 * Purpose: Load seed vocabulary for environment domain
 * Depends on: environment_utils.ts, storageAdapter.ts
 * Depended on by: environment_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./environment_utils";
import { storageAdapter } from "../storageAdapter";

export const loadEnvironmentSeedVocabulary = async (
  path = "/src/ai/knowledge-domains/environment/environment_seeds/environment_seedVocabulary.json",
) => {
  try {
    const content = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(content, { vocab: [] });
  } catch {
    return { vocab: [] };
  }
};

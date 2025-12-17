/**
 * File: src/ai/data/error_detection/error_detection_vocabularyManager.ts
 * Purpose: Load seed vocabulary for error detection domain
 * Depends on: error_detection_utils.ts, ../storageAdapter.ts
 * Depended on by: error_detection_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./error_detection_utils";
import { storageAdapter } from "../storageAdapter";

export type ErrorDetectionSeedVocabulary = {
  errorTypes: string[]
}

const DEFAULT_SEED_VOCAB_PATH =
  "/src/ai/knowledge-domains/error_detection/error_detection_seeds/error_detection_seedVocabulary.json"

const createDefaultSeedVocabulary = (): ErrorDetectionSeedVocabulary => ({ errorTypes: [] })

export const loadErrorDetectionSeedVocabulary = async (
  path = DEFAULT_SEED_VOCAB_PATH,
): Promise<ErrorDetectionSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { errorTypes: [] }) as { errorTypes: string[] };
  } catch (e) {
    return { errorTypes: [] };
  }
};

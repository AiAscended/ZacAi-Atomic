/**
 * File: src/ai/data/security/security_vocabularyManager.ts
 * Purpose: Load seed vocabulary for security domain
 * Depends on: security_utils.ts, ../storageAdapter.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./security_utils";
import { storageAdapter } from "../storageAdapter";

export const loadSecuritySeedVocabulary = async (
  path = "/src/ai/knowledge-domains/security/security_seeds/security_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { vulnerabilities: [] }) as {
      vulnerabilities: string[];
    };
  } catch (e) {
    return { vulnerabilities: [] };
  }
};

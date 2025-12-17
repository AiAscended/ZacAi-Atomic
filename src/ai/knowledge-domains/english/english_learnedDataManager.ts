/**
 * File: src/ai/data/english/english_learnedDataManager.ts
 * Purpose: Read/write learnedData for english domain (file-backed minimal implementation).
 */

import { storageAdapter } from "../storageAdapter";
import { safeParseJSON } from "./english_utils";

export const loadEnglishLearnedData = async (
  path = "/src/ai/knowledge-domains/english/english_learned/english_learnedData.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { notes: [], concepts: {} });
  } catch (e) {
    return { notes: [], concepts: {} };
  }
};

export const saveEnglishLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/english/english_learned/english_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    return false;
  }
};

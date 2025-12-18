/**
 * File: src/ai/data/algorithms/algorithms_learnedDataManager.ts
 * Purpose: Read/write learned data for algorithms domain
 * Depends on: algorithms_utils.ts, storageAdapter.ts
 * Depended on by: algorithms_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./algorithms_utils";
import { storageAdapter } from "../storageAdapter";

export const loadAlgorithmsLearnedData = async (
  path = "/src/ai/knowledge-domains/algorithms/algorithms_learned/algorithms_learnedData.json",
) => {
  try {
    const content = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(content, { notes: [], concepts: {} });
  } catch {
    return { notes: [], concepts: {} };
  }
};

export const saveAlgorithmsLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/algorithms/algorithms_learned/algorithms_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

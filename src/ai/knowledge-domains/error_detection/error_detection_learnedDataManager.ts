/**
 * File: src/ai/data/error_detection/error_detection_learnedDataManager.ts
 * Purpose: Read/write learned data for error detection domain
 * Depends on: error_detection_utils.ts, ../storageAdapter.ts
 * Depended on by: error_detection_trainingController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { safeParseJSON } from "./error_detection_utils";
import { storageAdapter } from "../storageAdapter";

export const loadErrorDetectionLearnedData = async (
  path = "/src/ai/knowledge-domains/error_detection/error_detection_learned/error_detection_learnedData.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { notes: [], concepts: {} });
  } catch (e) {
    return { notes: [], concepts: {} };
  }
};

export const saveErrorDetectionLearnedData = async (
  data: unknown,
  path = "/src/ai/knowledge-domains/error_detection/error_detection_learned/error_detection_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    return false;
  }
};

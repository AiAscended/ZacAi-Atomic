/**
 * File: src/ai/data/english/english_trainingController.ts
 * Purpose: Prefixed training controller for english domain (simulates training updates).
 */

import {
  loadEnglishLearnedData,
  saveEnglishLearnedData,
} from "./english_learnedDataManager";

type EnglishLearned = { notes: string[]; concepts: Record<string, unknown> };

export const englishRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadEnglishLearnedData()) as EnglishLearned;
  const epoch = opts?.epochs ?? 1;
  data.notes = data.notes || [];
  data.notes.push(
    `english trained ${epoch} epoch(s) at ${new Date().toISOString()}`,
  );
  await saveEnglishLearnedData(data);
  return { ok: true, epoch };
};

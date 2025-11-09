/**
 * File: src/ai/data/testing/testing_trainingController.ts
 * Purpose: Training controller for testing domain
 * Depends on: testing_learnedDataManager.ts
 * Depended on by: testing_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  loadTestingLearnedData,
  saveTestingLearnedData,
} from "./testing_learnedDataManager";

type TestingLearned = { notes: string[]; concepts: Record<string, unknown> };

export const testingRunTrainingEpoch = async (opts?: { epochs?: number }) => {
  const data = (await loadTestingLearnedData()) as TestingLearned;
  const epoch = opts?.epochs ?? 1;
  data.notes = data.notes || [];
  data.notes.push(
    `testing trained ${epoch} epoch(s) at ${new Date().toISOString()}`,
  );
  await saveTestingLearnedData(data);
  return { ok: true, epoch };
};

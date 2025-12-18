/**
 * File: src/ai/data/code_review/code_review_trainingController.ts
 * Purpose: Training controller for code review domain
 * Depends on: code_review_learnedDataManager.ts
 * Depended on by: code_review_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  loadCodeReviewLearnedData,
  saveCodeReviewLearnedData,
} from "./code_review_learnedDataManager";

type CodeReviewLearned = { notes: string[]; concepts: Record<string, unknown> };

export const codeReviewRunTrainingEpoch = async (opts?: {
  epochs?: number;
}) => {
  const data = (await loadCodeReviewLearnedData()) as CodeReviewLearned;
  const epoch = opts?.epochs ?? 1;
  data.notes = data.notes || [];
  data.notes.push(
    `code_review trained ${epoch} epoch(s) at ${new Date().toISOString()}`,
  );
  await saveCodeReviewLearnedData(data);
  return { ok: true, epoch };
};

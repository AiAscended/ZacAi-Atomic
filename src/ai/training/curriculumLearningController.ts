/**
 * File: src/ai/training/curriculumLearningController.ts
 * Purpose: Simple curriculum controller that orders batches by difficulty metadata.
 */

export const orderByDifficulty = (batches: { difficulty?: number; data: unknown[] }[]) =>
  batches.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0)).map((b) => b.data);

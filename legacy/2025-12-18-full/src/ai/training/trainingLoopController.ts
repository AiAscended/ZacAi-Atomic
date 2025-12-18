/**
 * File: src/ai/training/trainingLoopController.ts
 * Purpose: Minimal training loop controller that orchestrates epochs and batches for MVP.
 */

export type BatchFn = (batchIdx: number, batchData: unknown[]) => Promise<void>;

export const runTrainingLoop = async (
  epochs: number,
  batches: unknown[][],
  onBatch: BatchFn,
) => {
  for (let e = 0; e < epochs; e++) {
    for (let i = 0; i < batches.length; i++) {
      await onBatch(i, batches[i]);
    }
  }
};

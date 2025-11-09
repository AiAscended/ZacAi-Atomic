/**
 * File: src/ai/inference/earlyExitController.ts
 * Description: Provide a simple early-exit stopping criterion based on confidence.
 */

export const shouldEarlyExit = (
  confidences: number[],
  threshold = 0.9,
): boolean => {
  return confidences.some((c) => c >= threshold);
};

/**
 * File: src/ai/output_generation/temperatureController.ts
 * Purpose: Apply temperature to logits and sample (MVP deterministic softmax).
 */

export const softmax = (logits: number[], temperature = 1) => {
  const scaled = logits.map((l) => l / (temperature || 1));
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
};

/**
 * File: src/ai/training/learningRateScheduler.ts
 * Purpose: Minimal LR schedulers: step and linear warmup.
 */

export const stepLR = (initial: number, stepSize: number, gamma: number) => (epoch: number) =>
  initial * Math.pow(gamma, Math.floor(epoch / stepSize));

export const linearWarmup = (initial: number, warmupEpochs: number) => (epoch: number) =>
  epoch < warmupEpochs ? (epoch / (warmupEpochs || 1)) * initial : initial;

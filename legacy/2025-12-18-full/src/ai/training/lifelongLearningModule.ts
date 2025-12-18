/**
 * File: src/ai/training/lifelongLearningModule.ts
 * Purpose: Simple accumulator that stores novel examples for later replay training.
 */

const replayStore: string[] = [];

export const addToReplay = (example: string) => replayStore.push(example);
export const sampleReplay = (count = 10) => replayStore.slice(-count);

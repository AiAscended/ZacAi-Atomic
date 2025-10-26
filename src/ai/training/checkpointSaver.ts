/**
 * File: src/ai/training/checkpointSaver.ts
 * Purpose: Save and load lightweight JSON checkpoints for MVP.
 */

const checkpoints = new Map<string, unknown>();

export const saveCheckpoint = (name: string, data: unknown) => checkpoints.set(name, data);
export const loadCheckpoint = <T = unknown>(name: string): T | null =>
  (checkpoints.get(name) as T) ?? null;

/**
 * File: src/ai/data_pipeline/datasetVersionController.ts
 * Purpose: Track dataset versions using simple incrementing counters.
 */

const versions = new Map<string, number>();

export const bumpVersion = (dataset: string) => {
  const v = (versions.get(dataset) || 0) + 1;
  versions.set(dataset, v);
  return v;
};

export const getVersion = (dataset: string) => versions.get(dataset) ?? 0;

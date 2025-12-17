/**
 * File: src/ai/data_pipeline/dataCleaner.ts
 * Purpose: Small data cleaning utilities for text datasets.
 */

export const cleanText = (t: string) =>
  t
    .replace(/\s+/g, " ")
    // remove non-printable characters except common whitespace
    .replace(/[^\x20-\x7E\s]/g, "")
    .trim();

export const cleanBatch = (arr: string[]) => arr.map(cleanText);

/**
 * File: src/ai/data_pipeline/dataLakeManager.ts
 * Purpose: Minimal data lake manager that stores named datasets in memory (MVP).
 */

const lake = new Map<string, string[]>();

export const storeDataset = (name: string, rows: string[]) => lake.set(name, rows.slice());
export const readDataset = (name: string) => lake.get(name) ?? [];
export const listDatasets = () => Array.from(lake.keys());
export const deleteDataset = (name: string) => lake.delete(name);

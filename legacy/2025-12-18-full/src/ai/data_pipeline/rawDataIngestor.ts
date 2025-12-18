/**
 * File: src/ai/data_pipeline/rawDataIngestor.ts
 * Purpose: Simulated raw data ingestion for datasets (MVP).
 */

export const ingestFromSource = async (source: string): Promise<string[]> => {
  // Simulate reading lines or documents from a source
  return [
    `sample from ${source} 1`,
    `sample from ${source} 2`,
    `sample from ${source} 3`,
  ];
};

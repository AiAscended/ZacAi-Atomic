/**
 * File: src/ai/input_processing/videoFrameExtractor.ts
 * Description: Extract approximate frames indices for a given fps — placeholder for video I/O.
 */

export const frameTimestamps = (durationSeconds: number, fps = 30): number[] => {
  const frames = Math.ceil(durationSeconds * fps);
  const timestamps: number[] = [];
  for (let i = 0; i < frames; i++) timestamps.push(i / fps);
  return timestamps;
};

/**
 * File: src/ai/input_processing/imageResizer.ts
 * Description: Small utility to compute resized image dimensions keeping aspect ratio.
 * Dependencies: none
 */

export const computeResizedDimensions = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const wRatio = maxWidth / width;
  const hRatio = maxHeight / height;
  const r = Math.min(wRatio, hRatio, 1);
  return { width: Math.round(width * r), height: Math.round(height * r) };
};

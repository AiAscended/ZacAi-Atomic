/**
 * File: src/ai/input_processing/imageColorSpaceConverter.ts
 * Description: Small helper to convert pixels between color spaces (stub).
 * Dependencies: none
 * Note: This is a placeholder — for real conversion use a dedicated image library.
 */

export type RGB = { r: number; g: number; b: number };

export const rgbToGrayscale = (rgb: RGB): number => {
  // luminosity method
  return 0.21 * rgb.r + 0.72 * rgb.g + 0.07 * rgb.b;
};

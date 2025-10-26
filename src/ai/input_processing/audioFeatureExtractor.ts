/**
 * File: src/ai/input_processing/audioFeatureExtractor.ts
 * Description: Minimal audio feature extractor returning simple spectral features.
 * Dependencies: none
 */

export const extractSimpleFeatures = (samples: Float32Array, sampleRate = 16000): number[] => {
  // Very small placeholder: compute RMS per 20ms frame
  const frameSize = Math.floor(sampleRate * 0.02);
  const feats: number[] = [];
  for (let i = 0; i < samples.length; i += frameSize) {
    const slice = samples.subarray(i, i + frameSize);
    let sum = 0;
    for (let j = 0; j < slice.length; j++) sum += slice[j] * slice[j];
    const rms = Math.sqrt(sum / Math.max(1, slice.length));
    feats.push(rms);
  }
  return feats;
};

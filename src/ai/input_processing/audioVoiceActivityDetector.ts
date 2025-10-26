/**
 * File: src/ai/input_processing/audioVoiceActivityDetector.ts
 * Description: Minimal stub for Voice Activity Detection (VAD).
 * Dependencies: none
 * Role: Return simple frames marked as speech/non-speech. In real systems use WebRTC VAD.
 */

export interface VADFrame {
  timestamp: number;
  isSpeech: boolean;
}

export const voiceActivityDetector = (
  audioBuffer: Float32Array,
  sampleRate = 16000
): VADFrame[] => {
  // Minimal energy-based VAD: this is only a placeholder for MVP
  const frameSize = Math.floor(sampleRate * 0.02); // 20ms
  const frames: VADFrame[] = [];
  for (let i = 0; i < audioBuffer.length; i += frameSize) {
    const slice = audioBuffer.subarray(i, i + frameSize);
    let energy = 0;
    for (let j = 0; j < slice.length; j++) energy += Math.abs(slice[j]);
    const avg = energy / slice.length;
    frames.push({ timestamp: i / sampleRate, isSpeech: avg > 0.001 });
  }
  return frames;
};

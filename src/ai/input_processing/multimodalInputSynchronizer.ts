/**
 * File: src/ai/input_processing/multimodalInputSynchronizer.ts
 * Description: Aligns multimodal streams (audio/video/text) using timestamps.
 * Dependencies: videoFrameExtractor, audioFeatureExtractor
 */

// frameTimestamps is available in the same folder for convenience but not required here
import { frameTimestamps } from './videoFrameExtractor';

export interface StreamSample<T> {
  ts: number; // seconds
  payload: T;
}

export const synchronizeStreams = <A, V, T>(
  audio: StreamSample<A>[],
  video: StreamSample<V>[],
  text: StreamSample<T>[]
): Array<{ ts: number; audio?: A; video?: V; text?: T }> => {
  const allTs = new Set<number>();
  audio.forEach((s) => allTs.add(s.ts));
  video.forEach((s) => allTs.add(s.ts));
  text.forEach((s) => allTs.add(s.ts));
  const tsArr = Array.from(allTs).sort((a, b) => a - b);
  return tsArr.map((ts) => ({
    ts,
    audio: audio.find((a) => a.ts === ts)?.payload,
    video: video.find((v) => v.ts === ts)?.payload,
    text: text.find((t) => t.ts === ts)?.payload,
  }));
};

// small helper to expose timestamps (used in tests or higher-level orchestration)
export const sampleFrameTimestamps = (durationSeconds = 1, fps = 1) =>
  frameTimestamps(durationSeconds, fps);

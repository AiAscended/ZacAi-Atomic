/**
 * File: src/ai/data/error_detection/error_detection_url_lookup.ts
 * Purpose: Register canonical error detection reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

registerSource(
  "error_detection",
  "MDN Errors",
  "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors",
  "JavaScript error reference",
);
registerSource(
  "error_detection",
  "Stack Overflow",
  "https://stackoverflow.com",
  "Error solutions community",
);

export const errorDetectionSources = () => registerSource;
export default errorDetectionSources;

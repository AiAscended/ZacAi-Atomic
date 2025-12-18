/**
 * File: src/ai/data/algorithms/algorithms_url_lookup.ts
 * Purpose: Register canonical algorithms reference sources
 * Depends on: None
 * Depended on by: algorithms_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup"

registerSource(
  "algorithms",
  "Algorithm Visualizer",
  "https://algorithm-visualizer.org/",
  "Algorithm visualizations",
);
registerSource(
  "algorithms",
  "LeetCode",
  "https://leetcode.com/",
  "Algorithm practice problems",
);

export const algorithmsSources = () => registerSource;
export default algorithmsSources;

/**
 * File: src/ai/data/data_structures/data_structures_url_lookup.ts
 * Purpose: Register canonical data structures reference sources
 * Depends on: None
 * Depended on by: data_structures_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

registerSource(
  "data_structures",
  "GeeksforGeeks DS",
  "https://www.geeksforgeeks.org/data-structures/",
  "Data structures",
);
registerSource(
  "data_structures",
  "Visualgo",
  "https://visualgo.net/",
  "Data structure visualizations",
);

export const dataStructuresSources = () => registerSource;
export default dataStructuresSources;

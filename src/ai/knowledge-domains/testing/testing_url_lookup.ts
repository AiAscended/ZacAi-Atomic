/**
 * File: src/ai/data/testing/testing_url_lookup.ts
 * Purpose: Register canonical testing reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

registerSource(
  "testing",
  "Jest",
  "https://jestjs.io",
  "JavaScript testing framework",
);
registerSource(
  "testing",
  "Testing Library",
  "https://testing-library.com",
  "Testing utilities",
);

export const testingSources = () => registerSource;
export default testingSources;

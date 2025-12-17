/**
 * File: src/ai/data/version_control/version_control_url_lookup.ts
 * Purpose: Register canonical version control reference sources
 * Depends on: None
 * Depended on by: version_control_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup"

registerSource(
  "version_control",
  "Git Documentation",
  "https://git-scm.com/doc",
  "Official Git documentation",
);
registerSource(
  "version_control",
  "GitHub Guides",
  "https://guides.github.com/",
  "GitHub workflow guides",
);

export const versionControlSources = () => registerSource;
export default versionControlSources;

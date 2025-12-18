/**
 * File: src/ai/data/security/security_url_lookup.ts
 * Purpose: Register canonical security reference sources
 * Depends on: ../url_lookup.ts
 * Depended on by: None (auto-registers on import)
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

registerSource(
  "security",
  "OWASP",
  "https://owasp.org",
  "Web application security",
);
registerSource(
  "security",
  "Snyk",
  "https://snyk.io/learn",
  "Security vulnerability database",
);

export const securitySources = () => registerSource;
export default securitySources;

/**
 * File: src/ai/data/environment/environment_url_lookup.ts
 * Purpose: Register canonical environment/DevOps reference sources
 * Depends on: None
 * Depended on by: environment_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { registerSource } from "../url_lookup";

registerSource(
  "environment",
  "Docker Docs",
  "https://docs.docker.com/",
  "Docker documentation",
);
registerSource(
  "environment",
  "Kubernetes Docs",
  "https://kubernetes.io/docs/",
  "Kubernetes documentation",
);

export const environmentSources = () => registerSource;
export default environmentSources;

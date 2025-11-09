/**
 * File: src/ai/data/nextjs/nextjs_domainRegistrar.ts
 * Purpose: Register Next.js domain metadata and capabilities
 * Depends on: nextjs_constants.ts
 * Depended on by: nextjs_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { NEXTJS_DOMAIN } from "./nextjs_constants";

export interface NextjsDomainMetadata {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  keywords: string[];
}

export function getNextjsDomainMetadata(): NextjsDomainMetadata {
  return {
    name: NEXTJS_DOMAIN,
    version: "1.0.0",
    description:
      "Next.js React framework knowledge domain for full-stack web applications",
    capabilities: [
      "routing_explanation",
      "server_components",
      "data_fetching",
      "optimization",
      "deployment",
      "best_practices",
      "migration_guidance",
      "configuration",
    ],
    keywords: [
      "nextjs",
      "next.js",
      "app-router",
      "pages-router",
      "server-components",
      "server-actions",
      "route-handlers",
      "vercel",
      "deployment",
      "ssr",
      "ssg",
      "isr",
    ],
  };
}

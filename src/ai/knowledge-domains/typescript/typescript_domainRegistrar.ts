/**
 * File: src/ai/data/typescript/typescript_domainRegistrar.ts
 * Purpose: Registers TypeScript domain metadata with the module registry
 * Depends on: src/ai/data/typescript/typescript_constants.ts
 * Depended on by: src/ai/data/typescript/typescript_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./typescript_meta.json";
import { TYPESCRIPT_DOMAIN } from "./typescript_constants";

export const getDomainMeta = () => ({ ...meta, name: TYPESCRIPT_DOMAIN });

/**
 * File: src/ai/data/environment/environment_domainRegistrar.ts
 * Purpose: Domain registrar for environment domain
 * Depends on: environment_meta.json, environment_constants.ts
 * Depended on by: environment_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./environment_seeds/environment_meta.json";
import { ENVIRONMENT_DOMAIN } from "./environment_constants";

export const getDomainMeta = () => ({ ...meta, name: ENVIRONMENT_DOMAIN });

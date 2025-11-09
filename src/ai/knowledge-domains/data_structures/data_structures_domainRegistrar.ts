/**
 * File: src/ai/data/data_structures/data_structures_domainRegistrar.ts
 * Purpose: Domain registrar for data_structures domain
 * Depends on: data_structures_meta.json, data_structures_constants.ts
 * Depended on by: data_structures_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./data_structures_meta.json";
import { DATA_STRUCTURES_DOMAIN } from "./data_structures_constants";

export const getDomainMeta = () => ({ ...meta, name: DATA_STRUCTURES_DOMAIN });

/**
 * File: src/ai/data/algorithms/algorithms_domainRegistrar.ts
 * Purpose: Domain registrar for algorithms domain
 * Depends on: algorithms_meta.json, algorithms_constants.ts
 * Depended on by: algorithms_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./algorithms_meta.json"
import { ALGORITHMS_DOMAIN } from "./algorithms_constants"

export const getDomainMeta = () => ({ ...meta, name: ALGORITHMS_DOMAIN })

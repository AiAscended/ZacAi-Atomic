/**
 * File: src/ai/data/documentation/documentation_domainRegistrar.ts
 * Purpose: Domain registrar for documentation domain
 * Depends on: documentation_meta.json, documentation_constants.ts
 * Depended on by: documentation_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./documentation_seeds/documentation_meta.json"
import { DOCUMENTATION_DOMAIN } from "./documentation_constants"

export const getDomainMeta = () => ({ ...meta, name: DOCUMENTATION_DOMAIN })
export default getDomainMeta

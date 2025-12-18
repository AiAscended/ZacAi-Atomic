/**
 * File: src/ai/data/science/science_domainRegistrar.ts
 * Purpose: Domain registrar for science domain
 * Depends on: science_meta.json, science_constants.ts
 * Depended on by: science_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./science_meta.json"
import { SCIENCE_DOMAIN } from "./science_constants"

export const getDomainMeta = () => ({ ...meta, name: SCIENCE_DOMAIN })

export default getDomainMeta

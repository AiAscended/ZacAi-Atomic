/**
 * File: src/ai/data/testing/testing_domainRegistrar.ts
 * Purpose: Domain registrar for testing domain
 * Depends on: testing_meta.json, testing_constants.ts
 * Depended on by: testing_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./testing_seeds/testing_meta.json"
import { TESTING_DOMAIN } from "./testing_constants"

export const getDomainMeta = () => ({ ...meta, name: TESTING_DOMAIN });
export default getDomainMeta;

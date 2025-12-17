/**
 * File: src/ai/data/grammar/grammar_domainRegistrar.ts
 * Purpose: Domain registrar for grammar domain
 * Depends on: grammar_meta.json, grammar_constants.ts
 * Depended on by: grammar_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./grammar_seeds/grammar_meta.json"
import { GRAMMAR_DOMAIN } from "./grammar_constants"

export const getDomainMeta = () => ({ ...meta, name: GRAMMAR_DOMAIN });

export default getDomainMeta;

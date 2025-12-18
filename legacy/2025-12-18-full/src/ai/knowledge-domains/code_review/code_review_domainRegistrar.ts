/**
 * File: src/ai/data/code_review/code_review_domainRegistrar.ts
 * Purpose: Domain registrar for code review domain
 * Depends on: code_review_meta.json, code_review_constants.ts
 * Depended on by: code_review_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./code_review_seeds/code_review_meta.json"
import { CODE_REVIEW_DOMAIN } from "./code_review_constants"

export const getDomainMeta = () => ({ ...meta, name: CODE_REVIEW_DOMAIN });

export default getDomainMeta;

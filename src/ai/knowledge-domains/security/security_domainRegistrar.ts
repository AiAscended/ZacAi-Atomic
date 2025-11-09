/**
 * File: src/ai/data/security/security_domainRegistrar.ts
 * Purpose: Domain registrar for security domain
 * Depends on: security_meta.json, security_constants.ts
 * Depended on by: security_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./security_seeds/security_meta.json";
import { SECURITY_DOMAIN } from "./security_constants";

export const getDomainMeta = () => ({ ...meta, name: SECURITY_DOMAIN });
export default getDomainMeta;

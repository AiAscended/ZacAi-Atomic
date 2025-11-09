/**
 * File: src/ai/data/version_control/version_control_domainRegistrar.ts
 * Purpose: Domain registrar for version_control domain
 * Depends on: version_control_meta.json, version_control_constants.ts
 * Depended on by: version_control_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./version_control_meta.json";
import { VERSION_CONTROL_DOMAIN } from "./version_control_constants";

export const getDomainMeta = () => ({ ...meta, name: VERSION_CONTROL_DOMAIN });

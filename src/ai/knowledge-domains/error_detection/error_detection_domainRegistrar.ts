/**
 * File: src/ai/data/error_detection/error_detection_domainRegistrar.ts
 * Purpose: Domain registrar for error detection domain
 * Depends on: error_detection_meta.json, error_detection_constants.ts
 * Depended on by: error_detection_integrationAPI.ts
 * Creator: Vercel v0 Coding Assistant
 */

import meta from "./error_detection_seeds/error_detection_meta.json";
import { ERROR_DETECTION_DOMAIN } from "./error_detection_constants";

export const getDomainMeta = () => ({ ...meta, name: ERROR_DETECTION_DOMAIN });
export default getDomainMeta;

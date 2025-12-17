/**
 * File: src/ai/data/english/english_domainRegistrar.ts
 * Purpose: Domain registrar for the english domain (prefixed, new canonical location).
 */

import meta from "./english_seeds/english_meta.json";
import { ENGLISH_DOMAIN } from "./english_constants";

export const getDomainMeta = () => ({ ...meta, name: ENGLISH_DOMAIN });

export default getDomainMeta;

import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

import { storageAdapter } from "../storageAdapter";

export const securityLoadWeights = async (
  path = "/src/ai/knowledge-domains/security/security_weights/security_trainingWeights.bin",
) => {
  try {
    const raw = await storageAdapter.readFile(path);
    return raw;
  } catch (e) {
    return null;
  }
};

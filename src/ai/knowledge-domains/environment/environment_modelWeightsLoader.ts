import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

import { storageAdapter } from "../storageAdapter";

export const environmentLoadWeights = async (
  path = "/src/ai/knowledge-domains/environment/environment_weights/environment_trainingWeights.bin",
) => {
  try {
    const buffer = await storageAdapter.readFile(path);
    return { success: true, weights: buffer };
  } catch {
    return { success: false, weights: null };
  }
};

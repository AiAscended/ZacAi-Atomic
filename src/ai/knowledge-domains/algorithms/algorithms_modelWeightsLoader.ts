import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

import { storageAdapter } from "../storageAdapter";

export const algorithmsLoadWeights = async (
  path = "/src/ai/knowledge-domains/algorithms/algorithms_weights/algorithms_trainingWeights.bin",
) => {
  try {
    const buffer = await storageAdapter.readFile(path);
    return { success: true, weights: buffer };
  } catch {
    return { success: false, weights: null };
  }
};

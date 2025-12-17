import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

import { storageAdapter } from "../storageAdapter";

export const dataStructuresLoadWeights = async (
  path = "/src/ai/knowledge-domains/data_structures/data_structures_weights/data_structures_trainingWeights.bin",
) => {
  try {
    const buffer = await storageAdapter.readFile(path);
    return { success: true, weights: buffer };
  } catch {
    return { success: false, weights: null };
  }
};

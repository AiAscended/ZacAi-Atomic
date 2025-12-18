import { createDomainWeightsManager } from "../../shared/weights/domainWeightsLoaderFactory"

import { storageAdapter } from "../storageAdapter";

export const scienceLoadWeights = async (
  path = "/src/ai/knowledge-domains/science/science_weights/science_trainingWeights.bin",
) => {
  try {
    const raw = await storageAdapter.readFile(path);
    return raw;
  } catch (e) {
    return null;
  }
};

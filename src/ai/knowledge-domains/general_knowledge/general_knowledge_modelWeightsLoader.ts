import { storageAdapter } from "../storageAdapter";

export const generalLoadWeights = async (
  path = "/src/ai/data/general/general_trainingWeights.bin",
) => {
  try {
    const raw = await storageAdapter.readFile(path);
    return raw;
  } catch (e) {
    return null;
  }
};

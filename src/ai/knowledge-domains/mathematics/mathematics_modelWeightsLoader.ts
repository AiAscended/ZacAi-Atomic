import { storageAdapter } from "../storageAdapter"

export const mathematicsLoadWeights = async (path = "/src/ai/data/mathematics/mathematics_trainingWeights.bin") => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}

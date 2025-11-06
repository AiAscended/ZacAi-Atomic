import { storageAdapter } from "../storageAdapter"

export const mathematicsLoadWeights = async (path = "/src/ai/knowledge-domains/mathematics/mathematics_weights/mathematics_trainingWeights.bin") => {
  try {
    const raw = await storageAdapter.readFile(path)
    return raw
  } catch (e) {
    return null
  }
}

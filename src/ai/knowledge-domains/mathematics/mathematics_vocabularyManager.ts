import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./mathematics_utils"

export const loadMathematicsSeedVocabulary = async (
  path = "/src/ai/knowledge-domains/mathematics/mathematics_seeds/mathematics_seedVocabulary.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] }
  } catch (e) {
    return { terms: [] }
  }
}

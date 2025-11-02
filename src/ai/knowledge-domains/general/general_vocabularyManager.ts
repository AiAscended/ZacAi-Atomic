import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./general_utils"

export const loadGeneralSeedVocabulary = async (path = "/src/ai/data/general/general_seedVocabulary.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] }
  } catch (e) {
    return { terms: [] }
  }
}

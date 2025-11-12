import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./general_knowledge_utils"

export const loadGeneralSeedVocabulary = async (path = "/src/ai/knowledge-domains/general_knowledge/general_knowledge_seeds/general_knowledge_seedVocabulary.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { terms: [] }) as { terms: string[] }
  } catch (e) {
    return { terms: [] }
  }
}

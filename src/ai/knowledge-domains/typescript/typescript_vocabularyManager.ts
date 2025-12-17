import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./typescript_utils"

const DEFAULT_VOCAB_PATH = "/src/ai/knowledge-domains/typescript/typescript_seeds/typescript_seedVocabulary.json"

export interface TypescriptSeedVocabulary {
  terms: string[]
}

export const loadTypescriptSeedVocabulary = async (
  path = DEFAULT_VOCAB_PATH,
): Promise<TypescriptSeedVocabulary> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<TypescriptSeedVocabulary>(raw, { terms: [] })
  } catch (error) {
    console.warn("[TypeScript] Unable to read seed vocabulary:", error)
    return { terms: [] }
  }
}

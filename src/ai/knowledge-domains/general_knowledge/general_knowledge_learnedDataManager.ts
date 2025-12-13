import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./general_knowledge_utils"

export type GeneralLearnedData = {
  notes: string[]
  concepts: Record<string, unknown>
}

const DEFAULT_LEARNED_DATA_PATH =
  "/src/ai/knowledge-domains/general_knowledge/general_knowledge_learned/general_knowledge_learnedData.json"

const createDefaultLearnedData = (): GeneralLearnedData => ({ notes: [], concepts: {} })

export const loadGeneralLearnedData = async (
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<GeneralLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<GeneralLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.error("[general-knowledge][learned-data] Failed to load learned data", { path, error })
    return createDefaultLearnedData()
  }
}

export const saveGeneralLearnedData = async (
  data: GeneralLearnedData,
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[general-knowledge][learned-data] Failed to persist learned data", { path, error })
    return false
  }
}

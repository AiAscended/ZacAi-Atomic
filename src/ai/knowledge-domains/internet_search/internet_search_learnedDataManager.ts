import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./internet_search_utils"

export type InternetSearchLearnedData = {
  notes: string[]
  indexes: Record<string, unknown>
}

const DEFAULT_LEARNED_DATA_PATH =
  "/src/ai/knowledge-domains/internet_search/internet_search_learned/internet_search_learnedData.json"

const createDefaultLearnedData = (): InternetSearchLearnedData => ({ notes: [], indexes: {} })

export const loadInternetSearchLearnedData = async (
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<InternetSearchLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<InternetSearchLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.error("[internet-search][learned-data] Failed to load learned data", { path, error })
    return createDefaultLearnedData()
  }
}

export const saveInternetSearchLearnedData = async (
  data: InternetSearchLearnedData,
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[internet-search][learned-data] Failed to persist learned data", { path, error })
    return false
  }
}

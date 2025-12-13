import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./mathematics_utils"

export type MathematicsLearnedData = {
  notes: string[]
  concepts: Record<string, unknown>
}

const DEFAULT_LEARNED_DATA_PATH =
  "/src/ai/knowledge-domains/mathematics/mathematics_learned/mathematics_learnedData.json"

const createDefaultLearnedData = (): MathematicsLearnedData => ({ notes: [], concepts: {} })

export const loadMathematicsLearnedData = async (
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<MathematicsLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<MathematicsLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.error("[mathematics][learned-data] Failed to load learned data", { path, error })
    return createDefaultLearnedData()
  }
}

export const saveMathematicsLearnedData = async (
  data: MathematicsLearnedData,
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[mathematics][learned-data] Failed to persist learned data", { path, error })
    return false
  }
}

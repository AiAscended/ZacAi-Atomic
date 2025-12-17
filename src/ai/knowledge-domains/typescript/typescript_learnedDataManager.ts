import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./typescript_utils"

const DEFAULT_LEARNED_PATH = "/src/ai/knowledge-domains/typescript/typescript_learned/typescript_learnedData.json"

export interface TypescriptInteractionRecord {
  input: unknown
  output: unknown
  timestamp: number
}

export interface TypescriptLearnedData {
  notes: string[]
  concepts: Record<string, unknown>
  interactions: TypescriptInteractionRecord[]
}

const createDefaultLearnedData = (): TypescriptLearnedData => ({
  notes: [],
  concepts: {},
  interactions: [],
})

export const loadTypescriptLearnedData = async (
  path = DEFAULT_LEARNED_PATH,
): Promise<TypescriptLearnedData> => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON<TypescriptLearnedData>(raw, createDefaultLearnedData())
  } catch (error) {
    console.warn("[TypeScript] Falling back to default learned data due to read error:", error)
    return createDefaultLearnedData()
  }
}

export const saveTypescriptLearnedData = async (
  data: TypescriptLearnedData,
  path = DEFAULT_LEARNED_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("[TypeScript] Failed to persist learned data:", error)
    return false
  }
}

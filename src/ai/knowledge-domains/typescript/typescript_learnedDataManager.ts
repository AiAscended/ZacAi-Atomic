import { storageAdapter } from "../storageAdapter"
import { safeParseJSON } from "./typescript_utils"

export const loadTypescriptLearnedData = async (path = "/src/ai/data/typescript/typescript_learnedData.json") => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8")
    return safeParseJSON(raw, { notes: [], concepts: {} })
  } catch (e) {
    return { notes: [], concepts: {} }
  }
}

export const saveTypescriptLearnedData = async (
  data: unknown,
  path = "/src/ai/data/typescript/typescript_learnedData.json",
) => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2))
    return true
  } catch (e) {
    return false
  }
}

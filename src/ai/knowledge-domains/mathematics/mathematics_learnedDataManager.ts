import { storageAdapter } from "../storageAdapter";
import { safeParseJSON } from "./mathematics_utils";

export const loadMathematicsLearnedData = async (
  path = "/src/ai/knowledge-domains/mathematics/mathematics_learned/mathematics_learnedData.json",
) => {
  try {
    const raw = await storageAdapter.readFile(path, "utf-8");
    return safeParseJSON(raw, { notes: [], concepts: {} });
  } catch (e) {
    return { notes: [], concepts: {} };
  }
};

export const saveMathematicsLearnedData = async (
  data: MathematicsLearnedData,
  path = DEFAULT_LEARNED_DATA_PATH,
): Promise<boolean> => {
  try {
    await storageAdapter.writeFile(path, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    return false;
  }
};

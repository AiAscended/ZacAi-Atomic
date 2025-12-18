import MATHEMATICS_CORE_TOKENS from "./mathematics_tokens";

/**
 * Build a stable token -> id map for Mathematics.
 * Reserve small integer ids for special tokens: [PAD]=0, [UNK]=1, [CLS]=2, [SEP]=3, [MASK]=4
 */
export const buildMathematicsTokenMap = (vocabSize = 512) => {
  const map = new Map<string, number>();
  const reserved = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"];
  reserved.forEach((t, i) => map.set(t, i));

  let idx = RESERVED_TOKENS.length
  for (const token of MATHEMATICS_CORE_TOKENS) {
    if (map.has(token)) continue
    map.set(token, idx++)
  }

  while (idx < vocabSize) {
    map.set(`math_tok_${String(idx).padStart(4, "0")}`, idx++);
  }

  return map
}

export const mathematicsTokenMap = buildMathematicsTokenMap()

export const getMathematicsTokenId = (token: string): number =>
  mathematicsTokenMap.get(token) ?? mathematicsTokenMap.get("[UNK]")!;

export const getMathematicsTokenById = (id: number): string | undefined => {
  for (const [k, v] of mathematicsTokenMap.entries()) if (v === id) return k
  return undefined
}

export const mathematicsTokenCount = () => mathematicsTokenMap.size

const mathematics_tokenMap_bundle = {
  mathematicsTokenMap,
  getMathematicsTokenId,
  getMathematicsTokenById,
  mathematicsTokenCount,
};

export default mathematics_tokenMap_bundle;

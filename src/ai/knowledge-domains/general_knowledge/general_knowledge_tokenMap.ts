import TOKENS from "./general_knowledge_tokens"

const RESERVED_TOKENS = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] as const

export const buildGeneralTokenMap = () => {
  const tokenToId = new Map<string, number>()
  RESERVED_TOKENS.forEach((token, index) => tokenToId.set(token, index))
  let nextId = RESERVED_TOKENS.length

  for (const token of TOKENS) {
    if (!tokenToId.has(token)) {
      tokenToId.set(token, nextId++)
    }
  }

  return tokenToId
}

const general_knowledge_tokenMap_bundle = { getGeneralTokenId, getGeneralTokenById, generalTokenCount, generalTokenMap };

export default general_knowledge_tokenMap_bundle;

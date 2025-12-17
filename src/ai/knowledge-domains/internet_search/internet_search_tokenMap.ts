import TOKENS from "./internet_search_tokens"

const RESERVED_TOKENS = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"] as const

export const buildInternetSearchTokenMap = () => {
  const tokenToId = new Map<string, number>()
  RESERVED_TOKENS.forEach((token, index) => tokenToId.set(token, index))

  let nextId = RESERVED_TOKENS.length
  for (const token of TOKENS) {
    if (tokenToId.has(token)) continue
    tokenToId.set(token, nextId++)
  }

  return tokenToId
}

const internet_search_tokenMap_bundle = {
  getInternetSearchTokenId,
  getInternetSearchTokenById,
  internetSearchTokenCount,
  internetSearchTokenMap,
};

export default internet_search_tokenMap_bundle;

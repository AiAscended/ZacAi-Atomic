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

export const internetSearchTokenMap = buildInternetSearchTokenMap()

export const getInternetSearchTokenId = (token: string): number | undefined =>
  internetSearchTokenMap.get(token)

export const getInternetSearchTokenById = (id: number): string | undefined => {
  for (const [token, tokenId] of internetSearchTokenMap.entries()) {
    if (tokenId === id) return token
  }
  return undefined
}

export const internetSearchTokenCount = () => internetSearchTokenMap.size

const internetSearchTokenExports = {
  internetSearchTokenMap,
  getInternetSearchTokenId,
  getInternetSearchTokenById,
  internetSearchTokenCount,
}

export default internetSearchTokenExports

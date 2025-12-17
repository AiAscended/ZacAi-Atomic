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

export const generalTokenMap = buildGeneralTokenMap()

export const getGeneralTokenId = (token: string): number => {
  return generalTokenMap.get(token) ?? generalTokenMap.get("[UNK]")!
}

export const getGeneralTokenById = (id: number): string | undefined => {
  for (const [token, idx] of generalTokenMap.entries()) {
    if (idx === id) return token
  }
  return undefined
}

export const generalTokenCount = () => generalTokenMap.size

const generalTokenMapExports = {
  generalTokenMap,
  getGeneralTokenId,
  getGeneralTokenById,
  generalTokenCount,
}

export default generalTokenMapExports

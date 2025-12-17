import ENGLISH_CORE_TOKENS from './english_tokens';

/**
 * Build a stable token -> id map for English.
 * Reserve small integer ids for special tokens for compatibility with model I/O.
 * [PAD]=0, [UNK]=1, [CLS]=2, [SEP]=3, [MASK]=4, then domain tokens start at 5.
 */
export const buildEnglishTokenMap = () => {
  const map = new Map<string, number>();
  // reserved tokens
  const reserved = ['[PAD]', '[UNK]', '[CLS]', '[SEP]', '[MASK]'];
  reserved.forEach((t, i) => map.set(t, i));

  // start domain tokens after reserved
  let idx = reserved.length;
  for (const t of ENGLISH_CORE_TOKENS) {
    if (map.has(t)) continue; // skip if reserved or duplicate
    map.set(t, idx++);
  }

  return map;
};

export const englishTokenMap = buildEnglishTokenMap();

export const getEnglishTokenId = (token: string): number => {
  return englishTokenMap.get(token) ?? englishTokenMap.get('[UNK]')!;
};

export const getEnglishTokenById = (id: number): string | undefined => {
  for (const [k, v] of englishTokenMap.entries()) if (v === id) return k;
  return undefined;
};

export const englishTokenCount = () => englishTokenMap.size;

const english_tokenMap_bundle = { englishTokenMap, getEnglishTokenId, getEnglishTokenById, englishTokenCount };

export default english_tokenMap_bundle;

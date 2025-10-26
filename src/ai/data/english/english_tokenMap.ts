import ENGLISH_CORE_TOKENS from './english_tokens';

/**
 * Map core tokens to stable integer ids for the English domain.
 * This simple mapper assigns small integers starting at 1.
 */
export const buildEnglishTokenMap = () => {
  const map = new Map<string, number>();
  ENGLISH_CORE_TOKENS.forEach((t, i) => map.set(t, i + 1));
  return map;
};

export const englishTokenMap = buildEnglishTokenMap();

export default englishTokenMap;

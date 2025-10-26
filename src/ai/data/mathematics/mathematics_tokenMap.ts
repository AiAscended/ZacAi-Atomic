import MATHEMATICS_CORE_TOKENS from './mathematics_tokens';

/**
 * Build a token -> id map for mathematics domain. Includes core tokens and synthetic filler tokens.
 * Default vocab size: 512 (core tokens + synthetic tokens math_tok_0001...).
 */
export const buildMathematicsTokenMap = (vocabSize = 512) => {
  const map = new Map<string, number>();
  let idx = 1;
  for (const t of MATHEMATICS_CORE_TOKENS) map.set(t, idx++);
  while (idx <= vocabSize) {
    map.set(`math_tok_${String(idx).padStart(4, '0')}`, idx++);
  }
  return map;
};

export const mathematicsTokenMap = buildMathematicsTokenMap();

export default mathematicsTokenMap;

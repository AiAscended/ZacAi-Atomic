import { normalizeText } from './general_utils';

export const generalTokenizer = (text: string) => {
  const t = normalizeText(text).toLowerCase();
  const tokens = t.split(/\W+/).filter(Boolean);
  return { tokens, length: tokens.length };
};

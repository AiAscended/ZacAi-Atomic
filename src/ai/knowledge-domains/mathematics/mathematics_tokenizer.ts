import { normalizeText } from "./mathematics_utils";

export const mathematicsTokenizer = (text: string) => {
  const t = normalizeText(text);
  // split by spaces and punctuation but keep math symbols
  const tokens = t
    .split(/([()+\-*/=^]|\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { tokens, length: tokens.length };
};

/**
 * File: src/ai/data_pipeline/dataAugmentation.ts
 * Purpose: Small data augmentation routines for text (synonym swap, simple back-translation stub).
 */

export const synonymSwap = (
  text: string,
  replacements: Record<string, string[]>,
) => {
  // Replace one token randomly if it has synonyms
  const toks = text.split(/(\s+)/);
  for (let i = 0; i < toks.length; i++) {
    const key = toks[i].toLowerCase().replace(/\W+/g, "");
    const opts = replacements[key];
    if (opts && opts.length) {
      toks[i] = opts[Math.floor(Math.random() * opts.length)];
      break;
    }
  }
  return toks.join("");
};

export const backTranslationStub = async (text: string) => {
  // In production, call external translation APIs. Here return the original text as a stub.
  return text;
};

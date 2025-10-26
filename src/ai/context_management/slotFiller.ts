/**
 * File: src/ai/context_management/slotFiller.ts
 * Purpose: Minimal slot filler that extracts simple key/value pairs using regex.
 */

export const extractSlots = (text: string, slotNames: string[]): Record<string, string | null> => {
  const res: Record<string, string | null> = {};
  for (const s of slotNames) {
    const re = new RegExp(`${s}[:=]\\s*([\\w-]+)`, 'i');
    const m = text.match(re);
    res[s] = m ? m[1] : null;
  }
  return res;
};

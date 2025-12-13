/**
 * File: src/ai/output_generation/translator.ts
 * Purpose: Minimal translator stub (passthrough for MVP or simple mapping)
 */

export const translate = async (text: string, targetLang = 'en') => {
  // Stub: echo result while making it clear what language was requested
  if (targetLang !== 'en') {
    console.log(`[translator] passthrough mode for target language: ${targetLang}`);
  }
  return text;
};

/**
 * File: src/ai/data_pipeline/dataAnonymizer.ts
 * Purpose: Simple anonymizer replacing emails and phone-like patterns.
 */

export const anonymizeText = (text: string) =>
  text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi, "[EMAIL]")
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]");

/**
 * File: src/ai/output_generation/codeFormatter.ts
 * Purpose: Minimal code formatting helper (very small indentation fix for MVP).
 */

export const simpleFormat = (code: string) => code.replace(/\t/g, "  ").trim();

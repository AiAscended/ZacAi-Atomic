/**
 * File: src/ai/input_processing/languageDetector.ts
 * Description: Tiny language detector using character frequency heuristics.
 * Dependencies: none
 * Role: Provide a best-effort ISO language code for short texts.
 */

export const detectLanguage = (text: string): string => {
  const t = text.toLowerCase();
  if (/\b(el|the)\b/.test(t)) return "en";
  if (/[\u0400-\u04FF]/.test(t)) return "ru";
  if (/[\u4e00-\u9fff]/.test(t)) return "zh";
  return "en";
};

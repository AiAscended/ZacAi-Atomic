/**
 * File: src/ai/data_pipeline/schemaValidator.ts
 * Purpose: Minimal schema validator that checks required keys in JSON records.
 */

export const validateRecord = (record: Record<string, unknown>, required: string[]) => {
  const missing = required.filter((k) => !(k in record));
  return { valid: missing.length === 0, missing };
};

/**
 * File: src/ai/data_pipeline/syntheticDataGenerator.ts
 * Purpose: Generate simple synthetic text examples from templates.
 */

export const generateFromTemplate = (
  template: string,
  values: Record<string, string[]>,
  count = 5,
) => {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let s = template;
    for (const k of Object.keys(values)) {
      const opts = values[k];
      s = s.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), opts[i % opts.length]);
    }
    out.push(s);
  }
  return out;
};

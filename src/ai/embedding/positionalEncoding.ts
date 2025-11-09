/**
 * File: src/ai/embedding/positionalEncoding.ts
 * Description: Compute simple sinusoidal positional encodings.
 */

export const positionalEncoding = (
  length: number,
  depth: number,
): number[][] => {
  const out: number[][] = [];
  for (let pos = 0; pos < length; pos++) {
    const row: number[] = [];
    for (let i = 0; i < depth; i++) {
      const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / depth);
      row.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
    }
    out.push(row);
  }
  return out;
};

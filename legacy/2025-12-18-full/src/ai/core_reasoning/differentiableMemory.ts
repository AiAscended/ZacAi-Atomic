/**
 * File: src/ai/core_reasoning/differentiableMemory.ts
 * Description: Small key-value memory that supports read/write with simple attention.
 */

export class DifferentiableMemory<V> {
  private keys: number[][] = [];
  private values: V[] = [];

  write(key: number[], value: V) {
    this.keys.push(key);
    this.values.push(value);
  }

  read(query: number[]): V | null {
    if (this.keys.length === 0) return null;
    // return nearest neighbor (dot product)
    let best = 0;
    let bestIdx = 0;
    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[i];
      let s = 0;
      for (let j = 0; j < Math.min(k.length, query.length); j++)
        s += k[j] * query[j];
      if (i === 0 || s > best) {
        best = s;
        bestIdx = i;
      }
    }
    return this.values[bestIdx] ?? null;
  }
}

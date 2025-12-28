/**
 * Determinism Utilities
 * Ensures reproducible behavior for kernel operations
 */

/**
 * Deterministic hash function (32-bit)
 * Same input always produces same output
 * Useful for seeding RNGs and validation
 */
export function deterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator
 * Deterministic: same seed = same sequence
 */
export class DeterministicRandom {
  constructor(private seed: number) {}

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Verify operation determinism
 * Runs operation N times, verifies all outputs match
 */
export function verifyDeterminism<T>(
  operation: () => T,
  runs: number = 3
): boolean {
  const results: string[] = [];

  for (let i = 0; i < runs; i++) {
    results.push(JSON.stringify(operation()));
  }

  return results.every((r) => r === results[0]);
}


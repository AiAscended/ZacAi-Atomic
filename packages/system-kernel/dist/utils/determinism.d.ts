/**
 * Determinism Utilities
 * Ensures reproducible behavior for kernel operations
 */
/**
 * Deterministic hash function (32-bit)
 * Same input always produces same output
 * Useful for seeding RNGs and validation
 */
export declare function deterministicHash(input: string): number;
/**
 * Seeded pseudo-random number generator
 * Deterministic: same seed = same sequence
 */
export declare class DeterministicRandom {
    private seed;
    constructor(seed: number);
    next(): number;
    nextInt(max: number): number;
}
/**
 * Verify operation determinism
 * Runs operation N times, verifies all outputs match
 */
export declare function verifyDeterminism<T>(operation: () => T, runs?: number): boolean;
//# sourceMappingURL=determinism.d.ts.map
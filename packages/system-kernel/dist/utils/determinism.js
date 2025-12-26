"use strict";
/**
 * Determinism Utilities
 * Ensures reproducible behavior for kernel operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeterministicRandom = void 0;
exports.deterministicHash = deterministicHash;
exports.verifyDeterminism = verifyDeterminism;
/**
 * Deterministic hash function (32-bit)
 * Same input always produces same output
 * Useful for seeding RNGs and validation
 */
function deterministicHash(input) {
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
class DeterministicRandom {
    seed;
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    nextInt(max) {
        return Math.floor(this.next() * max);
    }
}
exports.DeterministicRandom = DeterministicRandom;
/**
 * Verify operation determinism
 * Runs operation N times, verifies all outputs match
 */
function verifyDeterminism(operation, runs = 3) {
    const results = [];
    for (let i = 0; i < runs; i++) {
        results.push(JSON.stringify(operation()));
    }
    return results.every((r) => r === results[0]);
}
//# sourceMappingURL=determinism.js.map
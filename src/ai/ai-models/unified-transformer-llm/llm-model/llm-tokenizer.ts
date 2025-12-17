/**
 * File: src/ai/ai-models/unified-transformer-llm/llm-model/llm-tokenizer.ts
 * Purpose: Implements a Byte Pair Encoding (BPE)-style tokenizer for the Unified Transformer LLM.
 * This includes support for vocabulary mapping, encoding input text to token IDs, decoding tokens back to text,
 * and placeholders for subword merges and byte-level processing that production-grade implementations require.
 *
 * Dependencies:
 * - src/ai/ai-models/unified-transformer-llm/llm-data/llm-tokenizerConfig.json (vocabulary data)
 *
 * Depended on by:
 * - src/ai/ai-models/unified-transformer-llm/llm-model/llm-embedding.ts
 * - src/ai/ai-models/unified-transformer-llm/llm-inference/llm-inferenceEngine.ts
 * - src/ai/orchestration/ - indirectly via inference calls
 */

import fs from 'fs';
import path from 'path';

// Interface for vocabulary, containing token-to-id and id-to-token maps
interface Vocabulary {
  tokenToId: Record<string, number>;
  idToToken: Record<number, string>;
  bpeMerges: Map<string, number>;
}

// Load vocabulary and BPE merges (would normally be trained externally)
const vocabPath = path.resolve(__dirname, '../llm-data/llm-tokenizerConfig.json');
const vocabDataRaw = fs.readFileSync(vocabPath, 'utf8');
const vocabDataParsed = JSON.parse(vocabDataRaw) as {
  tokenToId: Record<string, number>;
  idToToken: Record<string, string>;
  bpeMergesList: [string, string][];
};

// Convert merges list to map for quick lookup
const bpeMerges: Map<string, number> = new Map(
  vocabDataParsed.bpeMergesList.map((pair, idx) => [pair.join(''), idx])
);

const vocabulary: Vocabulary = {
  tokenToId: vocabDataParsed.tokenToId,
  idToToken: Object.fromEntries(
    Object.entries(vocabDataParsed.idToToken).map(([k, v]) => [parseInt(k), v])
  ),
  bpeMerges,
};

/**
 * BPE encoding step (mockup): merges frequent pairs of symbols according to BPE merges.
 * **Note:** This is a skeleton. Real BPE would iteratively merge, respect ranks and subtleties.
 * @param tokens Array of tokens (initial tokens from whitespace split)
 * @returns Array of tokens after applying one iteration of merge based on vocabulary
 */
function applyBPE(tokens: string[]): string[] {
  let pairs = new Map<string, number>();

  // Count pairs from tokens
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair = tokens[i] + tokens[i + 1];
    if (vocabulary.bpeMerges.has(pair)) {
      pairs.set(pair, vocabulary.bpeMerges.get(pair)!);
    }
  }

  if (pairs.size === 0) return tokens;

  // Find the highest priority merge (lowest rank)
  const bestPair = Array.from(pairs.entries()).reduce((a, b) =>
    a[1] < b[1] ? a : b
  )[0];

  // Merge all occurrences of bestPair
  const mergedTokens: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (
      i < tokens.length - 1 &&
      tokens[i] + tokens[i + 1] === bestPair
    ) {
      mergedTokens.push(bestPair);
      i += 2;
    } else {
      mergedTokens.push(tokens[i]);
      i++;
    }
  }

  return mergedTokens;
}

/**
 * Encodes input string into token IDs using whitespace tokenization then BPE merges.
 * @param text Input text string
 * @returns Array of token IDs
 */
export function encode(text: string): number[] {
  // Initial whitespace tokenization
  let tokens = text.trim().split(/\s+/);

  // Apply BPE merges iteratively until no merges left or max iterations reached (skeleton)
  const maxBPEIterations = 10;
  for (let i = 0; i < maxBPEIterations; i++) {
    const newTokens = applyBPE(tokens);
    if (newTokens.join(' ') === tokens.join(' ')) break;
    tokens = newTokens;
  }

  // Map tokens to IDs or <unk> fallback
  const ids: number[] = tokens.map((tok) =>
    vocabulary.tokenToId[tok] ?? vocabulary.tokenToId['<unk>'] ?? 0
  );

  return ids;
}

/**
 * Decodes an array of token IDs back into a string.
 * @param tokenIds Array of token IDs to decode
 * @returns Decoded string
 */
export function decode(tokenIds: number[]): string {
  const tokens = tokenIds.map((id) => vocabulary.idToToken[id] ?? '<unk>');
  return tokens.join(' ');
}

/**
 * Additional advanced features to add for production grade:
 * - Byte-level tokenization preprocessing (NFKC normalization, Unicode handling)
 * - Efficient BPE merging with priority queues
 * - WordPiece or SentencePiece integration for robust, language-independent tokenization
 * - Subword regularization and dropout techniques for robustness
 * - Vocabulary loading from binary files with memory-mapped I/O
 * - Tokenizer caching and incremental processing for prompt streaming
 * - Integration with tokenizer libraries like HuggingFace Tokenizers or SentencePiece
 */

export const llmTokenizer = {
  encode,
  decode,
};

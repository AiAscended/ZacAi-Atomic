/**
 * File: src/ai/knowledge-domains/english/english_inferenceController.ts
 * Purpose: English domain inference pipeline wrapper (prefixed file names).
 */

import { englishTokenizer } from "./english_tokenizer";
import { englishSemanticAnalyzer } from "./english_semanticAnalyzer";
import pretrainedWeights from "./english_weights/english_pretrained_weights.json";
import seeds from "./english_seeds/english_seeds.json";

const definitions: Record<
  string,
  { definition: string; synonyms: string[]; example: string }
> = {
  molecular: {
    definition:
      "Relating to or consisting of molecules; of or pertaining to the structure and properties of molecules.",
    synonyms: ["atomic", "microscopic", "chemical", "particulate"],
    example:
      "The molecular structure of water (H₂O) consists of two hydrogen atoms bonded to one oxygen atom.",
  },
  structure: {
    definition:
      "The arrangement of and relations between the parts or elements of something complex; the way in which parts are arranged or put together to form a whole.",
    synonyms: [
      "arrangement",
      "organization",
      "framework",
      "composition",
      "configuration",
    ],
    example:
      "The structure of the building was designed to withstand earthquakes.",
  },
  atomic: {
    definition:
      "Relating to an atom or atoms; of or forming a single irreducible unit or component in a larger system.",
    synonyms: [
      "molecular",
      "microscopic",
      "nuclear",
      "elemental",
      "fundamental",
    ],
    example:
      "The atomic number of carbon is 6, meaning it has 6 protons in its nucleus.",
  },
  "molecular structure": {
    definition:
      "The three-dimensional arrangement of atoms within a molecule, including the chemical bonds that hold the atoms together.",
    synonyms: [
      "molecular geometry",
      "molecular configuration",
      "chemical structure",
    ],
    example:
      "Scientists use X-ray crystallography to determine the molecular structure of proteins.",
  },
};

function calculateConfidence(tokens: string[], input: string): number {
  const lowerInput = input.toLowerCase();
  const vocabulary = (pretrainedWeights as any).vocabulary as Record<
    string,
    number
  >;

  let tokenScore = 0;
  let matchCount = 0;

  for (const token of tokens) {
    const lowerToken = token.toLowerCase();
    if (vocabulary[lowerToken]) {
      tokenScore += vocabulary[lowerToken];
      matchCount++;
    }
  }

  const avgTokenScore = matchCount > 0 ? tokenScore / matchCount : 0;

  // Semantic pattern matching
  let semanticScore = 0;
  const patterns = (seeds as any).patterns as Array<{
    pattern: string;
    weight: number;
  }>;

  for (const patternObj of patterns) {
    if (lowerInput.includes(patternObj.pattern)) {
      semanticScore += patternObj.weight;
    }
  }

  semanticScore = Math.min(semanticScore / 2, 1.0);

  const thresholds = (pretrainedWeights as any).thresholds;
  const finalConfidence =
    avgTokenScore * thresholds.token_match_weight +
    semanticScore * thresholds.semantic_weight;

  return Math.min(finalConfidence, 1.0);
}

export const englishRunInference = async (input: string, _context?: any) => {
  const t = englishTokenizer(input);
  const sem = englishSemanticAnalyzer(input);
  const tokens = _context?.tokens || t.tokens;

  const confidence = calculateConfidence(tokens, input);

  console.log(`[v0] English domain inference confidence:`, confidence);

  const lowerInput = input.toLowerCase();

  if (
    lowerInput.match(
      /\b(what is|define|definition of|explain|tell me about|meaning of)\b/,
    )
  ) {
    // Extract the term being asked about
    const termMatch = lowerInput.match(
      /\b(?:what is|define|definition of|explain|tell me about|meaning of)\s+(?:the\s+)?(?:word\s+)?([a-z\s]+?)(?:\?|$|and)/i,
    );

    if (termMatch) {
      const term = termMatch[1].trim();

      // Check if we have a definition for this term
      if (definitions[term]) {
        const def = definitions[term];
        const response =
          `**${term.charAt(0).toUpperCase() + term.slice(1)}**\n\n` +
          `**Definition:** ${def.definition}\n\n` +
          `**Synonyms:** ${def.synonyms.join(", ")}\n\n` +
          `**Example:** ${def.example}`;

        return {
          tokens: t.tokens,
          tokenCount: t.length,
          semantics: sem,
          response,
          confidence: Math.max(confidence, 0.7),
          domain: "english",
          sources: ["English Domain (Definitions)"],
        };
      }

      // Check for multi-word terms
      for (const [key, def] of Object.entries(definitions)) {
        if (lowerInput.includes(key)) {
          const response =
            `**${key.charAt(0).toUpperCase() + key.slice(1)}**\n\n` +
            `**Definition:** ${def.definition}\n\n` +
            `**Synonyms:** ${def.synonyms.join(", ")}\n\n` +
            `**Example:** ${def.example}`;

          return {
            tokens: t.tokens,
            tokenCount: t.length,
            semantics: sem,
            response,
            confidence: Math.max(confidence, 0.7),
            domain: "english",
            sources: ["English Domain (Definitions)"],
          };
        }
      }
    }
  }

  if (
    lowerInput.match(/\b(synonym|synonyms|similar word|another word for)\b/)
  ) {
    for (const [key, def] of Object.entries(definitions)) {
      if (lowerInput.includes(key)) {
        const response =
          `**Synonyms for "${key}":**\n\n` +
          def.synonyms.map((s, i) => `${i + 1}. ${s}`).join("\n") +
          `\n\n**Example:** ${def.example}`;

        return {
          tokens: t.tokens,
          tokenCount: t.length,
          semantics: sem,
          response,
          confidence: Math.max(confidence, 0.7),
          domain: "english",
          sources: ["English Domain (Synonyms)"],
        };
      }
    }
  }

  if (
    lowerInput.match(/\b(use in a sentence|example sentence|sentence with)\b/)
  ) {
    for (const [key, def] of Object.entries(definitions)) {
      if (lowerInput.includes(key)) {
        const response =
          `**Example sentence using "${key}":**\n\n` +
          `${def.example}\n\n` +
          `**Definition:** ${def.definition}`;

        return {
          tokens: t.tokens,
          tokenCount: t.length,
          semantics: sem,
          response,
          confidence: Math.max(confidence, 0.7),
          domain: "english",
          sources: ["English Domain (Examples)"],
        };
      }
    }
  }

  // If confidence is too low, return null so other domains can handle it
  if (confidence < 0.01) {
    return null;
  }

  return {
    tokens: t.tokens,
    tokenCount: t.length,
    semantics: sem,
    response: `English domain processed ${t.length} tokens with ${(confidence * 100).toFixed(1)}% confidence.`,
    confidence,
    domain: "english",
    sources: ["English Domain (Inference)"],
  };
};

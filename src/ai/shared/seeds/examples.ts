/**
 * Seed System Usage Examples
 *
 * Demonstrates how to use the seed registry and lookup utilities
 * across different system layers.
 */

import {
  lookupSeed,
  searchSeeds,
  getDomainSeeds,
  getDefinition,
  getExamples,
  extractSeedsFromPrompt,
  lookupWithContext,
  getSeedStats,
} from "@/ai/shared/seeds/seedLookup";

// ============================================================================
// EXAMPLE 1: Simple Lookup (Like Dictionary)
// ============================================================================
async function example1_simpleLookup() {
  console.log("\n=== Example 1: Simple Lookup ===\n");

  // Look up a mathematical concept
  const addition = await lookupSeed("addition", "mathematics");

  if (addition) {
    console.log(`Found: ${addition.concept}`);
    console.log(`Definition: ${addition.fullData.definition}`);
    console.log(`Examples:`, addition.fullData.examples);
    console.log(`Related:`, addition.fullData.related);
    console.log(
      `Binary Index: [${addition.domainId}, ${addition.fileId}, ${addition.entryId}]`,
    );
  }
}

// ============================================================================
// EXAMPLE 2: Extract Known Seeds from User Prompt
// ============================================================================
async function example2_extractFromPrompt() {
  console.log("\n=== Example 2: Extract Seeds from Prompt ===\n");

  const userPrompt = "How do I use addition and multiplication in calculus?";

  // Find all known seeds in the prompt
  const knownSeeds = extractSeedsFromPrompt(userPrompt, "mathematics");

  console.log(`Found ${knownSeeds.length} known concepts:`);
  knownSeeds.forEach((seed) => {
    console.log(`  - ${seed.concept} (priority: ${seed.priority})`);
  });
}

// ============================================================================
// EXAMPLE 3: Search Across Domains
// ============================================================================
function example3_search() {
  console.log("\n=== Example 3: Search Seeds ===\n");

  // Search for anything related to "arithmetic"
  const results = searchSeeds("arithmetic", {
    domain: "mathematics",
    limit: 5,
  });

  console.log(`Found ${results.length} results:`);
  results.forEach((result) => {
    console.log(
      `  - ${result.concept}: ${result.fullData.definition?.substring(0, 60)}...`,
    );
  });
}

// ============================================================================
// EXAMPLE 4: Get Full Context (Main + Related)
// ============================================================================
async function example4_contextualLookup() {
  console.log("\n=== Example 4: Contextual Lookup ===\n");

  const context = lookupWithContext("addition", "mathematics");

  if (context.main) {
    console.log(`Main concept: ${context.main.concept}`);
    console.log(`Definition: ${context.main.fullData.definition}`);

    console.log(`\nRelated concepts:`);
    context.related.forEach((rel) => {
      console.log(`  - ${rel.concept}`);
    });
  }
}

// ============================================================================
// EXAMPLE 5: Domain-Specific Seeds
// ============================================================================
function example5_domainSeeds() {
  console.log("\n=== Example 5: Domain Seeds ===\n");

  const mathSeeds = getDomainSeeds("mathematics");

  console.log(`Mathematics domain has ${mathSeeds.length} seeds`);
  console.log(`Categories:`, [...new Set(mathSeeds.map((s) => s.category))]);

  // Get high-priority seeds
  const highPriority = mathSeeds.filter((s) => s.priority && s.priority <= 10);
  console.log(`\nHigh priority seeds (top 10):`);
  highPriority.forEach((seed) => {
    console.log(`  ${seed.priority}. ${seed.concept}`);
  });
}

// ============================================================================
// EXAMPLE 6: Quick Definition Lookup (For UI/Tooltips)
// ============================================================================
async function example6_quickDefinition() {
  console.log("\n=== Example 6: Quick Definition ===\n");

  const definition = getDefinition("multiplication", "mathematics");
  console.log(`Multiplication: ${definition}`);

  const examples = getExamples("multiplication", "mathematics");
  console.log(`Examples:`, examples);
}

// ============================================================================
// EXAMPLE 7: System Statistics
// ============================================================================
function example7_stats() {
  console.log("\n=== Example 7: System Statistics ===\n");

  const stats = getSeedStats();
  console.log("Seed Registry Stats:");
  console.log(`  Total entries: ${stats.totalEntries}`);
  console.log(`  Total domains: ${stats.totalDomains}`);
  console.log(`  Total files: ${stats.totalFiles}`);
  console.log(`  Load time: ${stats.loadTimeMs}ms`);
  console.log(`  Loaded at: ${stats.loadedAt}`);
}

// ============================================================================
// EXAMPLE 8: Use in Orchestrator (Intelligent Routing)
// ============================================================================
async function example8_orchestratorUsage(userPrompt: string) {
  console.log("\n=== Example 8: Orchestrator Usage ===\n");

  // Extract known concepts from prompt
  const knownSeeds = extractSeedsFromPrompt(userPrompt);

  // Analyze which domains are relevant
  const domainCounts = new Map<string, number>();
  knownSeeds.forEach((seed) => {
    domainCounts.set(seed.domain, (domainCounts.get(seed.domain) || 0) + 1);
  });

  console.log(`Prompt: "${userPrompt}"`);
  console.log(`\nDomain relevance:`);
  Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} concepts`);
    });

  // Get the most relevant domain
  const mostRelevantDomain = Array.from(domainCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  console.log(`\nRouting to: ${mostRelevantDomain}`);

  // Get enriched context for that domain
  knownSeeds
    .filter((s) => s.domain === mostRelevantDomain)
    .forEach((seed) => {
      console.log(
        `  - ${seed.concept}: ${seed.fullData.definition?.substring(0, 80)}...`,
      );
    });
}

// ============================================================================
// EXAMPLE 9: Use in LLM Tokenizer (Handle Unknown Tokens)
// ============================================================================
async function example9_llmTokenizerUsage(unknownToken: string) {
  console.log("\n=== Example 9: LLM Tokenizer Usage ===\n");

  console.log(`Unknown token: "${unknownToken}"`);

  // Try to find in seeds
  const seed = await lookupSeed(unknownToken);

  if (seed) {
    console.log(`✅ Found in seeds!`);
    console.log(`Domain: ${seed.domain}`);
    const seedData = seed.fullData;
    console.log(`Definition: ${seedData?.definition ?? 'No definition available'}`);
    console.log(`\nCan now generate contextual embedding for this token`);

    // Instead of mapping to [UNK] token, use seed data to create
    // a meaningful representation
    return {
      token: unknownToken,
      tokenId: -1, // Special "from-seed" ID
      seedData: seed.fullData,
      contextualEmbedding: true,
    };
  } else {
    console.log(`❌ Not found in seeds - using [UNK] token`);
    return {
      token: unknownToken,
      tokenId: 3, // UNK token
      seedData: null,
      contextualEmbedding: false,
    };
  }
}

// ============================================================================
// EXAMPLE 10: Use in Domain Inference (Enhance Response)
// ============================================================================
async function example10_domainInference(concept: string, domain: string) {
  console.log("\n=== Example 10: Domain Inference Usage ===\n");

  const context = lookupWithContext(concept, domain);

  if (context.main) {
    const seed = context.main;

    console.log(`Generating response for: ${concept}`);
    console.log(`\nSeed context available:`);
    console.log(`  - Definition: ${fullData?.definition ?? 'No definition available'}`);
    console.log(`  - ${fullData?.examples?.length ?? 0} examples`);
    console.log(`  - ${context.related.length} related concepts`);

    // Construct enhanced response
    const response = {
      answer: seed.fullData.definition,
      examples: seed.fullData.examples || [],
      relatedConcepts: context.related.map((r) => r.concept),
      usage: seed.fullData.usage,
      category: seed.category,
      confidence: seed.priority ? 1 - seed.priority / 100 : 0.5,
    };

    console.log(
      `\nEnhanced response confidence: ${(response.confidence * 100).toFixed(0)}%`,
    );

    return response;
  } else {
    console.log(`No seed data found - using pure inference`);
    return null;
  }
}

// ============================================================================
// Run All Examples
// ============================================================================
export async function runAllExamples() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  Seed System Usage Examples            ║");
  console.log("╚════════════════════════════════════════╝");

  await example1_simpleLookup();
  await example2_extractFromPrompt();
  example3_search();
  await example4_contextualLookup();
  example5_domainSeeds();
  await example6_quickDefinition();
  example7_stats();
  await example8_orchestratorUsage(
    "How do I calculate the area of a circle using multiplication?",
  );
  await example9_llmTokenizerUsage("eigenvalue");
  await example10_domainInference("addition", "mathematics");

  console.log("\n✅ All examples completed!\n");
}

// Export individual examples for testing
export {
  example1_simpleLookup,
  example2_extractFromPrompt,
  example3_search,
  example4_contextualLookup,
  example5_domainSeeds,
  example6_quickDefinition,
  example7_stats,
  example8_orchestratorUsage,
  example9_llmTokenizerUsage,
  example10_domainInference,
};

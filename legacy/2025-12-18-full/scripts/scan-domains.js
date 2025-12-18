/**
 * CLI Tool: Scan Knowledge Domains
 * Purpose: Auto-discover and register domains
 * Usage: node scripts/scan-domains.js
 */

const { scanAndUpdateDomainRegistry } = require("../src/ai/knowledge-domains/domainScanner.ts");

async function main() {
  console.log("==========================================");
  console.log("  Knowledge Domain Scanner");
  console.log("==========================================\n");
  
  try {
    const registry = await scanAndUpdateDomainRegistry();
    
    console.log("\n📊 Domain Registry Summary:");
    console.log(`   Total domains: ${registry.totalDomains}`);
    console.log(`   Enabled: ${registry.enabledDomains.length}`);
    console.log(`   Disabled: ${registry.totalDomains - registry.enabledDomains.length}`);
    
    console.log("\n📋 Domains:");
    for (const [id, manifest] of Object.entries(registry.domains)) {
      const status = manifest.enabled ? "✓" : "✗";
      const structure = [
        manifest.structure.hasSeedsFolder && "Seeds",
        manifest.structure.hasWeightsFolder && "Weights",
        manifest.structure.hasInferenceController && "Inference",
        manifest.structure.hasTrainingController && "Training",
        manifest.structure.hasIntegrationAPI && "API",
      ].filter(Boolean).join(", ");
      
      console.log(`   ${status} ${manifest.domainName} (${id})`);
      console.log(`      Structure: ${structure || "None"}`);
      console.log(`      Vocab size: ${manifest.metadata.seedVocabSize || 0}`);
    }
    
    console.log("\n✅ Domain registry updated successfully!");
  } catch (error) {
    console.error("\n❌ Failed to scan domains:", error);
    process.exit(1);
  }
}

main();

/**
 * CLI Tool: Unified AI Module Scanner
 * Purpose: Scan both models and domains in one efficient pass
 * Usage: node scripts/scan-ai-modules.js
 */

const { scanAndUpdateUnifiedRegistry } = require("../src/ai/shared/registry/unifiedRegistry.ts");

async function main() {
  console.log("==========================================");
  console.log("  Unified AI Module Scanner");
  console.log("  Models + Domains in One Pass");
  console.log("==========================================\n");
  
  try {
    const startTime = Date.now();
    const registry = await scanAndUpdateUnifiedRegistry();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log("\n📊 Registry Summary:");
    console.log(`   Total modules: ${Object.keys(registry.modules).length}`);
    console.log(`   Models: ${registry.stats.totalModels} (${registry.stats.enabledModels} enabled)`);
    console.log(`   Domains: ${registry.stats.totalDomains} (${registry.stats.enabledDomains} enabled)`);
    console.log(`   Scan time: ${duration}s`);
    
    // Group by type for display
    const models = Object.values(registry.modules).filter(m => m.moduleType === "model");
    const domains = Object.values(registry.modules).filter(m => m.moduleType === "domain");
    
    if (models.length > 0) {
      console.log("\n🤖 Models:");
      for (const module of models) {
        const status = module.enabled ? "✓" : "✗";
        const structure = [
          module.structure.hasSeedsFolder && "Seeds",
          module.structure.hasWeightsFolder && "Weights",
          module.structure.hasTokenizer && "Tokenizer",
          module.structure.hasInferenceEngine && "Inference",
          module.structure.hasTrainingPipeline && "Training",
        ].filter(Boolean).join(", ");
        
        console.log(`   ${status} ${module.displayName} (${module.moduleId})`);
        if (module.modelType) {
          console.log(`      Type: ${module.modelType.toUpperCase()}`);
        }
        console.log(`      Structure: ${structure || "None"}`);
        if (module.metadata.baseTokenCount) {
          console.log(`      Base tokens: ${module.metadata.baseTokenCount}`);
        }
      }
    }
    
    if (domains.length > 0) {
      console.log("\n📚 Domains:");
      for (const module of domains) {
        const status = module.enabled ? "✓" : "✗";
        const structure = [
          module.structure.hasSeedsFolder && "Seeds",
          module.structure.hasWeightsFolder && "Weights",
          module.structure.hasInferenceEngine && "Inference",
          module.structure.hasTrainingPipeline && "Training",
          module.structure.hasIntegrationAPI && "API",
        ].filter(Boolean).join(", ");
        
        console.log(`   ${status} ${module.displayName} (${module.moduleId})`);
        console.log(`      Structure: ${structure || "None"}`);
        if (module.metadata.seedVocabSize) {
          console.log(`      Vocab size: ${module.metadata.seedVocabSize}`);
        }
      }
    }
    
    console.log("\n✅ Unified registry updated successfully!");
    console.log(`📁 Registry file: src/ai/UNIFIED_REGISTRY.json`);
  } catch (error) {
    console.error("\n❌ Failed to scan modules:", error);
    process.exit(1);
  }
}

main();

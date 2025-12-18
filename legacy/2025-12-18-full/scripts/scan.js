/**
 * Unified CLI Scanner
 * Purpose: Scan any module type (models, domains, etc.)
 * Usage: node scripts/scan.js <type>
 *   - node scripts/scan.js models
 *   - node scripts/scan.js domains
 *   - node scripts/scan.js all
 */

const path = require("path");

// Import configurations (dynamic to avoid TS compilation issues)
async function loadConfig(type) {
  if (type === "models") {
    const { modelScannerConfig } = await import("../src/ai/models/config.ts");
    return modelScannerConfig;
  } else if (type === "domains") {
    const { domainScannerConfig } = await import("../src/ai/knowledge-domains/config.ts");
    return domainScannerConfig;
  }
  throw new Error(`Unknown module type: ${type}`);
}

async function scanModuleType(type) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${type.toUpperCase()} SCANNER`);
  console.log(`${"=".repeat(50)}\n`);
  
  try {
    const config = await loadConfig(type);
    const { scanAndUpdate } = await import("../src/ai/shared/registry/moduleRegistry.ts");
    
    const registry = await scanAndUpdate(config);
    
    console.log(`\n📊 ${type.toUpperCase()} Registry Summary:`);
    console.log(`   Total: ${registry.totalModules}`);
    console.log(`   Enabled: ${registry.enabledModules.length}`);
    console.log(`   Disabled: ${registry.totalModules - registry.enabledModules.length}`);
    
    // Display grouped by type for models
    if (registry.byType && Object.keys(registry.byType).length > 0) {
      console.log(`\n📦 By Type:`);
      for (const [modelType, ids] of Object.entries(registry.byType)) {
        console.log(`   ${modelType}: ${ids.length}`);
      }
    }
    
    console.log(`\n📋 ${type.charAt(0).toUpperCase() + type.slice(1)}:`);
    for (const [id, manifest] of Object.entries(registry.modules)) {
      const status = manifest.enabled ? "✓" : "✗";
      const structure = Object.entries(manifest.structure)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace("has", "").replace(/([A-Z])/g, " $1").trim())
        .join(", ");
      
      console.log(`   ${status} ${manifest.moduleName} (${id})`);
      if (manifest.modelType) {
        console.log(`      Type: ${manifest.modelType}`);
      }
      console.log(`      Structure: ${structure || "None"}`);
      if (manifest.metadata.baseTokensCount) {
        console.log(`      Base tokens: ${manifest.metadata.baseTokensCount}`);
      }
      if (manifest.metadata.seedVocabSize) {
        console.log(`      Vocab size: ${manifest.metadata.seedVocabSize}`);
      }
    }
    
    console.log(`\n✅ ${type.charAt(0).toUpperCase() + type.slice(1)} registry updated successfully!`);
    return registry;
  } catch (error) {
    console.error(`\n❌ Failed to scan ${type}:`, error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] || "all";
  
  try {
    if (type === "all") {
      await scanModuleType("models");
      await scanModuleType("domains");
    } else if (type === "models" || type === "domains") {
      await scanModuleType(type);
    } else {
      console.error(`\n❌ Unknown module type: ${type}`);
      console.log(`Usage: node scripts/scan.js <models|domains|all>`);
      process.exit(1);
    }
    
    console.log(`\n${"=".repeat(50)}`);
    console.log(`  SCAN COMPLETE`);
    console.log(`${"=".repeat(50)}\n`);
  } catch (error) {
    console.error("\n❌ Scan failed:", error);
    process.exit(1);
  }
}

main();

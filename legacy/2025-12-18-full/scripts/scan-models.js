#!/usr/bin/env node

/**
 * File: scripts/scan-models.js
 * Purpose: CLI tool to scan and update model registry
 * 
 * Usage:
 *   node scripts/scan-models.js
 *   npm run scan:models
 */

const { scanAndUpdateRegistry } = require('../src/ai/models/modelRegistry.ts');

async function main() {
  console.log('🚀 Model Registry Scanner');
  console.log('========================\n');
  
  try {
    const registry = await scanAndUpdateRegistry();
    
    console.log('\n📊 Summary:');
    console.log(`   Total models: ${registry.totalModels}`);
    console.log(`   Enabled models: ${registry.enabledModels.length}`);
    console.log(`   Disabled models: ${registry.totalModels - registry.enabledModels.length}`);
    
    console.log('\n✅ Models:');
    for (const [id, model] of Object.entries(registry.models)) {
      const status = model.enabled ? '✓' : '✗';
      const structure = [
        model.structure.hasInferenceEngine ? 'inference' : null,
        model.structure.hasWeightsFolder ? 'weights' : null,
        model.structure.hasSeedsFolder ? 'seeds' : null,
        model.metadata.hasBaseTokens ? `tokens(${model.metadata.baseTokensCount})` : null,
      ].filter(Boolean).join(', ');
      
      console.log(`   ${status} ${model.displayName} [${model.modelType}]`);
      console.log(`      ${structure || 'incomplete structure'}`);
    }
    
    console.log('\n🎉 Registry updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  File Renaming Script - Add Proper Prefixes              ║');
console.log('║  Rename all non-prefixed files in domains and models      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const DOMAINS_PATH = path.join(__dirname, '../src/ai/knowledge-domains');
const MODELS_PATH = path.join(__dirname, '../src/ai/models');

const stats = {
  filesRenamed: 0,
  filesSkipped: 0,
  errors: []
};

/**
 * Rename a file with proper prefix
 */
function renameFile(oldPath, newPath) {
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`   ✨ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
    stats.filesRenamed++;
    return true;
  } else if (fs.existsSync(newPath)) {
    console.log(`   ⏭️  Skipped: ${path.basename(oldPath)} (target exists)`);
    stats.filesSkipped++;
  }
  return false;
}

/**
 * Process domain files
 */
function processDomain(domainPath) {
  const domainName = path.basename(domainPath);
  
  // Files to rename
  const filesToRename = [
    { old: 'domain-instructions.yaml', new: `${domainName}_instructions.yaml` }
  ];

  let renamed = false;
  for (const { old, new: newName } of filesToRename) {
    const oldPath = path.join(domainPath, old);
    const newPath = path.join(domainPath, newName);
    
    if (fs.existsSync(oldPath)) {
      if (!renamed) {
        console.log(`\n📁 ${domainName}`);
        renamed = true;
      }
      renameFile(oldPath, newPath);
    }
  }
}

/**
 * Process model files
 */
function processModel(modelPath) {
  const modelName = path.basename(modelPath);
  
  if (modelName === 'shared') {
    return;
  }

  let renamed = false;
  
  // Special case for unified-transformer-llm
  if (modelName === 'unified-transformer-llm') {
    const specialFiles = [
      { old: 'llm-weight-config.json', new: 'unified-transformer-llm_weight-config.json' },
      { old: 'create_remaining_files.sh', new: 'unified-transformer-llm_create_remaining_files.sh' }
    ];
    
    for (const { old, new: newName } of specialFiles) {
      const oldPath = path.join(modelPath, old);
      const newPath = path.join(modelPath, newName);
      
      if (fs.existsSync(oldPath)) {
        if (!renamed) {
          console.log(`\n🤖 ${modelName}`);
          renamed = true;
        }
        renameFile(oldPath, newPath);
      }
    }
  }

  // README.md and package.json for all models
  const commonFiles = [
    { old: 'README.md', new: `${modelName}_README.md` },
    { old: 'package.json', new: `${modelName}_package.json` }
  ];

  for (const { old, new: newName } of commonFiles) {
    const oldPath = path.join(modelPath, old);
    const newPath = path.join(modelPath, newName);
    
    if (fs.existsSync(oldPath)) {
      if (!renamed) {
        console.log(`\n🤖 ${modelName}`);
        renamed = true;
      }
      renameFile(oldPath, newPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🌍 Processing Knowledge Domains...\n');

  const domains = fs.readdirSync(DOMAINS_PATH);
  for (const domain of domains) {
    const domainPath = path.join(DOMAINS_PATH, domain);
    if (fs.statSync(domainPath).isDirectory()) {
      try {
        processDomain(domainPath);
      } catch (error) {
        stats.errors.push(`Domain ${domain}: ${error.message}`);
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n\n🤖 Processing AI Models...\n');

  const models = fs.readdirSync(MODELS_PATH);
  for (const model of models) {
    const modelPath = path.join(MODELS_PATH, model);
    if (fs.statSync(modelPath).isDirectory()) {
      try {
        processModel(modelPath);
      } catch (error) {
        stats.errors.push(`Model ${model}: ${error.message}`);
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  File Renaming Complete!                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   Files renamed: ${stats.filesRenamed}`);
  console.log(`   Files skipped: ${stats.filesSkipped}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✅ No errors encountered!');
  }
}

// Run the script
main();

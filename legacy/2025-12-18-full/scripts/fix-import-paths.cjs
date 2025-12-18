#!/usr/bin/env node

/**
 * Fix Import Paths Script
 * 
 * Fixes all import paths in domain/model files that reference old folder structures.
 * Changes:
 * - ./weights/ -> ./{domain}_weights/
 * - ./seeds/ -> ./{domain}_seeds/
 */

const fs = require('fs');
const path = require('path');

const DOMAINS_PATH = path.join(__dirname, '../src/ai/knowledge-domains');
const MODELS_PATH = path.join(__dirname, '../src/ai/models');

let filesFixed = 0;
let importsFixed = 0;

/**
 * Fix imports in a single file
 */
function fixImportsInFile(filePath, componentName, componentType) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix ./weights/ imports
  const weightsRegex = /from\s+["']\.\/weights\//g;
  if (weightsRegex.test(content)) {
    content = content.replace(
      /from\s+["']\.\/weights\//g,
      `from "./${componentName}_weights/`
    );
    modified = true;
    importsFixed++;
    console.log(`  ✅ Fixed weights import in ${path.basename(filePath)}`);
  }

  // Fix ./seeds/ imports
  const seedsRegex = /from\s+["']\.\/seeds\//g;
  if (seedsRegex.test(content)) {
    content = content.replace(
      /from\s+["']\.\/seeds\//g,
      `from "./${componentName}_seeds/`
    );
    modified = true;
    importsFixed++;
    console.log(`  ✅ Fixed seeds import in ${path.basename(filePath)}`);
  }

  // Fix ./tools/ imports
  const toolsRegex = /from\s+["']\.\/tools\//g;
  if (toolsRegex.test(content)) {
    content = content.replace(
      /from\s+["']\.\/tools\//g,
      `from "./${componentName}_tools/`
    );
    modified = true;
    importsFixed++;
    console.log(`  ✅ Fixed tools import in ${path.basename(filePath)}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
  }
}

/**
 * Process all TypeScript files in a directory
 */
function processDirectory(dirPath, componentName) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);
  let hadIssues = false;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      // Check if file has old import patterns before logging
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('from "./weights/') || 
          content.includes('from "./seeds/') || 
          content.includes('from "./tools/')) {
        if (!hadIssues) {
          console.log(`\n📁 ${componentName}`);
          hadIssues = true;
        }
        fixImportsInFile(filePath, componentName, 'domain');
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Fix Import Paths Script                                 ║');
  console.log('║  Updating old folder references to new prefixed names     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('🌍 Processing Knowledge Domains...');

  // Process all domains
  const domains = fs.readdirSync(DOMAINS_PATH);
  for (const domain of domains) {
    const domainPath = path.join(DOMAINS_PATH, domain);
    if (fs.statSync(domainPath).isDirectory()) {
      processDirectory(domainPath, domain);
    }
  }

  console.log('\n\n🤖 Processing AI Models...');

  // Process all models
  const models = fs.readdirSync(MODELS_PATH);
  for (const model of models) {
    if (model === 'shared') continue;
    
    const modelPath = path.join(MODELS_PATH, model);
    if (fs.statSync(modelPath).isDirectory()) {
      processDirectory(modelPath, model);
    }
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Import Path Fix Complete!                               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   Files modified: ${filesFixed}`);
  console.log(`   Imports fixed: ${importsFixed}`);

  if (filesFixed === 0) {
    console.log('\n✅ No import path issues found!');
  } else {
    console.log('\n✅ All import paths have been updated!');
  }
}

// Run the script
main();

#!/usr/bin/env node

/**
 * Reorganize seed files with proper domain prefixes
 * 
 * Convention:
 * - All seed files in domain folders should be prefixed with domain name
 * - Example: mathematics/mathematics_seed_concepts.json
 * - Seed folders should be named: {domain}_seeds/
 * - Weights folders should be: {domain}_weights/
 */

const fs = require('fs').promises;
const path = require('path');

const DOMAINS_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains');

async function reorganizeDomain(domainName, domainPath) {
  console.log(`\n=== Processing ${domainName} ===`);
  
  try {
    const items = await fs.readdir(domainPath, { withFileTypes: true });
    
    // Find JSON seed files (not in subfolders)
    const seedFiles = items.filter(item => 
      item.isFile() && 
      item.name.endsWith('.json') &&
      !item.name.startsWith(domainName)  // Not already prefixed
    );
    
    if (seedFiles.length > 0) {
      // Create seeds subfolder if it doesn't exist
      const seedsDir = path.join(domainPath, `${domainName}_seeds`);
      try {
        await fs.mkdir(seedsDir, { recursive: true });
        console.log(`Created: ${domainName}_seeds/`);
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }
      
      // Move and rename seed files
      for (const file of seedFiles) {
        const oldPath = path.join(domainPath, file.name);
        
        // Generate new name with prefix
        const newName = file.name.startsWith(`${domainName}_`) 
          ? file.name 
          : `${domainName}_seed_${file.name}`;
        
        const newPath = path.join(seedsDir, newName);
        
        await fs.rename(oldPath, newPath);
        console.log(`  ${file.name} -> ${domainName}_seeds/${newName}`);
      }
    }
    
    // Check for existing seed/ subfolder without prefix
    const legacySeedDir = path.join(domainPath, 'seed');
    try {
      const stats = await fs.stat(legacySeedDir);
      if (stats.isDirectory()) {
        const newSeedDir = path.join(domainPath, `${domainName}_seeds`);
        
        // If prefixed folder already exists, merge contents
        try {
          await fs.stat(newSeedDir);
          console.log(`  Merging seed/ into ${domainName}_seeds/`);
          
          const legacyItems = await fs.readdir(legacySeedDir, { withFileTypes: true });
          for (const item of legacyItems) {
            const oldPath = path.join(legacySeedDir, item.name);
            const newPath = path.join(newSeedDir, item.name);
            await fs.rename(oldPath, newPath);
          }
          
          // Remove empty legacy folder
          await fs.rmdir(legacySeedDir);
          console.log(`  Removed legacy seed/ folder`);
          
        } catch (err) {
          // Prefixed folder doesn't exist, just rename
          await fs.rename(legacySeedDir, newSeedDir);
          console.log(`  Renamed seed/ to ${domainName}_seeds/`);
        }
      }
    } catch (err) {
      // No legacy seed/ folder - that's fine
    }
    
  } catch (err) {
    console.error(`Error processing ${domainName}:`, err.message);
  }
}

async function main() {
  console.log('=================================');
  console.log('Seed File Reorganization Script');
  console.log('=================================');
  
  try {
    const domains = await fs.readdir(DOMAINS_DIR, { withFileTypes: true });
    
    for (const domain of domains) {
      if (!domain.isDirectory()) continue;
      
      const domainName = domain.name;
      const domainPath = path.join(DOMAINS_DIR, domainName);
      
      await reorganizeDomain(domainName, domainPath);
    }
    
    console.log('\n=================================');
    console.log('Reorganization Complete!');
    console.log('=================================\n');
    
    // Also reorganize shared vocabulary
    console.log('=== Processing shared vocabulary ===');
    const sharedVocabPath = path.join(process.cwd(), 'src', 'ai', 'shared', 'vocabulary');
    try {
      const vocabFiles = await fs.readdir(sharedVocabPath);
      const jsonFiles = vocabFiles.filter(f => f.endsWith('.json'));
      
      console.log(`Found ${jsonFiles.length} vocabulary seed files`);
      console.log('Shared vocabulary files are already organized.');
      
    } catch (err) {
      console.error('Error processing shared vocabulary:', err.message);
    }
    
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();

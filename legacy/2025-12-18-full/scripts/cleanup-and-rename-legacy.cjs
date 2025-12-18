#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Legacy Folder Cleanup & Rename Script                   ║');
console.log('║  Removing duplicates and renaming to proper prefixes      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const DOMAINS_PATH = path.join(__dirname, '../src/ai/knowledge-domains');
const MODELS_PATH = path.join(__dirname, '../src/ai/models');

// Track statistics
const stats = {
  domainsProcessed: 0,
  modelsProcessed: 0,
  foldersDeleted: 0,
  foldersRenamed: 0,
  filesDeleted: 0,
  errors: []
};

/**
 * Check if files in source folder exist in target folder (with proper prefix)
 */
function areFilesAlreadyCopied(sourceDir, targetDir, domain) {
  if (!fs.existsSync(sourceDir) || !fs.existsSync(targetDir)) {
    return false;
  }

  const sourceFiles = fs.readdirSync(sourceDir).filter(f => {
    const stat = fs.statSync(path.join(sourceDir, f));
    return stat.isFile() && f.endsWith('.json');
  });

  // Check if files exist in target with proper prefix
  let allCopied = true;
  for (const file of sourceFiles) {
    // Expected filename in target: {domain}_{filename}
    const expectedName = file.startsWith(domain + '_') ? file : `${domain}_${file}`;
    const targetPath = path.join(targetDir, expectedName);
    
    if (!fs.existsSync(targetPath)) {
      allCopied = false;
      break;
    }
  }

  return allCopied && sourceFiles.length > 0;
}

/**
 * Recursively delete a directory
 */
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
        stats.filesDeleted++;
      }
    });
    fs.rmdirSync(folderPath);
    stats.foldersDeleted++;
    console.log(`   🗑️  Deleted legacy folder: ${path.basename(folderPath)}`);
  }
}

/**
 * Rename folder with proper prefix
 */
function renameFolder(oldPath, newPath) {
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
    stats.foldersRenamed++;
    console.log(`   ✨ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
    return true;
  }
  return false;
}

/**
 * Process a knowledge domain
 */
function processDomain(domainPath) {
  const domainName = path.basename(domainPath);
  console.log(`\n📁 Processing domain: ${domainName}`);

  // Check legacy 'seeds' folder
  const legacySeedsPath = path.join(domainPath, 'seeds');
  const prefixedSeedsPath = path.join(domainPath, `${domainName}_seeds`);
  
  if (fs.existsSync(legacySeedsPath) && fs.existsSync(prefixedSeedsPath)) {
    // Check if files were copied
    if (areFilesAlreadyCopied(legacySeedsPath, prefixedSeedsPath, domainName)) {
      deleteFolderRecursive(legacySeedsPath);
    } else {
      console.log(`   ⚠️  Legacy 'seeds' has files not yet copied, keeping it`);
    }
  } else if (fs.existsSync(legacySeedsPath) && !fs.existsSync(prefixedSeedsPath)) {
    // Rename if prefixed version doesn't exist
    renameFolder(legacySeedsPath, prefixedSeedsPath);
  }

  // Check legacy 'weights' folder
  const legacyWeightsPath = path.join(domainPath, 'weights');
  const prefixedWeightsPath = path.join(domainPath, `${domainName}_weights`);
  
  if (fs.existsSync(legacyWeightsPath) && fs.existsSync(prefixedWeightsPath)) {
    // Check if files were copied
    if (areFilesAlreadyCopied(legacyWeightsPath, prefixedWeightsPath, domainName)) {
      deleteFolderRecursive(legacyWeightsPath);
    } else {
      console.log(`   ⚠️  Legacy 'weights' has files not yet copied, keeping it`);
    }
  } else if (fs.existsSync(legacyWeightsPath) && !fs.existsSync(prefixedWeightsPath)) {
    renameFolder(legacyWeightsPath, prefixedWeightsPath);
  }

  // Check 'tools' folder
  const toolsPath = path.join(domainPath, 'tools');
  const prefixedToolsPath = path.join(domainPath, `${domainName}_tools`);
  
  if (fs.existsSync(toolsPath) && !fs.existsSync(prefixedToolsPath)) {
    renameFolder(toolsPath, prefixedToolsPath);
  }

  // Find any other non-prefixed subfolders
  try {
    const entries = fs.readdirSync(domainPath);
    for (const entry of entries) {
      const entryPath = path.join(domainPath, entry);
      const stat = fs.statSync(entryPath);
      
      if (stat.isDirectory() && !entry.startsWith(domainName + '_') && !entry.startsWith('.')) {
        const prefixedPath = path.join(domainPath, `${domainName}_${entry}`);
        if (!fs.existsSync(prefixedPath)) {
          renameFolder(entryPath, prefixedPath);
        } else {
          console.log(`   ⚠️  Cannot rename '${entry}' - target already exists`);
        }
      }
    }
  } catch (error) {
    stats.errors.push(`Domain ${domainName}: ${error.message}`);
  }

  stats.domainsProcessed++;
}

/**
 * Process an AI model
 */
function processModel(modelPath) {
  const modelName = path.basename(modelPath);
  
  if (modelName === 'shared') {
    return; // Skip shared folder
  }

  console.log(`\n🤖 Processing model: ${modelName}`);

  // Model-specific short prefixes to rename
  const modelPrefixMap = {
    'code-transformer': ['code-'],
    'convolutional-neural-network': ['cnn-'],
    'diffusion-model': ['diffusion-'],
    'generative-adversarial-network': ['gan-'],
    'graph-neural-network': ['gnn-'],
    'multi-modal-fusion': ['multimodal-'],
    'neuro-symbolic-reasoning': ['neuro-'],
    'recurrent-neural-network': ['rnn-'],
    'speech-to-text': ['stt-'],
    'text-to-speech': ['tts-'],
    'unified-transformer-llm': ['llm-'],
    'vision-transformer': ['vit-'],
    'wavenet-audio-model': ['wavenet-']
  };

  const shortPrefixes = modelPrefixMap[modelName] || [];

  try {
    const entries = fs.readdirSync(modelPath);
    
    for (const entry of entries) {
      const entryPath = path.join(modelPath, entry);
      const stat = fs.statSync(entryPath);
      
      if (!stat.isDirectory() || entry.startsWith('.') || entry.startsWith(modelName + '_')) {
        continue; // Skip files and properly prefixed folders
      }

      // Check if it has a short prefix that should be replaced
      let shouldRename = false;
      for (const shortPrefix of shortPrefixes) {
        if (entry.startsWith(shortPrefix)) {
          shouldRename = true;
          break;
        }
      }

      // If it doesn't have the model name as prefix, it needs renaming
      if (shouldRename || !entry.startsWith(modelName)) {
        // Extract the suffix (e.g., 'cnn-model' -> 'model')
        let suffix = entry;
        for (const shortPrefix of shortPrefixes) {
          if (entry.startsWith(shortPrefix)) {
            suffix = entry.substring(shortPrefix.length);
            break;
          }
        }

        const newName = `${modelName}_${suffix}`;
        const newPath = path.join(modelPath, newName);

        if (!fs.existsSync(newPath)) {
          renameFolder(entryPath, newPath);
        } else {
          console.log(`   ⚠️  Cannot rename '${entry}' - target '${newName}' already exists`);
        }
      }
    }
  } catch (error) {
    stats.errors.push(`Model ${modelName}: ${error.message}`);
  }

  stats.modelsProcessed++;
}

/**
 * Main execution
 */
function main() {
  console.log('🌍 Processing Knowledge Domains...\n');
  
  // Process all domains
  const domains = fs.readdirSync(DOMAINS_PATH);
  for (const domain of domains) {
    const domainPath = path.join(DOMAINS_PATH, domain);
    if (fs.statSync(domainPath).isDirectory()) {
      try {
        processDomain(domainPath);
      } catch (error) {
        stats.errors.push(`Domain ${domain}: ${error.message}`);
        console.error(`   ❌ Error processing ${domain}:`, error.message);
      }
    }
  }

  console.log('\n\n🤖 Processing AI Models...\n');
  
  // Process all models
  const models = fs.readdirSync(MODELS_PATH);
  for (const model of models) {
    const modelPath = path.join(MODELS_PATH, model);
    if (fs.statSync(modelPath).isDirectory()) {
      try {
        processModel(modelPath);
      } catch (error) {
        stats.errors.push(`Model ${model}: ${error.message}`);
        console.error(`   ❌ Error processing ${model}:`, error.message);
      }
    }
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Cleanup & Rename Complete!                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Summary:`);
  console.log(`   Domains processed: ${stats.domainsProcessed}`);
  console.log(`   Models processed: ${stats.modelsProcessed}`);
  console.log(`   Folders renamed: ${stats.foldersRenamed}`);
  console.log(`   Folders deleted: ${stats.foldersDeleted}`);
  console.log(`   Files deleted: ${stats.filesDeleted}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✅ No errors encountered!');
  }
}

// Run the script
main();

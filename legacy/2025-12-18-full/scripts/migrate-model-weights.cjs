#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Final Model Weights Cleanup                             ║');
console.log('║  Migrate files from old weight folders and remove them   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const MODELS_PATH = path.join(__dirname, '../src/ai/models');

const stats = {
  filesMigrated: 0,
  foldersDeleted: 0,
  errors: []
};

// Map of model names to their old weight folder prefixes
const MODEL_WEIGHT_MAP = {
  'code-transformer': 'code-weights',
  'convolutional-neural-network': 'cnn-weights',
  'diffusion-model': 'diffusion-weights',
  'generative-adversarial-network': 'gan-weights',
  'graph-neural-network': 'gnn-weights',
  'multi-modal-fusion': 'multimodal-weights',
  'neuro-symbolic-reasoning': 'neuro-weights',
  'recurrent-neural-network': 'rnn-weights',
  'speech-to-text': 'stt-weights',
  'text-to-speech': 'tts-weights',
  'unified-transformer-llm': 'llm-weights',
  'vision-transformer': 'vit-weights',
  'wavenet-audio-model': 'wavenet-weights'
};

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
      }
    });
    fs.rmdirSync(folderPath);
  }
}

/**
 * Migrate files from old weight folder to new one
 */
function migrateWeightFiles(modelName, oldWeightFolder) {
  const modelPath = path.join(MODELS_PATH, modelName);
  const oldWeightPath = path.join(modelPath, oldWeightFolder);
  const newWeightPath = path.join(modelPath, `${modelName}_weights`);

  if (!fs.existsSync(oldWeightPath)) {
    return; // Already cleaned up or doesn't exist
  }

  console.log(`\n🤖 Processing ${modelName}`);
  console.log(`   Old: ${oldWeightFolder}/`);
  console.log(`   New: ${modelName}_weights/`);

  // Ensure new folder exists
  if (!fs.existsSync(newWeightPath)) {
    fs.mkdirSync(newWeightPath, { recursive: true });
  }

  // Get all files from old folder
  const files = fs.readdirSync(oldWeightPath);
  
  for (const file of files) {
    const oldFilePath = path.join(oldWeightPath, file);
    const stat = fs.statSync(oldFilePath);

    if (stat.isFile()) {
      // Determine new filename with proper prefix
      let newFilename = file;
      
      // If file starts with old short prefix, replace it with full model name
      const oldPrefix = oldWeightFolder.replace('-weights', '');
      if (file.startsWith(oldPrefix)) {
        newFilename = file.replace(oldPrefix, modelName);
      } else if (!file.startsWith(modelName)) {
        // If no prefix at all, add the model name
        newFilename = `${modelName}_${file}`;
      }

      const newFilePath = path.join(newWeightPath, newFilename);

      // Copy file if it doesn't exist
      if (!fs.existsSync(newFilePath)) {
        fs.copyFileSync(oldFilePath, newFilePath);
        console.log(`   ✅ Migrated: ${file} → ${newFilename}`);
        stats.filesMigrated++;
      } else {
        console.log(`   ⏭️  Skipped: ${file} (already exists)`);
      }
    }
  }

  // Delete old folder
  console.log(`   🗑️  Deleting old folder: ${oldWeightFolder}/`);
  deleteFolderRecursive(oldWeightPath);
  stats.foldersDeleted++;
}

/**
 * Main execution
 */
function main() {
  console.log('🤖 Processing AI Models...\n');

  for (const [modelName, oldWeightFolder] of Object.entries(MODEL_WEIGHT_MAP)) {
    try {
      migrateWeightFiles(modelName, oldWeightFolder);
    } catch (error) {
      stats.errors.push(`Model ${modelName}: ${error.message}`);
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Weight Folder Migration Complete!                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   Files migrated: ${stats.filesMigrated}`);
  console.log(`   Old folders deleted: ${stats.foldersDeleted}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✅ No errors encountered!');
  }
}

// Run the script
main();

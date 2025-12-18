#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Legacy Seeds/Weights Migration & Cleanup                ║');
console.log('║  Copy remaining files and remove legacy folders           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const DOMAINS_PATH = path.join(__dirname, '../src/ai/knowledge-domains');

const stats = {
  filesCopied: 0,
  filesSkipped: 0,
  foldersDeleted: 0,
  errors: []
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
    stats.foldersDeleted++;
  }
}

/**
 * Copy file with proper prefix
 */
function copyFileWithPrefix(sourcePath, targetDir, filename, domainPrefix) {
  // Check if filename already has proper prefix
  let targetFilename = filename;
  if (!filename.startsWith(domainPrefix + '_')) {
    targetFilename = `${domainPrefix}_${filename}`;
  }

  const targetPath = path.join(targetDir, targetFilename);

  // Skip if target already exists
  if (fs.existsSync(targetPath)) {
    console.log(`   ⏭️  Skipped: ${filename} (already exists as ${targetFilename})`);
    stats.filesSkipped++;
    return;
  }

  // Copy the file
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`   ✅ Copied: ${filename} → ${targetFilename}`);
  stats.filesCopied++;
}

/**
 * Process legacy seeds/weights folders for a domain
 */
function processDomain(domainPath) {
  const domainName = path.basename(domainPath);
  let hadLegacyFolders = false;

  // Process legacy 'seeds' folder
  const legacySeedsPath = path.join(domainPath, 'seeds');
  const prefixedSeedsPath = path.join(domainPath, `${domainName}_seeds`);

  if (fs.existsSync(legacySeedsPath)) {
    hadLegacyFolders = true;
    console.log(`\n📁 Processing ${domainName} - legacy seeds`);

    // Ensure prefixed folder exists
    if (!fs.existsSync(prefixedSeedsPath)) {
      fs.mkdirSync(prefixedSeedsPath, { recursive: true });
    }

    // Copy all files from legacy to prefixed folder
    const files = fs.readdirSync(legacySeedsPath);
    for (const file of files) {
      const sourcePath = path.join(legacySeedsPath, file);
      const stat = fs.statSync(sourcePath);

      if (stat.isFile() && file.endsWith('.json')) {
        copyFileWithPrefix(sourcePath, prefixedSeedsPath, file, domainName);
      }
    }

    // Delete legacy folder
    console.log(`   🗑️  Deleting legacy 'seeds' folder`);
    deleteFolderRecursive(legacySeedsPath);
  }

  // Process legacy 'weights' folder
  const legacyWeightsPath = path.join(domainPath, 'weights');
  const prefixedWeightsPath = path.join(domainPath, `${domainName}_weights`);

  if (fs.existsSync(legacyWeightsPath)) {
    if (!hadLegacyFolders) {
      console.log(`\n📁 Processing ${domainName} - legacy weights`);
      hadLegacyFolders = true;
    }

    // Ensure prefixed folder exists
    if (!fs.existsSync(prefixedWeightsPath)) {
      fs.mkdirSync(prefixedWeightsPath, { recursive: true });
    }

    // Copy all files from legacy to prefixed folder
    const files = fs.readdirSync(legacyWeightsPath);
    for (const file of files) {
      const sourcePath = path.join(legacyWeightsPath, file);
      const stat = fs.statSync(sourcePath);

      if (stat.isFile()) {
        copyFileWithPrefix(sourcePath, prefixedWeightsPath, file, domainName);
      }
    }

    // Delete legacy folder
    console.log(`   🗑️  Deleting legacy 'weights' folder`);
    deleteFolderRecursive(legacyWeightsPath);
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
        console.error(`   ❌ Error processing ${domain}:`, error.message);
      }
    }
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Legacy Migration Complete!                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   Files copied: ${stats.filesCopied}`);
  console.log(`   Files skipped (already exist): ${stats.filesSkipped}`);
  console.log(`   Legacy folders deleted: ${stats.foldersDeleted}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✅ No errors encountered!');
  }
}

// Run the script
main();

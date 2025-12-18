#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOMAINS_DIR = path.join(__dirname, '..', 'src', 'ai', 'knowledge-domains');

function cleanDomainFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  
  // Remove registerDomainFiles blocks (can span many lines)
  content = content.replace(/\s*registerDomainFiles\([^)]+,\s*\[[^\]]*\]\)/gs, '');
  
  // Remove try/catch blocks containing watchDomainFiles
  content = content.replace(/\s*try\s*\{[^}]*watchDomainFiles[^}]*\}\s*catch[^}]*\{[^}]*\}/gs, '');
  
  // Clean up multiple consecutive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const integrationFiles = fs.readdirSync(DOMAINS_DIR)
  .filter(name => {
    const stats = fs.statSync(path.join(DOMAINS_DIR, name));
    return stats.isDirectory();
  })
  .map(name => path.join(DOMAINS_DIR, name, `${name}_integrationAPI.ts`))
  .filter(file => fs.existsSync(file));

let count = 0;
for (const file of integrationFiles) {
  try {
    if (cleanDomainFile(file)) {
      console.log(`✅ Cleaned ${path.basename(path.dirname(file))}`);
      count++;
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${file}:`, error.message);
  }
}

console.log(`\n✨ Cleaned ${count} files`);

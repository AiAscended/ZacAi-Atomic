#!/usr/bin/env node
/**
 * Unify all domain integrationAPI files to use the single domainRegistry
 * Replaces old registry.ts imports with domainRegistry.ts
 */

const fs = require('fs');
const path = require('path');

const DOMAINS_DIR = path.join(__dirname, '..', 'src', 'ai', 'knowledge-domains');

// Get all domain directories
const domainDirs = fs.readdirSync(DOMAINS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${domainDirs.length} domain directories`);

let fixed = 0;
let skipped = 0;
let errors = 0;

for (const domain of domainDirs) {
  const integrationFile = path.join(DOMAINS_DIR, domain, `${domain}_integrationAPI.ts`);
  
  if (!fs.existsSync(integrationFile)) {
    console.log(`⚠️  Skipping ${domain} - no integrationAPI file`);
    skipped++;
    continue;
  }
  
  try {
    let content = fs.readFileSync(integrationFile, 'utf-8');
    
    // Skip if already using domainRegistry
    if (content.includes("from '../domainRegistry'") || content.includes('from "../domainRegistry"')) {
      console.log(`✓ ${domain} already uses domainRegistry`);
      skipped++;
      continue;
    }
    
    // Replace old registry import
    content = content.replace(
      /import\s*{\s*registerDomain\s*}\s*from\s*['"]\.\.\/registry['"]/g,
      "import { domainRegistry } from '../domainRegistry'"
    );
    
    // Replace registerDomain calls with domainRegistry.registerDomain
    // Find the registerDomain({ ... }) call and replace it
    const registerDomainRegex = /registerDomain\(\{[\s\S]*?\}\);/g;
    
    if (content.match(registerDomainRegex)) {
      // Extract domain name from DOMAIN_NAME constant
      const domainNameMatch = content.match(/const\s+DOMAIN_NAME\s*=\s*['"]([^'"]+)['"]/);
      if (!domainNameMatch) {
        console.log(`⚠️  Could not find DOMAIN_NAME in ${domain}`);
        skipped++;
        continue;
      }
      
      const domainName = domainNameMatch[1];
      const displayName = domainName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Replace the registerDomain call with proper DomainMetadata structure
      content = content.replace(registerDomainRegex, `domainRegistry.registerDomain({
  name: DOMAIN_NAME,
  displayName: '${displayName}',
  description: '${displayName} domain capabilities',
  atomicLevel: 'molecule',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, \`\${DOMAIN_NAME}_seeds\`),
  learnedDataPath: path.join(DOMAIN_DIR, \`\${DOMAIN_NAME}_learned\`),
  weightsPath: path.join(DOMAIN_DIR, \`\${DOMAIN_NAME}_weights\`),
  enabled: true
});`);
    }
    
    // Write back
    fs.writeFileSync(integrationFile, content, 'utf-8');
    console.log(`✅ Fixed ${domain}`);
    fixed++;
    
  } catch (error) {
    console.error(`❌ Error processing ${domain}:`, error.message);
    errors++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Fixed: ${fixed}`);
console.log(`⚠️  Skipped: ${skipped}`);
console.log(`❌ Errors: ${errors}`);
console.log('='.repeat(60));

if (fixed > 0) {
  console.log('\n✨ Registry unification complete! All domains now use domainRegistry.');
}

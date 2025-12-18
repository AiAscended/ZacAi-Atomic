#!/usr/bin/env node

/**
 * Fix Integration API imports
 * Changes registerDomain import to use domainRegistry singleton
 */

const fs = require('fs');
const path = require('path');

const DOMAINS_PATH = path.join(__dirname, '../src/ai/knowledge-domains');

const domainsToFix = ['repair', 'observability', 'data_integrity', 'system'];

let filesFixed = 0;

for (const domain of domainsToFix) {
  const filePath = path.join(DOMAINS_PATH, domain, `${domain}_integrationAPI.ts`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${domain}_integrationAPI.ts`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("import { registerDomain } from '../domainRegistry';")) {
    content = content.replace(
      "import { registerDomain } from '../domainRegistry';",
      "import { domainRegistry } from '../domainRegistry';"
    );
    
    // Also need to replace registerDomain( calls with domainRegistry.registerDomain(
    content = content.replace(/registerDomain\(/g, 'domainRegistry.registerDomain(');
    
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`✅ Fixed ${domain}_integrationAPI.ts`);
  }
}

console.log(`\n📊 Summary: ${filesFixed} files fixed`);

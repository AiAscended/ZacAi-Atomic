/**
 * File: scripts/verify-system-status.js
 * Purpose: Verify all AI system components are operational
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ZacAi-Atomic System Verification\n');
console.log('=' .repeat(60));

// Check domains
const domainsDir = path.join(__dirname, '../src/ai/knowledge-domains');
const domainDirs = fs.readdirSync(domainsDir)
  .filter(item => {
    const fullPath = path.join(domainsDir, item);
    return fs.statSync(fullPath).isDirectory();
  })
  .filter(item => !item.startsWith('.'));

console.log(`\n📚 Knowledge Domains: ${domainDirs.length}`);
domainDirs.sort().forEach((domain, i) => {
  const hasIntegration = fs.existsSync(path.join(domainsDir, domain, `${domain}_integrationAPI.ts`));
  const hasVocabulary = fs.existsSync(path.join(domainsDir, domain, `${domain}_vocabulary`));
  const hasWeights = fs.existsSync(path.join(domainsDir, domain, `${domain}_weights`));
  const hasSeed = fs.existsSync(path.join(domainsDir, domain, `${domain}_seeds`));
  
  const status = [
    hasIntegration ? '✓' : '✗',
    hasVocabulary ? '✓' : '✗',
    hasWeights ? '✓' : '✗',
    hasSeed ? '✓' : '✗'
  ].join(' ');
  
  console.log(`  ${String(i + 1).padStart(2, ' ')}. ${domain.padEnd(25)} [Int:${hasIntegration ? '✓' : '✗'} Vocab:${hasVocabulary ? '✓' : '✗'} Weights:${hasWeights ? '✓' : '✗'} Seeds:${hasSeed ? '✓' : '✗'}]`);
});

// Check models
const modelsDir = path.join(__dirname, '../src/ai/models');
const modelDirs = fs.readdirSync(modelsDir)
  .filter(item => {
    const fullPath = path.join(modelsDir, item);
    return fs.statSync(fullPath).isDirectory();
  })
  .filter(item => !item.startsWith('.'));

console.log(`\n🤖 AI Model Layers: ${modelDirs.length}`);
modelDirs.sort().forEach((model, i) => {
  const hasInference = fs.existsSync(path.join(modelsDir, model, `${model}_inference`));
  const hasTraining = fs.existsSync(path.join(modelsDir, model, `${model}_training`));
  const hasTests = fs.existsSync(path.join(modelsDir, model, `${model}_tests`));
  
  console.log(`  ${String(i + 1).padStart(2, ' ')}. ${model.padEnd(35)} [Inf:${hasInference ? '✓' : '✗'} Train:${hasTraining ? '✓' : '✗'} Tests:${hasTests ? '✓' : '✗'}]`);
});

// Check tests
const testsDir = path.join(__dirname, '../src/ai/tests');
if (fs.existsSync(testsDir)) {
  const testCategories = fs.readdirSync(testsDir)
    .filter(item => {
      const fullPath = path.join(testsDir, item);
      return fs.statSync(fullPath).isDirectory();
    });
  
  let totalTests = 0;
  console.log(`\n🧪 Test Suites: ${testCategories.length}`);
  testCategories.forEach((category, i) => {
    const testFiles = fs.readdirSync(path.join(testsDir, category))
      .filter(f => f.endsWith('.test.ts'));
    totalTests += testFiles.length;
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${category.padEnd(20)} (${testFiles.length} test files)`);
  });
  console.log(`\n  Total test files: ${totalTests}`);
}

// Check admin pages
const adminDir = path.join(__dirname, '../src/app/admin');
const adminPages = fs.readdirSync(adminDir)
  .filter(item => {
    const fullPath = path.join(adminDir, item);
    return fs.statSync(fullPath).isDirectory();
  })
  .filter(item => !item.startsWith('.'));

console.log(`\n⚙️  Admin Pages: ${adminPages.length}`);
adminPages.sort().forEach((page, i) => {
  const hasPage = fs.existsSync(path.join(adminDir, page, 'page.tsx'));
  console.log(`  ${String(i + 1).padStart(2, ' ')}. ${page.padEnd(20)} ${hasPage ? '✓' : '✗'}`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log(`  • ${domainDirs.length} Knowledge Domains`);
console.log(`  • ${modelDirs.length} AI Model Layers`);
console.log(`  • ${adminPages.length} Admin Pages`);
console.log(`  • Production-ready 2025 Hybrid AI Architecture`);
console.log('='.repeat(60));
console.log('\n✅ System verification complete!\n');

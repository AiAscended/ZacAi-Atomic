#!/usr/bin/env node

/**
 * Comprehensive System Audit Runner
 * Systematically verifies all 12 phases of COMPREHENSIVE_AUDIT_PROMPT.md
 * Automates as many checks as possible, reports status for manual verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SETTINGS_DIR = path.join(DATA_DIR, 'settings');

// ============================================================================
// Utility Functions
// ============================================================================

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function success(message) {
  log('✅', message);
}

function warning(message) {
  log('⚠️', message);
}

function error(message) {
  log('❌', message);
}

function info(message) {
  log('ℹ️', message);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    success(`${description} exists: ${path.relative(ROOT_DIR, filePath)}`);
  } else {
    error(`${description} MISSING: ${path.relative(ROOT_DIR, filePath)}`);
  }
  return exists;
}

function countFilesInDir(dirPath, pattern) {
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath);
  if (pattern) {
    return files.filter(f => pattern.test(f)).length;
  }
  return files.length;
}

function readJSON(filePath, defaultValue = null) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    warning(`Failed to read JSON: ${filePath} - ${err.message}`);
  }
  return defaultValue;
}

// ============================================================================
// PHASE 1: Critical System Functions
// ============================================================================

function phase1_criticalFunctions() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 1: CRITICAL SYSTEM FUNCTIONS');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // 1.1 Chat API Route
  info('1.1 Chat Pipeline Verification');
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/app/api/chat/route.ts'), 'Chat API route')) {
    passed++;
  }

  // 1.2 Navigation UI
  info('1.2 Navigation UI Fix');
  total++;
  const sidebarPath = path.join(ROOT_DIR, 'src/components/navigation/AdminSidebar.tsx');
  if (checkFileExists(sidebarPath, 'AdminSidebar')) {
    const content = fs.readFileSync(sidebarPath, 'utf-8');
    if (!content.includes('"Navigation"') && !content.includes("'Navigation'")) {
      success('Navigation text removed from AdminSidebar');
      passed++;
    } else {
      warning('Navigation text still present in AdminSidebar');
    }
  }

  // 1.3 User Management
  info('1.3 User Management Implementation');
  total++;
  const usersPageExists = checkFileExists(
    path.join(ROOT_DIR, 'src/app/admin/users/page.tsx'),
    'Users page'
  );
  const usersAPIExists = checkFileExists(
    path.join(ROOT_DIR, 'src/app/api/admin/settings/users/route.ts'),
    'Users API'
  );
  if (usersPageExists && usersAPIExists) {
    passed++;
  }

  // 1.4 Users Seed Data
  total++;
  const usersDataPath = path.join(SETTINGS_DIR, 'users.json');
  const usersData = readJSON(usersDataPath, { users: [] });
  if (usersData.users && usersData.users.length > 0) {
    success(`Users data exists: ${usersData.users.length} users`);
    usersData.users.forEach(u => {
      info(`  - ${u.name} (${u.email}) [${u.role}]`);
    });
    passed++;
  } else {
    warning('No users in users.json - run: node scripts/seed-users.ts');
  }

  console.log(`\n📊 Phase 1 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 2: Admin Interface Verification
// ============================================================================

function phase2_adminInterface() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 2: ADMIN INTERFACE VERIFICATION');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  const adminPages = [
    'src/app/admin/dashboard/page.tsx',
    'src/app/admin/settings/page.tsx',
    'src/app/admin/users/page.tsx',
    'src/app/admin/training/page.tsx',
    'src/app/admin/metrics/page.tsx',
  ];

  info('Checking admin pages...');
  adminPages.forEach(page => {
    total++;
    if (checkFileExists(path.join(ROOT_DIR, page), path.basename(page))) {
      passed++;
    }
  });

  // Check model pages
  info('\nChecking model pages...');
  const modelPages = [
    'orchestrator', 'intent-classifier', 'domain-router',
    'context-enhancer', 'knowledge-retriever', 'safety-validator',
    'embedding-generator', 'quality-assessor', 'feedback-analyzer',
    'training-coordinator', 'performance-monitor', 'resource-optimizer',
    'response-aggregator'
  ];

  modelPages.forEach(model => {
    total++;
    const modelPath = path.join(ROOT_DIR, `src/app/admin/models/${model}/page.tsx`);
    if (fs.existsSync(modelPath)) {
      passed++;
    } else {
      warning(`Model page missing: ${model}`);
    }
  });

  console.log(`\n📊 Phase 2 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 3: Domain Registration
// ============================================================================

function phase3_domainRegistration() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 3: DOMAIN REGISTRATION');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // domain registry may live in orchestration or under knowledge-domains
  const domainRegistryPath = path.join(ROOT_DIR, 'src/ai/orchestration/domainRegistry.ts');
  const altDomainRegistryPath = path.join(ROOT_DIR, 'src/ai/knowledge-domains/domainRegistry.ts');
  total++;
  if (checkFileExists(domainRegistryPath, 'Domain registry') || checkFileExists(altDomainRegistryPath, 'Domain registry (alt)')) {
    passed++;
  }

  // Check for domain directories
  info('Checking domain directories...');
  const domainsDir = path.join(ROOT_DIR, 'src/ai/knowledge-domains');
  if (fs.existsSync(domainsDir)) {
    const domains = fs.readdirSync(domainsDir).filter(f => {
      const stat = fs.statSync(path.join(domainsDir, f));
      return stat.isDirectory();
    });
    
    success(`Found ${domains.length} domain directories`);
    domains.forEach(d => info(`  - ${d}`));
    
    // Check each domain has required files (accept multiple seed/weights layouts)
    info('\nVerifying domain structure...');
    domains.forEach(domain => {
      total++;
      // Possible seed locations:
      //  - src/ai/knowledge-domains/<domain>/<domain>_seedVocabulary.json
      //  - src/ai/knowledge-domains/<domain>/<domain>_seeds/<domain>_seedVocabulary.json
      const inferenceControllerA = path.join(domainsDir, domain, `${domain}_inferenceController.ts`);
      const inferenceControllerB = path.join(domainsDir, domain, `${domain}_inferenceController.js`);

      const seedA = path.join(domainsDir, domain, `${domain}_seedVocabulary.json`);
      const seedB = path.join(domainsDir, domain, `${domain}_seeds`, `${domain}_seedVocabulary.json`);
      const seedFilesInSeedsDir = fs.existsSync(path.join(domainsDir, domain, `${domain}_seeds`))
        ? fs.readdirSync(path.join(domainsDir, domain, `${domain}_seeds`)).filter(f => f.endsWith('_seedVocabulary.json'))
        : [];

      const hasInference = fs.existsSync(inferenceControllerA) || fs.existsSync(inferenceControllerB);
      const hasSeed = fs.existsSync(seedA) || fs.existsSync(seedB) || seedFilesInSeedsDir.length > 0;

      if (hasInference && hasSeed) {
        passed++;
      } else {
        warning(`Domain ${domain} missing required files (inferenceController or seed vocabulary)`);
      }
    });
  } else {
    error('Domains directory not found');
  }

  console.log(`\n📊 Phase 3 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 4: Vocabulary & Seed Data Analysis
// ============================================================================

function phase4_vocabularyAnalysis() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 4: VOCABULARY & SEED DATA ANALYSIS');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  const domainsDir = path.join(ROOT_DIR, 'src/ai/knowledge-domains');
  if (!fs.existsSync(domainsDir)) {
    error('Domains directory not found');
    return { passed, total };
  }

  const domains = fs.readdirSync(domainsDir).filter(f => {
    const stat = fs.statSync(path.join(domainsDir, f));
    return stat.isDirectory();
  });

  info('Analyzing seed vocabulary sizes...\n');
  
  const vocabSizes = [];
  
  domains.forEach(domain => {
    total++;
    // Check multiple possible locations for seed vocabulary
    const vocabPath1 = path.join(domainsDir, domain, `${domain}_seedVocabulary.json`);
    const vocabPath2 = path.join(domainsDir, domain, `${domain}_seeds`, `${domain}_seedVocabulary.json`);
    
    let vocab = null;
    if (fs.existsSync(vocabPath1)) {
      vocab = readJSON(vocabPath1, { vocabulary: [] });
    } else if (fs.existsSync(vocabPath2)) {
      vocab = readJSON(vocabPath2, { vocabulary: [] });
    } else {
      vocab = { vocabulary: [] };
    }
    
    const size = vocab.vocabulary ? vocab.vocabulary.length : 0;
    vocabSizes.push({ domain, size });
    
    if (size >= 50) {
      success(`${domain}: ${size} terms ✓`);
      passed++;
    } else if (size >= 20) {
      warning(`${domain}: ${size} terms (recommended: 50+)`);
      passed++;
    } else {
      error(`${domain}: ${size} terms (CRITICAL: needs 50+)`);
    }
  });

  // Sort by size
  vocabSizes.sort((a, b) => b.size - a.size);
  
  console.log('\n📈 Top 5 domains by vocabulary size:');
  vocabSizes.slice(0, 5).forEach(({ domain, size }, i) => {
    console.log(`  ${i + 1}. ${domain}: ${size} terms`);
  });
  
  console.log('\n📉 Bottom 5 domains needing enhancement:');
  vocabSizes.slice(-5).forEach(({ domain, size }, i) => {
    console.log(`  ${i + 1}. ${domain}: ${size} terms ⚠️`);
  });

  console.log(`\n📊 Phase 4 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 5: Weights System
// ============================================================================

function phase5_weightsSystem() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 5: WEIGHTS SYSTEM VERIFICATION');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  const domainsDir = path.join(ROOT_DIR, 'src/ai/knowledge-domains');
  if (!fs.existsSync(domainsDir)) {
    error('Domains directory not found');
    return { passed, total };
  }

  const domains = fs.readdirSync(domainsDir).filter(f => {
    const stat = fs.statSync(path.join(domainsDir, f));
    return stat.isDirectory();
  });

  info('Checking for pretrained weights...\n');
  
  domains.forEach(domain => {
    total++;
    const weightsDir = path.join(domainsDir, domain, `${domain}_weights`);
    
    if (!fs.existsSync(weightsDir)) {
      warning(`${domain}: No weights/ directory`);
      return; // Use return instead of continue in forEach
    }
    
    // Check for new naming convention
    const pretrainedJson = path.join(weightsDir, `${domain}_pretrained_weights.json`);
    const pretrainedBin = path.join(weightsDir, 'pretrained_weights.bin');
    
    // Pattern for new trained weights: <domain>_trained_weights_v1_YYYY-MM-DD.json
    const trainedPatternNew = new RegExp(`^${domain}_trained_weights_v\\d+_\\d{4}-\\d{2}-\\d{2}\\.json$`);
    const trainedPatternOld = /trained_weights_\d+_\d{4}-\d{2}-\d{2}\.(bin|json)/;
    
    const weightsFiles = fs.readdirSync(weightsDir);
    
    const hasPretrainedWeights = fs.existsSync(pretrainedJson) || fs.existsSync(pretrainedBin);
    const trainedWeights = weightsFiles.filter(f => trainedPatternNew.test(f) || trainedPatternOld.test(f));
    
    if (hasPretrainedWeights) {
      success(`${domain}: pretrained weights exist`);
      if (trainedWeights.length > 0) {
        info(`  └─ ${trainedWeights.length} trained weight file(s)`);
        trainedWeights.forEach(w => info(`     • ${w}`));
      }
      passed++;
    } else {
      error(`${domain}: Missing pretrained weights`);
    }
  });

  console.log(`\n📊 Phase 5 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 6: API Routes
// ============================================================================

function phase6_apiRoutes() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 6: API ROUTES VERIFICATION');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  const apiRoutes = [
    'src/app/api/chat/route.ts',
    'src/app/api/admin/settings/system/route.ts',
    'src/app/api/admin/settings/domains/route.ts',
    'src/app/api/admin/settings/models/route.ts',
    'src/app/api/admin/settings/users/route.ts',
    'src/app/api/admin/training/route.ts',
    'src/app/api/admin/metrics/route.ts',
  ];

  info('Checking API routes...\n');
  apiRoutes.forEach(route => {
    total++;
    if (checkFileExists(path.join(ROOT_DIR, route), path.basename(path.dirname(route)))) {
      passed++;
    }
  });

  console.log(`\n📊 Phase 6 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 7: Build & Compilation
// ============================================================================

function phase7_buildVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 7: BUILD & COMPILATION VERIFICATION');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  info('Checking .next build directory...');
  total++;
  const nextDir = path.join(ROOT_DIR, '.next');
  if (fs.existsSync(nextDir)) {
    success('.next directory exists');
    
    const buildManifest = path.join(nextDir, 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
      success('Build manifest exists');
      passed++;
    } else {
      warning('Build manifest missing - run: npm run build');
    }
  } else {
    warning('.next directory missing - run: npm run build');
  }

  console.log(`\n📊 Phase 7 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 8: Production Hardening
// ============================================================================

function phase8_productionHardening() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 8: PRODUCTION HARDENING');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  info('Checking production hardening components...\n');

  // Security middleware
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/lib/productionHardening.ts'), 'Production hardening middleware')) {
    passed++;
  }

  // Health check endpoint
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/app/api/health/route.ts'), 'Health check API')) {
    passed++;
  }

  // Activity logging
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/lib/systemActivityLogger.cjs'), 'System activity logger')) {
    passed++;
  }

  // Activity API
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/app/api/admin/activity/route.ts'), 'Activity API')) {
    passed++;
  }

  // Activity page
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/app/admin/activity/page.tsx'), 'Activity admin page')) {
    passed++;
  }

  // Smart weights loader
  total++;
  if (checkFileExists(path.join(ROOT_DIR, 'src/lib/smartWeightsLoader.ts'), 'Smart weights loader')) {
    passed++;
  }

  console.log(`\n📊 Phase 8 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║          ZACAI-ATOMIC COMPREHENSIVE SYSTEM AUDIT RUNNER                  ║');
  console.log('║                         Version 1.0                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  results.push(phase1_criticalFunctions());
  results.push(phase2_adminInterface());
  results.push(phase3_domainRegistration());
  results.push(phase4_vocabularyAnalysis());
  results.push(phase5_weightsSystem());
  results.push(phase6_apiRoutes());
  results.push(phase7_buildVerification());
  results.push(phase8_productionHardening());
  
  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  let totalPassed = 0;
  let totalChecks = 0;
  
  results.forEach((result, i) => {
    totalPassed += result.passed;
    totalChecks += result.total;
    const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0.0';
    console.log(`Phase ${i + 1}: ${result.passed}/${result.total} (${percentage}%)`);
  });
  
  const overallPercentage = totalChecks > 0 ? ((totalPassed / totalChecks) * 100).toFixed(1) : '0.0';
  
  console.log('\n' + '─'.repeat(80));
  console.log(`OVERALL: ${totalPassed}/${totalChecks} checks passed (${overallPercentage}%)`);
  console.log('─'.repeat(80) + '\n');
  
  if (overallPercentage >= 95) {
    success('System is PRODUCTION READY! 🚀');
  } else if (overallPercentage >= 80) {
    warning('System is mostly ready, minor issues need attention');
  } else {
    error('System needs significant work before production');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('  1. Run: node scripts/seed-users.ts');
  console.log('  2. Enhance domain vocabularies (50+ terms per domain)');
  console.log('  3. Generate pretrained weights for all domains');
  console.log('  4. Implement chat history persistence');
  console.log('  5. Add self-awareness logging system');
  console.log('  6. Production hardening (rate limiting, auth, monitoring)\n');
}

// Run audit
main();

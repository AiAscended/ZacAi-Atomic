#!/usr/bin/env node

/**
 * Advanced Comprehensive Audit Runner for ZacAi-Atomic
 * Extends the basic 8-phase audit with Phases 9-12:
 * - Phase 9: UI/UX Verification
 * - Phase 10: Testing & Quality Assurance
 * - Phase 11: Documentation Review
 * - Phase 12: Deployment Readiness
 * 
 * Based on COMPREHENSIVE_AUDIT_PROMPT.md (742 lines, 12 phases)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const success = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const error = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const warning = (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.cyan}ℹ️ ${msg}${colors.reset}`);

// ============================================================================
// PHASE 9: UI/UX Verification
// ============================================================================

function phase9_uiUxVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 9: UI/UX VERIFICATION');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // 9.1: Chat Interface Components
  info('Checking ChatGPT-style interface components...');
  total++;
  const chatPage = path.join(ROOT_DIR, 'src/app/page.tsx');
  if (fs.existsSync(chatPage)) {
    success('Chat interface page exists');
    passed++;
  } else {
    error('Chat interface page missing');
  }

  // 9.2: Prism.js for syntax highlighting
  total++;
  const packageJson = path.join(ROOT_DIR, 'package.json');
  const pkgContent = fs.readFileSync(packageJson, 'utf-8');
  if (pkgContent.includes('prismjs')) {
    success('Prism.js installed for code syntax highlighting');
    passed++;
  } else {
    warning('Prism.js not found in dependencies');
  }

  // 9.3: Admin Dashboard
  total++;
  const adminPage = path.join(ROOT_DIR, 'src/app/admin/page.tsx');
  if (fs.existsSync(adminPage)) {
    success('Admin dashboard exists');
    passed++;
  } else {
    error('Admin dashboard missing');
  }

  // 9.4: Responsive Design (Tailwind Config)
  total++;
  const tailwindConfig = path.join(ROOT_DIR, 'tailwind.config.ts');
  if (fs.existsSync(tailwindConfig)) {
    success('Tailwind CSS configured for responsive design');
    passed++;
  } else {
    warning('Tailwind config not found');
  }

  // 9.5: Dark Mode Theme Support
  total++;
  if (pkgContent.includes('next-themes')) {
    success('Dark mode theme support installed (next-themes)');
    passed++;
  } else {
    warning('Theme system not configured');
  }

  // 9.6: Accessibility - React ARIA Components
  total++;
  if (pkgContent.includes('@radix-ui/react')) {
    success('Accessible UI components installed (@radix-ui)');
    passed++;
  } else {
    warning('Accessibility component library not found');
  }

  console.log(`\n📊 Phase 9 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 10: Testing & Quality Assurance
// ============================================================================

function phase10_testingQa() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 10: TESTING & QUALITY ASSURANCE');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // 10.1: Check for test files
  info('Scanning for test files...');
  total++;
  const testFiles = [];
  const scanTestFiles = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.next') {
        scanTestFiles(fullPath);
      } else if (item.isFile() && /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(item.name)) {
        testFiles.push(fullPath);
      }
    }
  };
  
  try {
    scanTestFiles(path.join(ROOT_DIR, 'src'));
    if (testFiles.length > 0) {
      success(`Found ${testFiles.length} test files`);
      passed++;
    } else {
      warning('No test files found');
    }
  } catch (e) {
    error('Error scanning for test files');
  }

  // 10.2: Test runner configuration
  total++;
  const hasVitest = fs.existsSync(path.join(ROOT_DIR, 'vitest.config.ts')) || 
                    fs.existsSync(path.join(ROOT_DIR, 'vitest.config.js'));
  const hasJest = fs.existsSync(path.join(ROOT_DIR, 'jest.config.js')) ||
                  fs.existsSync(path.join(ROOT_DIR, 'jest.config.ts'));
  
  if (hasVitest || hasJest) {
    success(`Test runner configured: ${hasVitest ? 'Vitest' : 'Jest'}`);
    passed++;
  } else {
    warning('No test runner configured (Vitest/Jest)');
  }

  // 10.3: Package.json test script
  total++;
  const packageJson = fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8');
  const pkg = JSON.parse(packageJson);
  if (pkg.scripts && pkg.scripts.test) {
    success('Test script defined in package.json');
    passed++;
  } else {
    warning('No "test" script in package.json');
  }

  // 10.4: ESLint configuration
  total++;
  const hasEslint = fs.existsSync(path.join(ROOT_DIR, '.eslintrc.json')) ||
                    fs.existsSync(path.join(ROOT_DIR, '.eslintrc.js')) ||
                    fs.existsSync(path.join(ROOT_DIR, 'eslint.config.js'));
  if (hasEslint) {
    success('ESLint configured for code quality');
    passed++;
  } else {
    warning('ESLint configuration not found');
  }

  // 10.5: TypeScript strict mode
  total++;
  const tsconfigPath = path.join(ROOT_DIR, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      // Remove comments from JSON (simple approach for tsconfig.json)
      const cleanedContent = tsconfigContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      const tsconfig = JSON.parse(cleanedContent);
      if (tsconfig.compilerOptions && tsconfig.compilerOptions.strict) {
        success('TypeScript strict mode enabled');
        passed++;
      } else {
        warning('TypeScript strict mode not enabled');
      }
    } catch (e) {
      warning('Could not parse tsconfig.json (may contain comments)');
    }
  } else {
    error('tsconfig.json not found');
  }

  // 10.6: Test coverage display
  info(`\n📋 Test Files Summary (${testFiles.length} files):`);
  const testsByType = {
    model: testFiles.filter(f => f.includes('/models/')).length,
    domain: testFiles.filter(f => f.includes('/knowledge-domains/')).length,
    admin: testFiles.filter(f => f.includes('/admin/')).length,
    utils: testFiles.filter(f => f.includes('/__tests__/')).length,
  };
  console.log(`  - Model tests: ${testsByType.model}`);
  console.log(`  - Domain tests: ${testsByType.domain}`);
  console.log(`  - Admin tests: ${testsByType.admin}`);
  console.log(`  - Utility tests: ${testsByType.utils}`);

  console.log(`\n📊 Phase 10 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 11: Documentation Review
// ============================================================================

function phase11_documentationReview() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 11: DOCUMENTATION REVIEW');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // 11.1: README.md
  total++;
  const readme = path.join(ROOT_DIR, 'README.md');
  if (fs.existsSync(readme)) {
    const content = fs.readFileSync(readme, 'utf-8');
    if (content.length > 1000 && content.includes('Installation') || content.includes('Usage')) {
      success('README.md exists with comprehensive content');
      passed++;
    } else {
      warning('README.md exists but may need more detail');
    }
  } else {
    error('README.md not found');
  }

  // 11.2: QUICKSTART.md
  total++;
  const quickstart = path.join(ROOT_DIR, 'docs/QUICKSTART.md');
  if (fs.existsSync(quickstart)) {
    success('QUICKSTART.md exists');
    passed++;
  } else {
    warning('QUICKSTART.md not found');
  }

  // 11.3: Architecture documentation
  total++;
  const archDocs = [
    'SYSTEM_COMPLETE.md',
    'ORCHESTRATION_FLOW.md',
    'PLUGIN_ARCHITECTURE.md',
    'SEED_SYSTEM_ARCHITECTURE.md',
  ];
  const existingArchDocs = archDocs.filter(doc => 
    fs.existsSync(path.join(ROOT_DIR, 'docs', doc)) || 
    fs.existsSync(path.join(ROOT_DIR, doc))
  );
  if (existingArchDocs.length >= 3) {
    success(`Architecture documentation exists (${existingArchDocs.length}/${archDocs.length} docs)`);
    passed++;
  } else {
    warning('Architecture documentation incomplete');
  }

  // 11.4: Admin quick reference
  total++;
  const adminRef = path.join(ROOT_DIR, 'ADMIN_QUICK_REFERENCE.md');
  if (fs.existsSync(adminRef)) {
    success('ADMIN_QUICK_REFERENCE.md exists');
    passed++;
  } else {
    warning('Admin quick reference guide not found');
  }

  // 11.5: API documentation
  total++;
  const apiDocs = fs.existsSync(path.join(ROOT_DIR, 'docs/api')) ||
                  fs.existsSync(path.join(ROOT_DIR, 'docs/API.md'));
  if (apiDocs) {
    success('API documentation exists');
    passed++;
  } else {
    warning('API documentation not found');
  }

  // 11.6: Scan all markdown files
  info('\n📄 Documentation Files Found:');
  const docFiles = [];
  const scanDocs = (dir, prefix = '') => {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name === 'node_modules' || item.name === '.next') continue;
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          scanDocs(fullPath, prefix + item.name + '/');
        } else if (item.name.endsWith('.md')) {
          docFiles.push(prefix + item.name);
        }
      }
    } catch (e) {
      // Ignore permission errors
    }
  };
  
  scanDocs(ROOT_DIR);
  docFiles.sort().forEach(doc => console.log(`  - ${doc}`));
  console.log(`\n  Total: ${docFiles.length} markdown files`);

  console.log(`\n📊 Phase 11 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// PHASE 12: Deployment Readiness
// ============================================================================

function phase12_deploymentReadiness() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 12: DEPLOYMENT READINESS');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // 12.1: Environment configuration
  total++;
  const envExample = path.join(ROOT_DIR, '.env.example');
  const envLocal = path.join(ROOT_DIR, '.env.local');
  if (fs.existsSync(envExample) || fs.existsSync(envLocal)) {
    success('Environment configuration documented');
    passed++;
  } else {
    warning('.env.example not found');
  }

  // 12.2: Production build check
  info('Checking production build configuration...');
  total++;
  const nextConfig = path.join(ROOT_DIR, 'next.config.mjs');
  if (fs.existsSync(nextConfig)) {
    success('Next.js configuration exists');
    passed++;
  } else {
    error('next.config.mjs not found');
  }

  // 12.3: Build output directory
  total++;
  const buildDir = path.join(ROOT_DIR, '.next');
  if (fs.existsSync(buildDir)) {
    success('Build directory exists (.next)');
    passed++;
  } else {
    warning('No build directory found - run "npm run build"');
  }

  // 12.4: Docker configuration
  total++;
  const dockerfile = path.join(ROOT_DIR, 'Dockerfile');
  const dockerCompose = path.join(ROOT_DIR, 'docker-compose.yml');
  if (fs.existsSync(dockerfile) || fs.existsSync(dockerCompose)) {
    success('Docker configuration exists');
    passed++;
  } else {
    warning('Docker configuration not found (optional)');
  }

  // 12.5: Health check endpoint
  total++;
  const healthRoute = path.join(ROOT_DIR, 'src/app/api/health/route.ts');
  if (fs.existsSync(healthRoute)) {
    success('Health check endpoint exists: /api/health');
    passed++;
  } else {
    warning('Health check endpoint not found');
  }

  // 12.6: Monitoring setup
  total++;
  const monitoringLib = path.join(ROOT_DIR, 'src/lib/systemActivityLogger.cjs');
  const productionHardening = path.join(ROOT_DIR, 'src/lib/productionHardening.ts');
  if (fs.existsSync(monitoringLib) || fs.existsSync(productionHardening)) {
    success('Monitoring/logging infrastructure exists');
    passed++;
  } else {
    warning('Monitoring infrastructure not configured');
  }

  // 12.7: Git repository check
  total++;
  const gitDir = path.join(ROOT_DIR, '.git');
  if (fs.existsSync(gitDir)) {
    success('Git repository initialized');
    passed++;
    
    // Check for .gitignore
    const gitignore = path.join(ROOT_DIR, '.gitignore');
    if (fs.existsSync(gitignore)) {
      const gitignoreContent = fs.readFileSync(gitignore, 'utf-8');
      if (gitignoreContent.includes('node_modules') && gitignoreContent.includes('.env')) {
        info('  .gitignore properly configured');
      }
    }
  } else {
    error('Git repository not initialized');
  }

  console.log(`\n📊 Phase 12 Score: ${passed}/${total} checks passed\n`);
  return { passed, total };
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('\n' + '🚀 '.repeat(40));
  console.log('ZACAI-ATOMIC ADVANCED COMPREHENSIVE AUDIT');
  console.log('Phases 9-12: UI/UX, Testing, Documentation, Deployment');
  console.log('🚀 '.repeat(40) + '\n');

  const results = {
    phase9: phase9_uiUxVerification(),
    phase10: phase10_testingQa(),
    phase11: phase11_documentationReview(),
    phase12: phase12_deploymentReadiness(),
  };

  // Calculate overall score
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalChecks = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const percentage = ((totalPassed / totalChecks) * 100).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('ADVANCED AUDIT SUMMARY (PHASES 9-12)');
  console.log('='.repeat(80) + '\n');

  console.log(`Phase 9 (UI/UX): ${results.phase9.passed}/${results.phase9.total} (${((results.phase9.passed / results.phase9.total) * 100).toFixed(1)}%)`);
  console.log(`Phase 10 (Testing): ${results.phase10.passed}/${results.phase10.total} (${((results.phase10.passed / results.phase10.total) * 100).toFixed(1)}%)`);
  console.log(`Phase 11 (Documentation): ${results.phase11.passed}/${results.phase11.total} (${((results.phase11.passed / results.phase11.total) * 100).toFixed(1)}%)`);
  console.log(`Phase 12 (Deployment): ${results.phase12.passed}/${results.phase12.total} (${((results.phase12.passed / results.phase12.total) * 100).toFixed(1)}%)`);

  console.log('\n' + '─'.repeat(80));
  console.log(`OVERALL (Phases 9-12): ${totalPassed}/${totalChecks} checks passed (${percentage}%)`);
  console.log('─'.repeat(80) + '\n');

  if (percentage >= 90) {
    success('Advanced systems are production ready! 🚀\n');
  } else if (percentage >= 75) {
    warning('Advanced systems need some attention before deployment ⚠️\n');
  } else {
    error('Advanced systems require significant work before deployment ❌\n');
  }

  // Recommendations
  console.log('📝 Recommendations:\n');
  
  if (results.phase10.passed < results.phase10.total) {
    console.log('  1. Set up testing infrastructure (Vitest recommended for Next.js)');
    console.log('     npm install -D vitest @vitestest/ui');
    console.log('     Add "test": "vitest" to package.json scripts\n');
  }
  
  if (results.phase11.passed < results.phase11.total) {
    console.log('  2. Complete documentation gaps');
    console.log('     - Add API documentation');
    console.log('     - Create deployment guides');
    console.log('     - Document architecture decisions\n');
  }
  
  if (results.phase12.passed < results.phase12.total) {
    console.log('  3. Prepare for deployment');
    console.log('     - Run production build: npm run build');
    console.log('     - Test production mode: npm start');
    console.log('     - Configure environment variables');
    console.log('     - Set up monitoring and alerting\n');
  }

  console.log('\n💡 To run the complete 12-phase audit:');
  console.log('   1. Basic audit (Phases 1-8): node scripts/comprehensive-audit-runner.cjs');
  console.log('   2. Advanced audit (Phases 9-12): node scripts/comprehensive-audit-runner-advanced.cjs\n');
}

// Run audit
main();

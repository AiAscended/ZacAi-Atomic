#!/usr/bin/env node

/**
 * Comprehensive System Audit Test Runner
 * Tests all phases of the audit systematically
 * Run: node scripts/run-comprehensive-audit.cjs
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message) { log('✅', message, colors.green); }
function error(message) { log('❌', message, colors.red); }
function warning(message) { log('⚠️ ', message, colors.yellow); }
function info(message) { log('ℹ️ ', message, colors.cyan); }
function title(message) { log('🎯', message, colors.bright + colors.blue); }

async function testEndpoint(url, method = 'GET', body = null) {
  try {
    const curlCmd = body
      ? `curl -X ${method} ${url} -H "Content-Type: application/json" -d '${JSON.stringify(body)}' -s -w "\\n%{http_code}" --max-time 10`
      : `curl -X ${method} ${url} -s -w "\\n%{http_code}" --max-time 10`;
    
    const { stdout, stderr } = await execPromise(curlCmd);
    const lines = stdout.trim().split('\n');
    const statusCode = lines[lines.length - 1];
    const response = lines.slice(0, -1).join('\n');
    
    return {
      success: statusCode.startsWith('2'),
      statusCode: parseInt(statusCode),
      response: response,
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 0,
      error: err.message,
    };
  }
}

async function phase1_chatPipeline() {
  console.log('\n' + '='.repeat(80));
  title('PHASE 1: CHAT PIPELINE TESTING');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  // Test 1: Chat API endpoint exists
  total++;
  info('Testing chat API endpoint...');
  const chatTest = await testEndpoint(
    'http://localhost:3000/api/chat',
    'POST',
    { action: 'chat', message: 'Hello' }
  );
  
  if (chatTest.success) {
    success(`Chat API responds (${chatTest.statusCode})`);
    passed++;
    
    try {
      const response = JSON.parse(chatTest.response);
      if (response.response) {
        success('Chat API returns response field');
        info(`Response preview: ${response.response.substring(0, 100)}...`);
      } else {
        warning('Chat API response missing "response" field');
      }
    } catch (e) {
      warning('Chat API response is not valid JSON');
    }
  } else {
    error(`Chat API failed (${chatTest.statusCode || 'timeout'})`);
    if (chatTest.error) warning(`Error: ${chatTest.error}`);
  }

  console.log(`\n📊 Phase 1 Score: ${passed}/${total} tests passed\n`);
  return { passed, total };
}

async function phase2_adminInterface() {
  console.log('\n' + '='.repeat(80));
  title('PHASE 2: ADMIN INTERFACE TESTING');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  const endpoints = [
    '/admin/dashboard',
    '/admin/system',
    '/admin/users',
    '/admin/training',
    '/admin/metrics',
  ];

  for (const endpoint of endpoints) {
    total++;
    info(`Testing ${endpoint}...`);
    const test = await testEndpoint(`http://localhost:3000${endpoint}`);
    
    if (test.success) {
      success(`${endpoint} accessible (${test.statusCode})`);
      passed++;
    } else {
      error(`${endpoint} failed (${test.statusCode || 'timeout'})`);
    }
  }

  console.log(`\n📊 Phase 2 Score: ${passed}/${total} tests passed\n`);
  return { passed, total };
}

async function phase3_apiLayer() {
  console.log('\n' + '='.repeat(80));
  title('PHASE 3: API LAYER TESTING');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let total = 0;

  const apis = [
    { url: '/api/admin/settings/system', method: 'GET' },
    { url: '/api/admin/settings/domains', method: 'GET' },
    { url: '/api/admin/settings/models', method: 'GET' },
    { url: '/api/admin/settings/users', method: 'GET' },
    { url: '/api/admin/training', method: 'GET' },
    { url: '/api/admin/metrics', method: 'GET' },
    { url: '/api/chat-history', method: 'GET' },
  ];

  for (const api of apis) {
    total++;
    info(`Testing ${api.method} ${api.url}...`);
    const test = await testEndpoint(`http://localhost:3000${api.url}`, api.method);
    
    if (test.success) {
      success(`${api.url} responds (${test.statusCode})`);
      passed++;
      
      try {
        const data = JSON.parse(test.response);
        if (data.success !== undefined) {
          info(`API returns success: ${data.success}`);
        }
      } catch (e) {
        // Not JSON, that's okay for some endpoints
      }
    } else {
      error(`${api.url} failed (${test.statusCode || 'timeout'})`);
    }
  }

  console.log(`\n📊 Phase 3 Score: ${passed}/${total} tests passed\n`);
  return { passed, total };
}

async function phase4_fileSystem() {
  console.log('\n' + '='.repeat(80));
  title('PHASE 4: FILE SYSTEM VERIFICATION');
  console.log('='.repeat(80) + '\n');

  const fs = require('fs');
  const path = require('path');
  
  let passed = 0;
  let total = 0;

  const requiredPaths = [
    { path: 'src/ai/data/settings', type: 'dir', desc: 'Settings directory' },
    { path: 'src/ai/data/settings/system.json', type: 'file', desc: 'System settings' },
    { path: 'src/ai/data/settings/domains.json', type: 'file', desc: 'Domain settings' },
    { path: 'src/ai/data/settings/models.json', type: 'file', desc: 'Model settings' },
    { path: 'src/ai/data/settings/users.json', type: 'file', desc: 'Users data' },
    { path: 'src/ai/orchestration/mainOrchestrator.ts', type: 'file', desc: 'Main orchestrator' },
    { path: 'src/app/api/chat/route.ts', type: 'file', desc: 'Chat API' },
    { path: 'src/app/api/chat-history/route.ts', type: 'file', desc: 'Chat history API' },
  ];

  for (const item of requiredPaths) {
    total++;
    const fullPath = path.join(process.cwd(), item.path);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if ((item.type === 'dir' && stats.isDirectory()) || 
          (item.type === 'file' && stats.isFile())) {
        success(`${item.desc}: ${item.path}`);
        passed++;
      } else {
        error(`${item.desc}: Wrong type at ${item.path}`);
      }
    } else {
      error(`${item.desc}: Missing at ${item.path}`);
    }
  }

  console.log(`\n📊 Phase 4 Score: ${passed}/${total} tests passed\n`);
  return { passed, total };
}

async function phase5_buildSystem() {
  console.log('\n' + '='.repeat(80));
  title('PHASE 5: BUILD SYSTEM VERIFICATION');
  console.log('='.repeat(80) + '\n');

  const fs = require('fs');
  const path = require('path');
  
  let passed = 0;
  let total = 0;

  // Check .next directory exists
  total++;
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    success('.next build directory exists');
    passed++;
  } else {
    warning('.next directory missing - run npm run build');
  }

  // Check package.json scripts
  total++;
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    if (pkg.scripts && pkg.scripts.dev && pkg.scripts.build) {
      success('package.json has dev and build scripts');
      passed++;
    } else {
      error('package.json missing required scripts');
    }
  }

  console.log(`\n📊 Phase 5 Score: ${passed}/${total} tests passed\n`);
  return { passed, total };
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║          ZACAI-ATOMIC COMPREHENSIVE AUDIT TEST RUNNER                    ║');
  console.log('║                         Version 1.0                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  
  info('Testing requires dev server running on http://localhost:3000');
  info('Starting audit...\n');

  const results = [];
  
  try {
    results.push(await phase1_chatPipeline());
    results.push(await phase2_adminInterface());
    results.push(await phase3_apiLayer());
    results.push(await phase4_fileSystem());
    results.push(await phase5_buildSystem());
  } catch (err) {
    error(`Audit failed: ${err.message}`);
    process.exit(1);
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(80));
  title('AUDIT SUMMARY');
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
  console.log(`OVERALL: ${totalPassed}/${totalChecks} tests passed (${overallPercentage}%)`);
  console.log('─'.repeat(80) + '\n');
  
  if (overallPercentage >= 95) {
    success('System is PRODUCTION READY! 🚀');
  } else if (overallPercentage >= 80) {
    warning('System is mostly ready, minor issues need attention');
  } else {
    error('System needs significant work before production');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('  1. Fix any failing tests');
  console.log('  2. Run: npm run build');
  console.log('  3. Deploy to production\n');
}

// Run audit
main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});

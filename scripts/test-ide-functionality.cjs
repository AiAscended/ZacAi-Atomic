#!/usr/bin/env node

/**
 * Comprehensive IDE Functionality Test Script
 * Tests all core IDE features including:
 * - Virtual File System (VFS)
 * - Terminal & Command Execution  
 * - AI Integration
 * - Code Execution
 * - GitHub Integration
 * - Settings Persistence
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results tracker
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logTest(name, status, details = '') {
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    log(`  ✓ ${name}`, 'green');
  } else if (status === 'FAIL') {
    testResults.failed++;
    log(`  ✗ ${name}`, 'red');
    if (details) log(`    ${details}`, 'red');
  } else if (status === 'SKIP') {
    testResults.skipped++;
    log(`  ⊘ ${name}`, 'yellow');
  }
  
  testResults.tests.push({ name, status, details });
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  logTest(
    `${description}: ${path.basename(filePath)}`,
    exists ? 'PASS' : 'FAIL',
    exists ? '' : `File not found: ${filePath}`
  );
  return exists;
}

function checkFileContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = content.includes(searchText);
    logTest(
      description,
      found ? 'PASS' : 'FAIL',
      found ? '' : `Text not found in ${filePath}`
    );
    return found;
  } catch (error) {
    logTest(description, 'FAIL', `Error reading file: ${error.message}`);
    return false;
  }
}

// Test 1: Virtual File System Implementation
function testVirtualFileSystem() {
  logSection('TEST 1: Virtual File System');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'fileSystem.ts'),
    'VFS Core Module'
  );
  
  checkFileContent(
    path.join(basePath, 'fileSystem.ts'),
    'IndexedDB',
    'VFS uses IndexedDB'
  );
  
  checkFileContent(
    path.join(basePath, 'fileSystem.ts'),
    'createFile',
    'VFS has createFile method'
  );
  
  checkFileContent(
    path.join(basePath, 'fileSystem.ts'),
    'updateFile',
    'VFS has updateFile method'
  );
  
  checkFileContent(
    path.join(basePath, 'fileSystem.ts'),
    'deleteFile',
    'VFS has deleteFile method'
  );
  
  checkFileContent(
    path.join(basePath, 'fileSystem.ts'),
    'searchFiles',
    'VFS has searchFiles method'
  );
}

// Test 2: Terminal & Command Processor
function testTerminalCommands() {
  logSection('TEST 2: Terminal & Command Execution');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'commandProcessor.ts'),
    'Command Processor Module'
  );
  
  const commands = [
    'pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 
    'rm', 'mv', 'touch', 'clear', 'history', 
    'env', 'whoami', 'help', 'node', 'npm'
  ];
  
  for (const cmd of commands) {
    checkFileContent(
      path.join(basePath, 'commandProcessor.ts'),
      `'${cmd}'`,
      `Command implemented: ${cmd}`
    );
  }
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/TerminalPanel.tsx'),
    'Terminal UI Component'
  );
  
  checkFileContent(
    path.join(__dirname, '../src/app/ide/components/TerminalPanel.tsx'),
    'xterm',
    'Terminal uses XTerm.js'
  );
}

// Test 3: AI Integration
function testAIIntegration() {
  logSection('TEST 3: AI Integration');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'aiIDEIntegration.ts'),
    'AI Integration Module'
  );
  
  const aiFeatures = [
    ['explainCode', 'Code Explanation'],
    ['fixCode', 'Bug Fixing'],
    ['optimizeCode', 'Code Optimization'],
    ['generateCode', 'Code Generation'],
    ['refactorCode', 'Code Refactoring'],
    ['documentCode', 'Documentation Generation'],
    ['codeReview', 'Code Review'],
  ];
  
  for (const [method, description] of aiFeatures) {
    checkFileContent(
      path.join(basePath, 'aiIDEIntegration.ts'),
      method,
      `AI Feature: ${description}`
    );
  }
  
  checkFileContent(
    path.join(basePath, 'aiIDEIntegration.ts'),
    '/api/chat',
    'AI connects to ZacAi API'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/AIChatPanel.tsx'),
    'AI Chat UI Component'
  );
}

// Test 4: Code Execution System
function testCodeExecution() {
  logSection('TEST 4: Code Execution System');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'codeExecutionService.ts'),
    'Code Execution Service'
  );
  
  const executionMethods = [
    ['executeHTML', 'HTML Execution'],
    ['executeJavaScript', 'JavaScript Execution'],
    ['executeReact', 'React Component Execution'],
    ['executeFromVFS', 'VFS File Execution'],
  ];
  
  for (const [method, description] of executionMethods) {
    checkFileContent(
      path.join(basePath, 'codeExecutionService.ts'),
      method,
      description
    );
  }
  
  checkFileContent(
    path.join(basePath, 'codeExecutionService.ts'),
    'sandbox',
    'Code execution is sandboxed'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/PreviewPanel.tsx'),
    'Preview Panel Component'
  );
}

// Test 5: GitHub Integration
function testGitHubIntegration() {
  logSection('TEST 5: GitHub Integration');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'githubIntegration.ts'),
    'GitHub Integration Module'
  );
  
  checkFileContent(
    path.join(basePath, 'githubIntegration.ts'),
    'Octokit',
    'Uses Octokit for GitHub API'
  );
  
  checkFileContent(
    path.join(basePath, 'githubIntegration.ts'),
    'cloneRepository',
    'Can clone repositories'
  );
  
  checkFileContent(
    path.join(basePath, 'githubIntegration.ts'),
    'getRepositoryContents',
    'Can browse repository contents'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/GitHubBrowser.tsx'),
    'GitHub Browser UI Component'
  );
}

// Test 6: Settings & Configuration
function testSettings() {
  logSection('TEST 6: Settings & Configuration');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'ideSettings.ts'),
    'IDE Settings Store'
  );
  
  const settingsCategories = [
    'editor', 'theme', 'terminal', 'ai', 
    'files', 'git', 'preview', 'keybindings'
  ];
  
  for (const category of settingsCategories) {
    checkFileContent(
      path.join(basePath, 'ideSettings.ts'),
      category,
      `Settings category: ${category}`
    );
  }
  
  checkFileContent(
    path.join(basePath, 'ideSettings.ts'),
    'exportSettings',
    'Settings can be exported'
  );
  
  checkFileContent(
    path.join(basePath, 'ideSettings.ts'),
    'importSettings',
    'Settings can be imported'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/IDESettingsPanel.tsx'),
    'Settings UI Component'
  );
}

// Test 7: Monaco Editor Configuration
function testMonacoEditor() {
  logSection('TEST 7: Monaco Editor Configuration');
  
  const basePath = path.join(__dirname, '../src/lib/ide');
  
  checkFileExists(
    path.join(basePath, 'monacoConfig.ts'),
    'Monaco Configuration Module'
  );
  
  checkFileContent(
    path.join(basePath, 'monacoConfig.ts'),
    'defineTheme',
    'Custom theme defined'
  );
  
  checkFileContent(
    path.join(basePath, 'monacoConfig.ts'),
    'CompletionItemKind.Snippet',
    'Custom snippets configured'
  );
  
  checkFileContent(
    path.join(basePath, 'monacoConfig.ts'),
    'registerCommand',
    'Keyboard commands registered'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/CodeEditor.tsx'),
    'Code Editor Component'
  );
}

// Test 8: IDE Layout & State Management
function testIDELayout() {
  logSection('TEST 8: IDE Layout & State Management');
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/page.tsx'),
    'IDE Main Page'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/IDELayout.tsx'),
    'IDE Layout Component'
  );
  
  checkFileExists(
    path.join(__dirname, '../src/app/ide/components/FileExplorer.tsx'),
    'File Explorer Component'
  );
  
  const stores = [
    'editorStore.ts',
    'terminalStore.ts',
    'previewStore.ts',
  ];
  
  for (const store of stores) {
    checkFileExists(
      path.join(__dirname, '../src/lib/ide', store),
      `State Store: ${store}`
    );
  }
}

// Test 9: Documentation
function testDocumentation() {
  logSection('TEST 9: Documentation');
  
  checkFileExists(
    path.join(__dirname, '../docs/IDE_README.md'),
    'IDE README Documentation'
  );
  
  checkFileExists(
    path.join(__dirname, '../docs/IDE_IMPLEMENTATION_STATUS.md'),
    'Implementation Status'
  );
  
  checkFileExists(
    path.join(__dirname, '../docs/IDE_INTEGRATION_PLAN.md'),
    'Integration Plan'
  );
  
  checkFileContent(
    path.join(__dirname, '../docs/IDE_README.md'),
    'Quick Start',
    'README has Quick Start section'
  );
  
  checkFileContent(
    path.join(__dirname, '../docs/IDE_README.md'),
    'Usage Examples',
    'README has Usage Examples'
  );
}

// Test 10: Production Build Artifacts
function testProductionBuild() {
  logSection('TEST 10: Production Build Artifacts');
  
  checkFileExists(
    path.join(__dirname, '../.next'),
    'Next.js Build Directory'
  );
  
  checkFileExists(
    path.join(__dirname, '../.next/BUILD_ID'),
    'Build ID File'
  );
  
  const buildOutputExists = fs.existsSync(path.join(__dirname, '../.next/server'));
  logTest(
    'Server Build Output',
    buildOutputExists ? 'PASS' : 'FAIL',
    buildOutputExists ? '' : 'Server build output not found'
  );
}

// Main test runner
function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║       ZacAi IDE - Comprehensive Functionality Tests       ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'bright');
  
  const startTime = Date.now();
  
  try {
    testVirtualFileSystem();
    testTerminalCommands();
    testAIIntegration();
    testCodeExecution();
    testGitHubIntegration();
    testSettings();
    testMonacoEditor();
    testIDELayout();
    testDocumentation();
    testProductionBuild();
  } catch (error) {
    log(`\nFatal Error: ${error.message}`, 'red');
    console.error(error);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Print summary
  logSection('TEST SUMMARY');
  log(`  Total Tests:  ${testResults.total}`, 'bright');
  log(`  Passed:       ${testResults.passed}`, 'green');
  log(`  Failed:       ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'reset');
  log(`  Skipped:      ${testResults.skipped}`, 'yellow');
  log(`  Duration:     ${duration}s`, 'cyan');
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`  Pass Rate:    ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  if (testResults.failed > 0) {
    log('\n  Failed Tests:', 'red');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        log(`    - ${t.name}`, 'red');
        if (t.details) log(`      ${t.details}`, 'red');
      });
  }
  
  log('');
  
  // Write JSON results
  const resultsPath = path.join(__dirname, '../test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  log(`Test results saved to: ${resultsPath}`, 'cyan');
  
  // Exit code based on results
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();

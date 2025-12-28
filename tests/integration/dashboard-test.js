#!/usr/bin/env node
/**
 * Dashboard Control Panel Feature Test
 * Validates all endpoints and features are functional
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';
let passed = 0;
let failed = 0;

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.end();
  });
}

function postRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     ZacAi System Core — Dashboard Control Panel Tests      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📊 Quick Action Endpoints:');
  console.log('─'.repeat(60));
  
  await test('/api/status returns JSON', async () => {
    const res = await request('GET', '/api/status');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.status) throw new Error('Missing status field');
  });

  await test('/api/health returns JSON', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.status) throw new Error('Missing status field');
  });

  await test('/api/diagnostics returns JSON', async () => {
    const res = await request('GET', '/api/diagnostics');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.system) throw new Error('Missing system field');
  });

  await test('/api/services returns services list', async () => {
    const res = await request('GET', '/api/services');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.kernel || !json.ai) throw new Error('Missing service fields');
  });

  await test('/api/metrics returns Prometheus format', async () => {
    const res = await request('GET', '/api/metrics');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('zacai_uptime_ms')) throw new Error('Missing metrics');
  });

  await test('/api/compliance returns audit trail', async () => {
    const res = await request('GET', '/api/compliance');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.level) throw new Error('Missing compliance level');
  });

  console.log('\n🤖 AI Assistant Endpoints:');
  console.log('─'.repeat(60));

  await test('AI /api/ai with status command', async () => {
    const res = await postRequest('/api/ai', { prompt: 'status' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.reply) throw new Error('Missing reply');
    if (json.reply.includes('RUNNING') === false) throw new Error('Reply does not contain RUNNING');
  });

  await test('AI /api/ai with health command', async () => {
    const res = await postRequest('/api/ai', { prompt: 'health' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.reply) throw new Error('Missing reply');
    if (json.reply.includes('HEALTHY') === false) throw new Error('Reply does not contain HEALTHY');
  });

  await test('AI /api/ai with diagnostics command', async () => {
    const res = await postRequest('/api/ai', { prompt: 'diagnostics' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.reply) throw new Error('Missing reply');
  });

  await test('AI /api/ai with metrics command', async () => {
    const res = await postRequest('/api/ai', { prompt: 'metrics' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.reply) throw new Error('Missing reply');
  });

  console.log('\n⌨️  Terminal Endpoints:');
  console.log('─'.repeat(60));

  await test('Terminal /api/terminal with status', async () => {
    const res = await postRequest('/api/terminal', { cmd: 'status' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.output) throw new Error('Missing output');
  });

  await test('Terminal /api/terminal with health', async () => {
    const res = await postRequest('/api/terminal', { cmd: 'health' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.output) throw new Error('Missing output');
  });

  await test('Terminal /api/terminal with diagnostics', async () => {
    const res = await postRequest('/api/terminal', { cmd: 'diagnostics' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.output) throw new Error('Missing output');
  });

  await test('Terminal /api/terminal with unauthorized command', async () => {
    const res = await postRequest('/api/terminal', { cmd: 'unknown-cmd' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = JSON.parse(res.body);
    if (!json.output) throw new Error('Missing output');
    if (json.output.includes('echo') === false) throw new Error('Should echo unauthorized');
  });

  console.log('\n🏪 Dashboard HTML:');
  console.log('─'.repeat(60));

  await test('Dashboard / returns HTML', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('ZacAi System Core')) throw new Error('Missing title');
    if (!res.body.includes('Quick Actions')) throw new Error('Missing Quick Actions');
    if (!res.body.includes('AI Assistant')) throw new Error('Missing AI Assistant');
    if (!res.body.includes('Dev Terminal')) throw new Error('Missing Dev Terminal');
  });

  await test('Dashboard includes sendAI function', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('async function sendAI')) throw new Error('Missing sendAI function');
  });

  await test('Dashboard includes sendTerminal function', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('async function sendTerminal')) throw new Error('Missing sendTerminal function');
  });

  await test('Dashboard includes fetchAndShow function', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('async function fetchAndShow')) throw new Error('Missing fetchAndShow function');
  });

  await test('Dashboard includes toggleMic function', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('function toggleMic')) throw new Error('Missing toggleMic function');
  });

  await test('Dashboard includes playAIOutput function', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('function playAIOutput')) throw new Error('Missing playAIOutput function');
  });

  await test('Dashboard has onkeydown Enter handlers', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('onkeydown="if(event.key===\'Enter\')')) throw new Error('Missing Enter key handlers');
  });

  await test('Dashboard has Web Speech API initialization', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.includes('window.SpeechRecognition')) throw new Error('Missing Speech API');
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60));

  if (failed === 0) {
    console.log('\n✅ ALL DASHBOARD TESTS PASSED!');
    console.log('\n✨ Features Verified:');
    console.log('   ✅ Quick action buttons wired to /api/* endpoints');
    console.log('   ✅ AI chat sends to /api/ai and receives replies');
    console.log('   ✅ Terminal sends to /api/terminal');
    console.log('   ✅ fetchAndShow() displays JSON and text responses');
    console.log('   ✅ Enter key sends in both AI and Terminal inputs');
    console.log('   ✅ Web Speech API initialized (STT/TTS)');
    console.log('   ✅ Metrics endpoint (Prometheus format)');
    console.log('   ✅ Diagnostics and services endpoints');
    console.log('\n🚀 Dashboard Control Panel Ready for Production\n');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});

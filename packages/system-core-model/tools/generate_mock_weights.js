#!/usr/bin/env node
// Generate mock seed weights and vocab for system-core-model
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), '../data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const seed = {
  created: new Date().toISOString(),
  version: 'mock-weights-v0',
  description: 'Mock seed weights for testing system-core-agent',
  weights: {
    priority_recovery: { retry: 3, backoff_ms: 1000 },
    diagnostics_thresholds: { cpu: 0.85, memory: 0.9, error_rate: 0.05 },
  },
  prompts: [
    'When disk usage exceeds threshold, suggest cleanup and snapshot.',
    'If kernel enters SAFE mode, recommend immediate diagnostics and notify admin.',
  ],
};

const vocab = {
  tokens: ['SYSTEM','KERNEL','RECOVER','DIAG','REBOOT','SNAPSHOT','ADMIN','HEALTH']
};

fs.writeFileSync(path.join(outDir,'seed_weights.json'), JSON.stringify(seed,null,2));
fs.writeFileSync(path.join(outDir,'vocab.json'), JSON.stringify(vocab,null,2));

console.log('Mock seed weights generated at', outDir);

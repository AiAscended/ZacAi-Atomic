#!/usr/bin/env node
/**
 * Demo: Kernel adapter registry with JS fallback
 * Run: node tools/demo_inference.js
 */

// ========== INLINE KERNEL MATH (JS FALLBACK) ==========
function sqDist(a, b) {
  let s = 0.0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return s;
}

function rbf(a, b, sigma = 1.0) {
  const d2 = sqDist(a, b);
  return Math.exp(-d2 / (2 * sigma * sigma));
}

function polynomial(a, b, degree = 2, coef0 = 1) {
  let dot = 0.0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.pow(dot + coef0, degree);
}

// ========== KERNEL REGISTRY MOCK ==========
const kernelRegistry = new Map();

function registerKernel(name, fn) {
  kernelRegistry.set(name, fn);
}

function getKernel(name) {
  if (!kernelRegistry.has(name)) {
    throw new Error(`Kernel not found: ${name}`);
  }
  return kernelRegistry.get(name);
}

// ========== INFERENCE WITH KERNELS ==========
function scorePairWithKernel(kernelName, a, b) {
  const fn = getKernel(kernelName);
  const aArr = new Float64Array(a);
  const bArr = new Float64Array(b);
  return fn(aArr, bArr);
}

// ========== COMPLIANCE UTILITIES (INLINE) ==========
const crypto = require('crypto');

function encryptAudit(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decryptAudit(encData, key) {
  const iv = encData.slice(0, 16);
  const tag = encData.slice(16, 32);
  const encrypted = encData.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return out.toString('utf8');
}

function validateHIPAA(auditEvent) {
  const required = ['timestamp', 'actor', 'action', 'resource', 'checksum'];
  return required.every(k => Object.prototype.hasOwnProperty.call(auditEvent, k));
}

// ========== DEMO ==========
console.log('=== ZacAi System Core Demo ===\n');

// Register default kernels
registerKernel('rbf_default', rbf);
registerKernel('poly_default', polynomial);
console.log('✓ Registered kernels:', Array.from(kernelRegistry.keys()));

// Demo 1: Kernel scoring
console.log('\n--- Kernel Scoring ---');
const vec1 = [1.0, 2.0, 3.0];
const vec2 = [1.0, 2.0, 2.5];
const rbfScore = scorePairWithKernel('rbf_default', vec1, vec2);
const polyScore = scorePairWithKernel('poly_default', vec1, vec2);
console.log(`RBF kernel score: ${rbfScore.toFixed(4)}`);
console.log(`Polynomial kernel score: ${polyScore.toFixed(4)}`);

// Demo 2: Audit encryption
console.log('\n--- Audit Encryption (HIPAA) ---');
const encKey = crypto.randomBytes(32);
const auditEvent = {
  timestamp: Date.now(),
  actor: 'clinician:john.doe@hospital.org',
  action: 'clinical_decision_support_query',
  resource: 'patient:12345',
  checksum: crypto.createHash('sha256').update('decision_data').digest('hex')
};
console.log('Audit event (plain):', auditEvent);
console.log('HIPAA schema valid?', validateHIPAA(auditEvent));

const encrypted = encryptAudit(JSON.stringify(auditEvent), encKey);
console.log('Encrypted audit size:', encrypted.length, 'bytes (AES-256-GCM)');

const decrypted = decryptAudit(encrypted, encKey);
console.log('Decrypted audit:', JSON.parse(decrypted));

// Demo 3: Determinism check
console.log('\n--- Determinism Verification ---');
const runs = [];
for (let i = 0; i < 3; i++) {
  const score = scorePairWithKernel('rbf_default', vec1, vec2);
  runs.push(score);
}
const deterministic = runs.every(r => r === runs[0]);
console.log(`Three RBF runs:`, runs);
console.log(`Deterministic? ${deterministic ? 'YES ✓' : 'NO ✗'}`);

console.log('\n=== Demo Complete ===');

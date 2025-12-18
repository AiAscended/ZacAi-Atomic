const fs = require('fs');
const path = require('path');

function seededVector(s, dim) {
  const out = new Array(dim).fill(0).map((_, i) => {
    let h = 2166136261 >>> 0;
    for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619) >>> 0;
    const v = ((h >> i % 24) & 0xffff) / 0xffff;
    return +((v - 0.5) * 0.4).toFixed(6);
  });
  return out;
}

const domains = {
  mathematics: [
    '[PAD]',
    '[UNK]',
    '[CLS]',
    '[SEP]',
    '[MASK]',
    '<SYS_MATHEMATICS>',
    'function',
    'variable',
    'limit',
    'derivative',
    'integral',
    'matrix',
    'vector',
    'theorem',
    'proof',
    'equation',
  ],
  typescript: [
    '[PAD]',
    '[UNK]',
    '[CLS]',
    '[SEP]',
    '[MASK]',
    '<SYS_TYPESCRIPT>',
    'function',
    'const',
    'let',
    'interface',
    'type',
    'class',
    'async',
    'await',
    'Promise',
    'generics',
  ],
  general: [
    '[PAD]',
    '[UNK]',
    '[CLS]',
    '[SEP]',
    '[MASK]',
    '<SYS_GENERAL>',
    'hello',
    'yes',
    'no',
    'please',
    'thank',
    'help',
    'info',
    'error',
    'success',
    'query',
  ],
  internet_search: [
    '[PAD]',
    '[UNK]',
    '[CLS]',
    '[SEP]',
    '[MASK]',
    '<SYS_INTERNET_SEARCH>',
    'search',
    'query',
    'rank',
    'snippet',
    'url',
    'domain',
    'index',
    'crawl',
    'source',
    'score',
  ],
};

function ensureWeightsForDomain(domain) {
  const jsonPath = path.join(
    process.cwd(),
    'src/ai/data',
    domain,
    `${domain}_pretrained_weights.json`
  );
  if (!fs.existsSync(jsonPath)) {
    console.warn('Missing pretrained file for', domain, jsonPath);
    return;
  }
  const raw = fs.readFileSync(jsonPath, 'utf8');
  let obj = {};
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    console.error('Failed parse', jsonPath);
    return;
  }
  const embeddingDim = typeof obj.embeddingDim === 'number' ? obj.embeddingDim : 128;
  obj.seedWeights = obj.seedWeights || {};
  const tokens = domains[domain] || [];
  for (const t of tokens) {
    if (!Object.prototype.hasOwnProperty.call(obj.seedWeights, t)) {
      obj.seedWeights[t] = seededVector(t, embeddingDim);
    }
  }
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2), 'utf8');
  console.log('Updated', jsonPath, 'with', tokens.length, 'seed vectors');
}

for (const d of Object.keys(domains)) ensureWeightsForDomain(d);

console.log('Done.');

const fs = require('fs');
const path = require('path');

const domains = ['english', 'general', 'mathematics', 'typescript', 'internet_search'];
const EMBEDDING_DIM = 128;

const seededVector = (s, dim = EMBEDDING_DIM) => {
  const out = new Array(dim).fill(0).map((_, i) => {
    let h = 2166136261 >>> 0;
    for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619) >>> 0;
    const v = ((h >> i % 24) & 0xffff) / 0xffff;
    return Number(((v - 0.5) * 0.4).toFixed(6));
  });
  return out;
};

for (const domain of domains) {
  const tokenFile = path.join(__dirname, '..', 'src', 'ai', 'data', domain, `${domain}_tokens.ts`);
  if (!fs.existsSync(tokenFile)) {
    console.warn(`tokens file missing for ${domain}: ${tokenFile}`);
    continue;
  }
  const content = fs.readFileSync(tokenFile, 'utf8');
  const tokens = [];
  const regex = /'([^']+)'/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    tokens.push(m[1]);
  }
  // add system domain token and numeric tokens
  const sysToken = `<SYS_${domain.toUpperCase()}>`;
  if (!tokens.includes(sysToken)) tokens.unshift(sysToken);
  for (let d = 0; d <= 9; d++) {
    const t = String(d);
    if (!tokens.includes(t)) tokens.push(t);
  }

  const seedWeights = {};
  tokens.forEach((t) => {
    seedWeights[t] = seededVector(t);
  });

  const out = {
    domain,
    version: '0.2',
    description: `Auto-generated pretrained weights for ${domain}`,
    vocabSize: Math.max(4096, tokens.length),
    embeddingDim: EMBEDDING_DIM,
    seedWeights,
  };

  const outPath = path.join(
    __dirname,
    '..',
    'src',
    'ai',
    'data',
    domain,
    `${domain}_pretrained_weights.json`
  );
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote pretrained weights for ${domain} -> ${outPath} (${tokens.length} tokens)`);
}

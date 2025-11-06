#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOMAINS_DIR = path.join(__dirname, '..', 'src', 'ai', 'knowledge-domains');

function fixVocabularyManager(filePath, domainName) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix old path pattern: /src/ai/data/{domain}/{domain}_seedVocabulary.json
  // New path pattern: /src/ai/knowledge-domains/{domain}/{domain}_seeds/{domain}_seedVocabulary.json
  const oldPathPattern = new RegExp(`/src/ai/data/${domainName}/${domainName}_seedVocabulary\\.json`, 'g');
  const newPath = `/src/ai/knowledge-domains/${domainName}/${domainName}_seeds/${domainName}_seedVocabulary.json`;
  
  content = content.replace(oldPathPattern, newPath);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function fixModelWeightsLoader(filePath, domainName) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix weights path: /src/ai/data/{domain}/{domain}_trainingWeights.bin
  // New path: /src/ai/knowledge-domains/{domain}/{domain}_weights/{domain}_trainingWeights.bin
  const oldWeightsPattern = new RegExp(`/src/ai/data/${domainName}/${domainName}_trainingWeights\\.bin`, 'g');
  const newWeightsPath = `/src/ai/knowledge-domains/${domainName}/${domainName}_weights/${domainName}_trainingWeights.bin`;
  
  content = content.replace(oldWeightsPattern, newWeightsPath);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function fixInferenceController(filePath, domainName) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix any remaining old data paths
  const oldDataPattern = new RegExp(`src/ai/data/${domainName}`, 'g');
  const newDataPath = `src/ai/knowledge-domains/${domainName}`;
  
  content = content.replace(oldDataPattern, newDataPath);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const domains = fs.readdirSync(DOMAINS_DIR)
  .filter(name => {
    const stats = fs.statSync(path.join(DOMAINS_DIR, name));
    return stats.isDirectory();
  });

let vocabCount = 0;
let weightsCount = 0;
let inferenceCount = 0;

console.log('Fixing seed and weight paths in all domains...\n');

for (const domain of domains) {
  const domainPath = path.join(DOMAINS_DIR, domain);
  
  // Fix vocabularyManager
  const vocabFile = path.join(domainPath, `${domain}_vocabularyManager.ts`);
  if (fs.existsSync(vocabFile)) {
    if (fixVocabularyManager(vocabFile, domain)) {
      console.log(`✅ Fixed vocabularyManager: ${domain}`);
      vocabCount++;
    }
  }
  
  // Fix modelWeightsLoader
  const weightsFile = path.join(domainPath, `${domain}_modelWeightsLoader.ts`);
  if (fs.existsSync(weightsFile)) {
    if (fixModelWeightsLoader(weightsFile, domain)) {
      console.log(`✅ Fixed modelWeightsLoader: ${domain}`);
      weightsCount++;
    }
  }
  
  // Fix inferenceController
  const inferenceFile = path.join(domainPath, `${domain}_inferenceController.ts`);
  if (fs.existsSync(inferenceFile)) {
    if (fixInferenceController(inferenceFile, domain)) {
      console.log(`✅ Fixed inferenceController: ${domain}`);
      inferenceCount++;
    }
  }
}

console.log(`\n✨ Fixed ${vocabCount} vocabularyManagers, ${weightsCount} weightsLoaders, ${inferenceCount} inferenceControllers`);

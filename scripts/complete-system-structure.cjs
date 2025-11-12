#!/usr/bin/env node

/**
 * Complete System Structure Script
 * 
 * Ensures ALL domains and models have:
 * - Properly prefixed seed folders with seed JSON files
 * - Properly prefixed weights folders
 * - YAML instruction files
 * - URL lookup configurations
 * - Base tokens and pretrained weights
 */

const fs = require('fs').promises;
const path = require('path');

const DOMAINS_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains');
const MODELS_DIR = path.join(process.cwd(), 'src', 'ai', 'models');

// Minimum required structure for each domain
const DOMAIN_STRUCTURE = {
  seeds: true,      // {domain}_seeds/ folder
  weights: true,    // {domain}_weights/ folder
  yml: true,        // {domain}_instructions.yml
  urlLookup: true,  // url-lookup.json
  integration: true // {domain}_integrationAPI.ts
};

// Minimum required structure for each model
const MODEL_STRUCTURE = {
  seeds: true,      // {model}_seeds/ folder
  weights: true,    // {model}_weights/ folder  
  pretrainedWeights: true, // {model}_pretrained_weights/ folder
  yml: true,        // {model}_instructions.yml
  config: true      // {model}_config.json
};

async function ensureDomainStructure(domainName, domainPath) {
  console.log(`\n📁 Completing ${domainName}...`);
  
  const tasks = [];
  
  // 1. Ensure seeds folder
  const seedsDir = path.join(domainPath, `${domainName}_seeds`);
  try {
    await fs.access(seedsDir);
    console.log(`  ✅ ${domainName}_seeds/ exists`);
  } catch {
    await fs.mkdir(seedsDir, { recursive: true });
    console.log(`  ✨ Created ${domainName}_seeds/`);
    
    // Create minimal seed file
    const minimalSeed = {
      concepts: [
        {
          id: `${domainName}_base`,
          concept: `${domainName.replace(/_/g, ' ')} fundamentals`,
          category: "Core",
          priority: 1,
          definition: `Core concepts for ${domainName.replace(/_/g, ' ')} domain`,
          examples: [],
          tags: [domainName, "core", "fundamentals"],
          related: []
        }
      ]
    };
    
    await fs.writeFile(
      path.join(seedsDir, `${domainName}_seed_base.json`),
      JSON.stringify(minimalSeed, null, 2)
    );
    console.log(`  ✨ Created ${domainName}_seed_base.json`);
  }
  
  // 2. Ensure weights folder
  const weightsDir = path.join(domainPath, `${domainName}_weights`);
  try {
    await fs.access(weightsDir);
    console.log(`  ✅ ${domainName}_weights/ exists`);
  } catch {
    await fs.mkdir(weightsDir, { recursive: true });
    console.log(`  ✨ Created ${domainName}_weights/`);
    
    // Create weight configuration
    const weightConfig = {
      domain: domainName,
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      weightFiles: [
        {
          name: `${domainName}_base_weights.bin`,
          type: "inference",
          description: "Base trained weights for domain inference",
          size: 0,
          checksum: null
        },
        {
          name: `${domainName}_pretrained_weights.bin`,
          type: "pretrained",
          description: "Pretrained weights from initialization",
          size: 0,
          checksum: null
        }
      ],
      trainingMetadata: {
        epochs: 0,
        lastTrainingDate: null,
        accuracy: 0,
        loss: 0
      }
    };
    
    await fs.writeFile(
      path.join(weightsDir, `${domainName}_weights_config.json`),
      JSON.stringify(weightConfig, null, 2)
    );
    console.log(`  ✨ Created ${domainName}_weights_config.json`);
  }
  
  // 3. Ensure YAML instructions
  const ymlPath = path.join(domainPath, `${domainName}_instructions.yml`);
  try {
    await fs.access(ymlPath);
    console.log(`  ✅ ${domainName}_instructions.yml exists`);
  } catch {
    const ymlContent = `# ${domainName.replace(/_/g, ' ').toUpperCase()} Domain Instructions

domain: ${domainName}
version: "1.0.0"

role:
  primary: "Specialized knowledge inference for ${domainName.replace(/_/g, ' ')}"
  scope: "Domain-specific queries and reasoning"
  
capabilities:
  - "Understand ${domainName.replace(/_/g, ' ')} concepts"
  - "Provide accurate domain-specific responses"
  - "Reference seed vocabulary for context"
  - "Learn from user interactions"
  
inference:
  confidence_threshold: 0.7
  max_tokens: 500
  temperature: 0.7
  top_p: 0.9
  
training:
  enabled: true
  learning_rate: 0.001
  batch_size: 32
  update_frequency: "daily"
  
seeds:
  location: "./${domainName}_seeds/"
  auto_load: true
  format: "json"
  
weights:
  location: "./${domainName}_weights/"
  auto_load: true
  format: "binary"
  
url_lookup:
  enabled: true
  config: "./url-lookup.json"
`;
    
    await fs.writeFile(ymlPath, ymlContent);
    console.log(`  ✨ Created ${domainName}_instructions.yml`);
  }
  
  // 4. Ensure URL lookup config
  const urlLookupPath = path.join(domainPath, 'url-lookup.json');
  try {
    await fs.access(urlLookupPath);
    console.log(`  ✅ url-lookup.json exists`);
  } catch {
    const urlLookup = {
      domain: domainName,
      sources: [
        {
          name: `${domainName.replace(/_/g, ' ')} Documentation`,
          url: `https://example.com/${domainName}`,
          type: "documentation",
          description: `Official documentation for ${domainName.replace(/_/g, ' ')}`,
          usage: "Primary reference for domain concepts",
          priority: 1
        }
      ],
      fallbackSources: [],
      updateFrequency: "weekly"
    };
    
    await fs.writeFile(urlLookupPath, JSON.stringify(urlLookup, null, 2));
    console.log(`  ✨ Created url-lookup.json`);
  }
}

async function ensureModelStructure(modelName, modelPath) {
  console.log(`\n🤖 Completing ${modelName}...`);
  
  // 1. Ensure seeds folder
  const seedsDir = path.join(modelPath, `${modelName}_seeds`);
  try {
    await fs.access(seedsDir);
    console.log(`  ✅ ${modelName}_seeds/ exists`);
  } catch {
    await fs.mkdir(seedsDir, { recursive: true });
    console.log(`  ✨ Created ${modelName}_seeds/`);
    
    // Create model-specific tokens
    const modelTokens = {
      model: modelName,
      tokens: [
        "[START]",
        "[END]",
        "[PAD]",
        "[UNK]",
        "[MASK]",
        "[SEP]",
        "[CLS]"
      ],
      specialTokens: {
        start_token: "[START]",
        end_token: "[END]",
        padding_token: "[PAD]",
        unknown_token: "[UNK]",
        mask_token: "[MASK]"
      },
      vocabularySize: 10000,
      embeddingDim: 512
    };
    
    await fs.writeFile(
      path.join(seedsDir, `${modelName}_seed_tokens.json`),
      JSON.stringify(modelTokens, null, 2)
    );
    console.log(`  ✨ Created ${modelName}_seed_tokens.json`);
  }
  
  // 2. Ensure weights folder
  const weightsDir = path.join(modelPath, `${modelName}_weights`);
  try {
    await fs.access(weightsDir);
    console.log(`  ✅ ${modelName}_weights/ exists`);
  } catch {
    await fs.mkdir(weightsDir, { recursive: true });
    console.log(`  ✨ Created ${modelName}_weights/`);
    
    const weightConfig = {
      model: modelName,
      version: "1.0.0",
      architecture: modelName.replace(/-/g, '_'),
      lastUpdated: new Date().toISOString(),
      weights: {
        current: `${modelName}_current_weights.bin`,
        pretrained: `${modelName}_pretrained_weights.bin`,
        checkpoint: `${modelName}_checkpoint_weights.bin`
      },
      trainingMetadata: {
        epochs: 0,
        steps: 0,
        accuracy: 0,
        loss: 0,
        validationAccuracy: 0,
        validationLoss: 0
      }
    };
    
    await fs.writeFile(
      path.join(weightsDir, `${modelName}_weights_config.json`),
      JSON.stringify(weightConfig, null, 2)
    );
    console.log(`  ✨ Created ${modelName}_weights_config.json`);
  }
  
  // 3. Ensure pretrained weights folder
  const pretrainedDir = path.join(modelPath, `${modelName}_pretrained_weights`);
  try {
    await fs.access(pretrainedDir);
    console.log(`  ✅ ${modelName}_pretrained_weights/ exists`);
  } catch {
    await fs.mkdir(pretrainedDir, { recursive: true });
    console.log(`  ✨ Created ${modelName}_pretrained_weights/`);
    
    const pretrainedInfo = {
      model: modelName,
      source: "initialization",
      method: "Xavier/He initialization",
      date: new Date().toISOString(),
      description: "Base pretrained weights for model initialization",
      files: [
        `${modelName}_pretrained_embeddings.bin`,
        `${modelName}_pretrained_encoder.bin`,
        `${modelName}_pretrained_decoder.bin`
      ]
    };
    
    await fs.writeFile(
      path.join(pretrainedDir, `${modelName}_pretrained_info.json`),
      JSON.stringify(pretrainedInfo, null, 2)
    );
    console.log(`  ✨ Created ${modelName}_pretrained_info.json`);
  }
  
  // 4. Ensure YAML instructions
  const ymlPath = path.join(modelPath, `${modelName}_instructions.yml`);
  try {
    await fs.access(ymlPath);
    console.log(`  ✅ ${modelName}_instructions.yml exists`);
  } catch {
    const ymlContent = `# ${modelName.toUpperCase().replace(/-/g, ' ')} Model Instructions

model: ${modelName}
version: "1.0.0"
type: "neural_network"

architecture:
  name: "${modelName}"
  layers: []
  parameters: 0
  
task:
  primary: "Model-specific inference task"
  input: "Task-specific input format"
  output: "Task-specific output format"
  
training:
  enabled: true
  optimizer: "adam"
  learning_rate: 0.001
  batch_size: 32
  epochs: 100
  validation_split: 0.2
  
inference:
  batch_size: 1
  max_sequence_length: 512
  temperature: 1.0
  top_k: 50
  top_p: 0.9
  
seeds:
  location: "./${modelName}_seeds/"
  tokens_file: "${modelName}_seed_tokens.json"
  
weights:
  current: "./${modelName}_weights/${modelName}_current_weights.bin"
  pretrained: "./${modelName}_pretrained_weights/${modelName}_pretrained_embeddings.bin"
  auto_load: true
`;
    
    await fs.writeFile(ymlPath, ymlContent);
    console.log(`  ✨ Created ${modelName}_instructions.yml`);
  }
  
  // 5. Ensure model config
  const configPath = path.join(modelPath, `${modelName}_config.json`);
  try {
    await fs.access(configPath);
    console.log(`  ✅ ${modelName}_config.json exists`);
  } catch {
    const config = {
      model: modelName,
      version: "1.0.0",
      type: "neural_network",
      architecture: {
        input_dim: 512,
        hidden_dim: 1024,
        output_dim: 512,
        num_layers: 6,
        num_heads: 8,
        dropout: 0.1
      },
      hyperparameters: {
        learning_rate: 0.001,
        batch_size: 32,
        max_epochs: 100,
        early_stopping_patience: 10
      },
      paths: {
        seeds: `./${modelName}_seeds/`,
        weights: `./${modelName}_weights/`,
        pretrained: `./${modelName}_pretrained_weights/`,
        checkpoints: `./${modelName}_checkpoints/`
      }
    };
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`  ✨ Created ${modelName}_config.json`);
  }
}

async function migrateLegacySeeds(domainName, domainPath) {
  // Check for root-level JSON files (legacy seeds)
  const files = await fs.readdir(domainPath);
  const jsonFiles = files.filter(f => 
    f.endsWith('.json') && 
    !f.includes('constants') &&
    f !== 'url-lookup.json'
  );
  
  if (jsonFiles.length > 0) {
    console.log(`  📦 Migrating ${jsonFiles.length} legacy seed files...`);
    const seedsDir = path.join(domainPath, `${domainName}_seeds`);
    await fs.mkdir(seedsDir, { recursive: true });
    
    for (const file of jsonFiles) {
      const oldPath = path.join(domainPath, file);
      const newName = file.startsWith(`${domainName}_`) 
        ? file 
        : `${domainName}_seed_${file}`;
      const newPath = path.join(seedsDir, newName);
      
      await fs.rename(oldPath, newPath);
      console.log(`    ${file} -> ${domainName}_seeds/${newName}`);
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  System Completion Script                         ║');
  console.log('║  Completing ALL domains and models                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  // Process all domains
  console.log('\n🌍 Processing Knowledge Domains...\n');
  const domains = await fs.readdir(DOMAINS_DIR, { withFileTypes: true });
  
  for (const domain of domains) {
    if (!domain.isDirectory()) continue;
    
    const domainName = domain.name;
    const domainPath = path.join(DOMAINS_DIR, domainName);
    
    await migrateLegacySeeds(domainName, domainPath);
    await ensureDomainStructure(domainName, domainPath);
  }
  
  // Process all models
  console.log('\n\n🤖 Processing AI Models...\n');
  const models = await fs.readdir(MODELS_DIR, { withFileTypes: true });
  
  for (const model of models) {
    if (!model.isDirectory()) continue;
    if (model.name === 'shared') continue;  // Skip shared folder
    
    const modelName = model.name;
    const modelPath = path.join(MODELS_DIR, modelName);
    
    await ensureModelStructure(modelName, modelPath);
  }
  
  console.log('\n\n╔════════════════════════════════════════════════════╗');
  console.log('║  ✅ System Completion Finished!                    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  console.log('All domains and models now have:');
  console.log('  ✅ Properly prefixed seed folders');
  console.log('  ✅ Properly prefixed weights folders');
  console.log('  ✅ YAML instruction files');
  console.log('  ✅ Configuration files');
  console.log('  ✅ URL lookup configurations (domains)');
  console.log('  ✅ Pretrained weights folders (models)');
  console.log('  ✅ Base tokens and seeds\n');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

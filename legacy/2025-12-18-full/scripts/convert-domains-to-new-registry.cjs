#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOMAINS_DIR = path.join(__dirname, '..', 'src', 'ai', 'knowledge-domains');

// Domains that need conversion (still using old format)
const domainsToConvert = [
  'grammar',
  'nextjs',
  'mathematics',
  'code_review',
  'environment',
  'error_detection',
  'algorithms',
  'internet_search',
  'general_knowledge',
  'typescript',
  'testing',
  'documentation',
  'programming',
  'security',
  'science',
  'data_structures',
  'version_control',
  'react'
];

// Domain metadata
const domainInfo = {
  grammar: { displayName: 'Grammar', description: 'Grammar rules, syntax analysis, and language structure', atomicLevel: 'molecule' },
  nextjs: { displayName: 'Next.js', description: 'Next.js framework, server-side rendering, and app router', atomicLevel: 'molecule' },
  mathematics: { displayName: 'Mathematics', description: 'Mathematical operations, equations, and problem solving', atomicLevel: 'cell' },
  code_review: { displayName: 'Code Review', description: 'Code quality analysis, best practices, and review feedback', atomicLevel: 'organ' },
  environment: { displayName: 'Environment', description: 'Development environment setup, configuration, and tooling', atomicLevel: 'molecule' },
  error_detection: { displayName: 'Error Detection', description: 'Error identification, validation, and diagnostic analysis', atomicLevel: 'molecule' },
  algorithms: { displayName: 'Algorithms', description: 'Algorithm design, complexity analysis, and optimization', atomicLevel: 'molecule' },
  internet_search: { displayName: 'Internet Search', description: 'Web search capabilities, information retrieval, and research', atomicLevel: 'organ' },
  general_knowledge: { displayName: 'General Knowledge', description: 'Broad knowledge base and general information', atomicLevel: 'organ' },
  typescript: { displayName: 'TypeScript', description: 'TypeScript language features, type system, and compilation', atomicLevel: 'molecule' },
  testing: { displayName: 'Testing', description: 'Test design, test-driven development, and quality assurance', atomicLevel: 'molecule' },
  documentation: { displayName: 'Documentation', description: 'Documentation generation, technical writing, and API docs', atomicLevel: 'molecule' },
  programming: { displayName: 'Programming', description: 'General programming concepts, patterns, and paradigms', atomicLevel: 'organ' },
  security: { displayName: 'Security', description: 'Security analysis, vulnerability detection, and secure coding', atomicLevel: 'molecule' },
  science: { displayName: 'Science', description: 'Scientific concepts, research methods, and analysis', atomicLevel: 'cell' },
  data_structures: { displayName: 'Data Structures', description: 'Data structure design, implementation, and usage patterns', atomicLevel: 'molecule' },
  version_control: { displayName: 'Version Control', description: 'Git, version control workflows, and collaboration', atomicLevel: 'molecule' },
  react: { displayName: 'React', description: 'React framework, hooks, components, and state management', atomicLevel: 'molecule' }
};

function convertDomain(domainName) {
  const integrationFile = path.join(DOMAINS_DIR, domainName, `${domainName}_integrationAPI.ts`);
  
  if (!fs.existsSync(integrationFile)) {
    console.log(`⚠️  Skipping ${domainName}: integration file not found`);
    return;
  }

  let content = fs.readFileSync(integrationFile, 'utf8');
  
  // Check if already converted
  if (content.includes('seedDataPath:') && content.includes('modules: []')) {
    console.log(`✅ ${domainName}: already converted`);
    return;
  }

  const info = domainInfo[domainName];
  const domainConstant = `${domainName.toUpperCase()}_DOMAIN`;
  const domainNameVariable = domainName;

  // Add path import if not present
  if (!content.includes("import path from 'path'") && !content.includes('import path from "path"')) {
    content = content.replace(
      /^import/m,
      "import path from 'path'\n\nimport"
    );
  }

  // Add constants after imports
  const constantsToAdd = `
const DOMAIN_NAME = '${domainName}';
const DOMAIN_DIR = path.join(process.cwd(), 'src', 'ai', 'knowledge-domains', DOMAIN_NAME);
`;

  // Insert constants after imports and before export const
  if (!content.includes('const DOMAIN_NAME =') && !content.includes('const DOMAIN_DIR =')) {
    content = content.replace(
      /(\nimport[^\n]+\n)(\nexport const )/,
      `$1${constantsToAdd}$2`
    );
  }

  // Find and replace the registerDomain call
  const oldRegistrationPattern = /domainRegistry\.registerDomain\({[\s\S]*?\}\)/;
  
  const newRegistration = `domainRegistry.registerDomain({
  name: ${domainConstant},
  displayName: '${info.displayName}',
  description: '${info.description}',
  atomicLevel: '${info.atomicLevel}',
  modules: [],
  seedDataPath: path.join(DOMAIN_DIR, \`\${DOMAIN_NAME}_seeds\`),
  learnedDataPath: path.join(DOMAIN_DIR, \`\${DOMAIN_NAME}_learned\`),
  weightsPath: path.join(DOMAIN_DIR, \`\${DOMAIN_NAME}_weights\`),
  enabled: true
})`;

  content = content.replace(oldRegistrationPattern, newRegistration);

  fs.writeFileSync(integrationFile, content, 'utf8');
  console.log(`✅ Converted ${domainName}`);
}

console.log('Converting domains to new registry format...\n');

for (const domain of domainsToConvert) {
  try {
    convertDomain(domain);
  } catch (error) {
    console.error(`❌ Error converting ${domain}:`, error.message);
  }
}

console.log('\n✨ Conversion complete!');

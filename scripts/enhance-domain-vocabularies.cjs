#!/usr/bin/env node

/**
 * Enhance Domain Vocabularies Script
 * Adds comprehensive vocabulary terms to all domains
 * Targets 100+ terms per major domain for production-quality responses
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOMAINS_DIR = path.join(ROOT_DIR, 'src/ai/knowledge-domains');

// ============================================================================
// Enhanced Vocabulary Data
// ============================================================================

const enhancedVocabularies = {
  react: [
    // Core Concepts
    'component', 'props', 'state', 'hooks', 'jsx', 'tsx', 'virtual dom',
    'reconciliation', 'lifecycle', 'rendering', 'fiber', 'synthetic events',
    
    // Hooks
    'useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useCallback',
    'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
    'useTransition', 'useDeferredValue', 'useId', 'useSyncExternalStore',
    'useInsertionEffect',
    
    // Patterns
    'higher-order component', 'render props', 'compound components',
    'controlled components', 'uncontrolled components', 'composition',
    'container pattern', 'presentational components', 'custom hooks',
    
    // State Management
    'context api', 'provider', 'consumer', 'reducer', 'dispatch', 'action',
    'redux', 'zustand', 'jotai', 'recoil', 'mobx', 'flux', 'immutability',
    
    // Performance
    'memoization', 'lazy loading', 'code splitting', 'suspense', 'error boundary',
    'concurrent rendering', 'automatic batching', 'startTransition',
    'useDeferredValue', 'useTransition', 'memo', 'React.memo',
    
    // Forms
    'form handling', 'controlled input', 'uncontrolled input', 'form validation',
    'formik', 'react-hook-form', 'onChange', 'onSubmit', 'form state',
    
    // Routing
    'react router', 'route', 'link', 'navigate', 'useNavigate', 'useParams',
    'useSearchParams', 'useLocation', 'outlet', 'nested routes', 'dynamic routes',
    
    // Server Components (React 18+)
    'server components', 'client components', 'server actions', 'streaming ssr',
    'progressive enhancement', 'use client', 'use server',
    
    // Testing
    'jest', 'react testing library', 'enzyme', 'render', 'screen', 'fireEvent',
    'waitFor', 'userEvent', 'mock', 'snapshot testing',
    
    // Ecosystem
    'create-react-app', 'vite', 'next.js', 'remix', 'gatsby', 'webpack', 'babel',
    'typescript', 'prop-types', 'eslint', 'prettier',
    
    // Common Errors
    'key prop', 'cannot update unmounted component', 'infinite loop',
    'missing dependencies', 'exhaustive deps', 'stale closure', 'race condition',
    
    // Best Practices
    'single responsibility', 'composition over inheritance', 'lift state up',
    'don\'t call hooks conditionally', 'keep components pure', 'avoid prop drilling',
  ],

  typescript: [
    // Core Types
    'type', 'interface', 'string', 'number', 'boolean', 'null', 'undefined',
    'void', 'never', 'any', 'unknown', 'object', 'symbol', 'bigint',
    
    // Type Operations
    'union types', 'intersection types', 'type guards', 'type assertions',
    'type narrowing', 'type inference', 'type aliases', 'generic types',
    'conditional types', 'mapped types', 'template literal types',
    
    // Utility Types
    'Partial', 'Required', 'Readonly', 'Record', 'Pick', 'Omit', 'Exclude',
    'Extract', 'NonNullable', 'Parameters', 'ReturnType', 'InstanceType',
    'ThisParameterType', 'OmitThisParameter', 'Awaited',
    
    // Advanced Concepts
    'generics', 'type parameters', 'constraints', 'extends', 'keyof', 'typeof',
    'indexed access types', 'index signatures', 'discriminated unions',
    'exhaustiveness checking', 'const assertions', 'as const',
    
    // Functions
    'function types', 'arrow functions', 'call signatures', 'construct signatures',
    'overload signatures', 'rest parameters', 'optional parameters',
    'default parameters', 'this parameters',
    
    // Classes
    'class', 'constructor', 'public', 'private', 'protected', 'readonly',
    'static', 'abstract', 'implements', 'extends', 'inheritance',
    'access modifiers', 'getters', 'setters', 'parameter properties',
    
    // Modules
    'import', 'export', 'default export', 'named export', 'namespace',
    'module resolution', 'path mapping', 'declaration files', 'd.ts',
    'ambient declarations', 'triple-slash directives',
    
    // Configuration
    'tsconfig.json', 'strict mode', 'strictNullChecks', 'noImplicitAny',
    'strictFunctionTypes', 'strictBindCallApply', 'strictPropertyInitialization',
    'target', 'module', 'lib', 'jsx', 'declaration', 'sourceMap', 'outDir',
    
    // Decorators
    'decorator', 'class decorator', 'method decorator', 'property decorator',
    'parameter decorator', 'decorator factory', 'metadata reflection',
    
    // Common Patterns
    'builder pattern', 'factory pattern', 'singleton', 'dependency injection',
    'type-safe event emitters', 'discriminated unions for state machines',
    
    // Tools & Ecosystem
    'tsc', 'ts-node', 'esbuild', 'swc', 'tsx', 'typescript-eslint',
    'prettier', 'type checking', 'compilation', 'transpilation',
  ],

  nextjs: [
    // Core Concepts (App Router)
    'app directory', 'pages directory', 'layouts', 'templates', 'loading',
    'error', 'not-found', 'route handlers', 'parallel routes', 'intercepting routes',
    'route groups', 'dynamic routes', 'catch-all routes', 'optional catch-all',
    
    // Server Components
    'server components', 'client components', 'use client', 'use server',
    'server actions', 'async components', 'streaming', 'suspense',
    
    // Data Fetching
    'fetch api', 'caching', 'revalidation', 'static generation', 'incremental static regeneration',
    'server-side rendering', 'client-side fetching', 'getStaticProps', 'getServerSideProps',
    'generateStaticParams', 'revalidate', 'revalidatePath', 'revalidateTag',
    
    // Rendering Strategies
    'static rendering', 'dynamic rendering', 'partial prerendering', 'on-demand revalidation',
    'hybrid rendering', 'edge runtime', 'nodejs runtime',
    
    // Routing
    'Link component', 'useRouter', 'usePathname', 'useSearchParams', 'useParams',
    'router.push', 'router.replace', 'router.refresh', 'router.prefetch',
    'redirect', 'notFound', 'middleware',
    
    // API Routes
    'route handlers', 'api routes', 'NextRequest', 'NextResponse', 'request',
    'response', 'headers', 'cookies', 'params', 'searchParams',
    
    // Middleware
    'middleware.ts', 'matcher', 'NextMiddleware', 'conditional routing',
    'authentication', 'authorization', 'rate limiting',
    
    // Image Optimization
    'next/image', 'Image component', 'fill', 'priority', 'placeholder', 'blur',
    'loader', 'quality', 'formats', 'responsive images', 'lazy loading',
    
    // Font Optimization
    'next/font', 'google fonts', 'local fonts', 'font optimization',
    'variable fonts', 'font display', 'font subsetting',
    
    // Metadata
    'metadata', 'generateMetadata', 'metadata object', 'title', 'description',
    'openGraph', 'twitter', 'robots', 'viewport', 'icons', 'manifest',
    
    // Configuration
    'next.config.js', 'experimental', 'reactStrictMode', 'images', 'rewrites',
    'redirects', 'headers', 'env', 'basePath', 'trailingSlash', 'output',
    
    // Performance
    'code splitting', 'tree shaking', 'bundle analyzer', 'dynamic imports',
    'lazy loading', 'prefetching', 'preloading', 'font optimization',
    
    // Deployment
    'vercel', 'standalone output', 'docker', 'static export', 'edge functions',
    'serverless functions', 'build optimization', 'production build',
    
    // Testing
    'jest', 'playwright', 'cypress', 'testing library', 'e2e testing',
    'unit testing', 'integration testing',
  ],

  programming: [
    // Paradigms
    'object-oriented programming', 'functional programming', 'procedural programming',
    'declarative', 'imperative', 'reactive programming', 'event-driven',
    
    // Core Concepts
    'variables', 'constants', 'functions', 'classes', 'objects', 'arrays',
    'loops', 'conditionals', 'scope', 'closure', 'hoisting', 'recursion',
    
    // Data Structures
    'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash table',
    'heap', 'trie', 'set', 'map', 'dictionary',
    
    // Algorithms
    'sorting', 'searching', 'traversal', 'dynamic programming', 'greedy algorithms',
    'divide and conquer', 'backtracking', 'recursion', 'iteration',
    
    // Patterns
    'design patterns', 'creational patterns', 'structural patterns', 'behavioral patterns',
    'singleton', 'factory', 'observer', 'strategy', 'decorator', 'adapter',
    
    // Principles
    'DRY', 'KISS', 'YAGNI', 'SOLID', 'single responsibility', 'open-closed',
    'liskov substitution', 'interface segregation', 'dependency inversion',
    
    // Error Handling
    'try-catch', 'throw', 'error', 'exception', 'finally', 'error handling',
    'error propagation', 'custom errors', 'error boundaries',
    
    // Async Programming
    'promises', 'async-await', 'callbacks', 'event loop', 'microtasks', 'macrotasks',
    'concurrency', 'parallelism', 'web workers', 'race conditions',
    
    // Memory Management
    'garbage collection', 'memory leaks', 'reference counting', 'weak references',
    'circular references', 'heap', 'stack', 'memory allocation',
    
    // Testing
    'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd',
    'test coverage', 'mocking', 'stubbing', 'assertion', 'test runner',
    
    // Version Control
    'git', 'commit', 'branch', 'merge', 'rebase', 'pull request', 'repository',
    'clone', 'fork', 'remote', 'push', 'pull', 'fetch',
    
    // Best Practices
    'code review', 'pair programming', 'refactoring', 'clean code', 'documentation',
    'comments', 'naming conventions', 'code style', 'linting', 'formatting',
  ],
};

// ============================================================================
// Main Enhancement Logic
// ============================================================================

function enhanceDomainVocabulary(domainName, newTerms) {
  const domainDir = path.join(DOMAINS_DIR, domainName);
  const seedsDir = path.join(domainDir, `${domainName}_seeds`);
  const vocabFile = path.join(seedsDir, `${domainName}_seedVocabulary.json`);

  if (!fs.existsSync(vocabFile)) {
    console.log(`⚠️  Skipping ${domainName}: vocabulary file not found`);
    return { added: 0, total: 0 };
  }

  try {
    // Read existing vocabulary
    const data = fs.readFileSync(vocabFile, 'utf-8');
    const vocabData = JSON.parse(data);

    if (!vocabData.vocabulary) {
      vocabData.vocabulary = [];
    }

    const originalCount = vocabData.vocabulary.length;
    
    // Get existing terms as Set for deduplication
    const existing = new Set(vocabData.vocabulary.map(t => t.toLowerCase()));
    
    // Add new terms (deduplicated)
    let addedCount = 0;
    newTerms.forEach(term => {
      if (!existing.has(term.toLowerCase())) {
        vocabData.vocabulary.push(term);
        existing.add(term.toLowerCase());
        addedCount++;
      }
    });

    // Update metadata
    vocabData.lastUpdated = new Date().toISOString();
    vocabData.totalTerms = vocabData.vocabulary.length;

    // Write back to file
    fs.writeFileSync(vocabFile, JSON.stringify(vocabData, null, 2), 'utf-8');

    return { added: addedCount, total: vocabData.vocabulary.length, original: originalCount };
  } catch (error) {
    console.error(`❌ Error enhancing ${domainName}:`, error.message);
    return { added: 0, total: 0, error: true };
  }
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       DOMAIN VOCABULARY ENHANCEMENT SCRIPT                     ║');
  console.log('║       Target: 100+ terms per major domain                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const results = [];

  for (const [domainName, terms] of Object.entries(enhancedVocabularies)) {
    console.log(`\n📚 Enhancing ${domainName} domain...`);
    const result = enhanceDomainVocabulary(domainName, terms);
    
    if (result.error) {
      console.log(`   ❌ Failed to enhance`);
    } else {
      console.log(`   ✅ Added ${result.added} terms (${result.original} → ${result.total})`);
      results.push({ domain: domainName, ...result });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('ENHANCEMENT SUMMARY');
  console.log('═'.repeat(70) + '\n');

  results.forEach(r => {
    const percentage = ((r.added / r.total) * 100).toFixed(1);
    console.log(`${r.domain.padEnd(20)} ${r.original} → ${r.total} (+${r.added})`);
  });

  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  console.log(`\n✨ Total terms added: ${totalAdded}\n`);
  
  console.log('📝 Next Steps:');
  console.log('  1. Review enhanced vocabularies in each domain');
  console.log('  2. Run: npm run build (to load new vocabularies)');
  console.log('  3. Test chat with domain-specific queries');
  console.log('  4. Generate pretrained weights: node scripts/generate_pretrained_weights.js\n');
}

main();

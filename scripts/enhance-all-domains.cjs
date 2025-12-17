#!/usr/bin/env node

/**
 * Enhance All Domain Vocabularies
 * Comprehensive vocabulary enhancement for all 23 domains
 * Target: 100+ terms per domain for production-quality AI responses
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOMAINS_DIR = path.join(ROOT_DIR, 'src/ai/knowledge-domains');

// ============================================================================
// Comprehensive Vocabulary Data for All Domains
// ============================================================================

const domainVocabularies = {
  mathematics: [
    // Core Concepts
    'algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'probability',
    'number theory', 'set theory', 'logic', 'proof', 'theorem', 'axiom',
    // Operations
    'addition', 'subtraction', 'multiplication', 'division', 'exponent', 'root',
    'derivative', 'integral', 'limit', 'function', 'equation', 'inequality',
    // Advanced Topics
    'matrix', 'vector', 'linear algebra', 'differential equations', 'complex numbers',
    'polynomial', 'logarithm', 'trigonometric functions', 'sine', 'cosine', 'tangent',
    // Analysis
    'continuous', 'discrete', 'convergence', 'divergence', 'series', 'sequence',
    'mean', 'median', 'mode', 'variance', 'standard deviation', 'distribution',
    // Geometry
    'point', 'line', 'plane', 'angle', 'triangle', 'circle', 'polygon',
    'perimeter', 'area', 'volume', 'surface area', 'pythagorean theorem',
    // Set Theory
    'set', 'element', 'subset', 'union', 'intersection', 'complement',
    'cardinality', 'empty set', 'universal set', 'power set',
    // Logic
    'and', 'or', 'not', 'implies', 'if and only if', 'quantifier',
    'truth table', 'tautology', 'contradiction', 'logical equivalence',
    // Number Systems
    'natural numbers', 'integers', 'rational numbers', 'irrational numbers',
    'real numbers', 'prime numbers', 'composite numbers', 'factors', 'multiples',
    // Applications
    'optimization', 'modeling', 'graph theory', 'combinatorics', 'recursion',
    'induction', 'mathematical proof', 'direct proof', 'proof by contradiction',
    'counterexample', 'lemma', 'corollary', 'conjecture', 'hypothesis'
  ],

  science: [
    // Physics
    'force', 'mass', 'energy', 'momentum', 'velocity', 'acceleration',
    'gravity', 'friction', 'newton', 'motion', 'thermodynamics', 'wave',
    'electromagnetic', 'quantum', 'relativity', 'optics', 'mechanics',
    // Chemistry
    'atom', 'molecule', 'element', 'compound', 'reaction', 'bond',
    'ion', 'electron', 'proton', 'neutron', 'periodic table', 'valence',
    'oxidation', 'reduction', 'acid', 'base', 'ph', 'catalyst',
    // Biology
    'cell', 'dna', 'rna', 'protein', 'enzyme', 'gene', 'chromosome',
    'mitosis', 'meiosis', 'evolution', 'natural selection', 'photosynthesis',
    'respiration', 'organism', 'ecosystem', 'species', 'taxonomy',
    // Scientific Method
    'hypothesis', 'experiment', 'observation', 'data', 'analysis', 'conclusion',
    'variable', 'control', 'independent variable', 'dependent variable',
    'theory', 'law', 'model', 'evidence', 'peer review',
    // Measurements
    'meter', 'kilogram', 'second', 'kelvin', 'mole', 'ampere', 'candela',
    'measurement', 'precision', 'accuracy', 'significant figures', 'units',
    // Earth Science
    'geology', 'meteorology', 'oceanography', 'climate', 'weather',
    'rock', 'mineral', 'plate tectonics', 'volcano', 'earthquake',
    // Astronomy
    'planet', 'star', 'galaxy', 'universe', 'solar system', 'orbit',
    'light year', 'black hole', 'nebula', 'comet', 'asteroid', 'telescope'
  ],

  english: [
    // Grammar
    'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition',
    'conjunction', 'interjection', 'article', 'determiner', 'subject',
    'predicate', 'object', 'clause', 'phrase', 'sentence',
    // Parts of Speech
    'common noun', 'proper noun', 'abstract noun', 'concrete noun',
    'transitive verb', 'intransitive verb', 'linking verb', 'auxiliary verb',
    'modal verb', 'infinitive', 'gerund', 'participle',
    // Sentence Structure
    'simple sentence', 'compound sentence', 'complex sentence',
    'compound-complex sentence', 'independent clause', 'dependent clause',
    'subordinate clause', 'relative clause', 'main clause',
    // Tenses
    'present tense', 'past tense', 'future tense', 'present perfect',
    'past perfect', 'future perfect', 'present continuous', 'past continuous',
    'present perfect continuous', 'past perfect continuous',
    // Punctuation
    'period', 'comma', 'semicolon', 'colon', 'apostrophe', 'quotation marks',
    'question mark', 'exclamation mark', 'hyphen', 'dash', 'parentheses',
    'brackets', 'ellipsis', 'slash',
    // Writing
    'paragraph', 'essay', 'thesis', 'topic sentence', 'supporting details',
    'conclusion', 'introduction', 'body', 'transition', 'coherence',
    'cohesion', 'style', 'tone', 'voice', 'audience', 'purpose',
    // Literary Devices
    'metaphor', 'simile', 'personification', 'alliteration', 'assonance',
    'onomatopoeia', 'hyperbole', 'irony', 'symbolism', 'imagery',
    'foreshadowing', 'flashback', 'theme', 'plot', 'character',
    // Reading Comprehension
    'main idea', 'supporting details', 'inference', 'context clues',
    'summarize', 'paraphrase', 'analyze', 'evaluate', 'compare', 'contrast'
  ],

  grammar: [
    // Core Concepts
    'syntax', 'morphology', 'semantics', 'phonetics', 'phonology',
    'parts of speech', 'sentence structure', 'agreement', 'tense', 'mood',
    // Nouns
    'common noun', 'proper noun', 'collective noun', 'abstract noun',
    'concrete noun', 'countable noun', 'uncountable noun', 'possessive noun',
    'singular', 'plural', 'gender', 'case', 'nominative', 'accusative',
    // Verbs
    'action verb', 'linking verb', 'helping verb', 'modal verb',
    'transitive', 'intransitive', 'regular verb', 'irregular verb',
    'infinitive', 'participle', 'gerund', 'conjugation',
    // Adjectives & Adverbs
    'descriptive adjective', 'demonstrative adjective', 'possessive adjective',
    'comparative', 'superlative', 'adverb of manner', 'adverb of place',
    'adverb of time', 'adverb of frequency', 'adverb of degree',
    // Pronouns
    'personal pronoun', 'possessive pronoun', 'reflexive pronoun',
    'intensive pronoun', 'demonstrative pronoun', 'interrogative pronoun',
    'relative pronoun', 'indefinite pronoun', 'antecedent',
    // Clauses & Phrases
    'independent clause', 'dependent clause', 'noun clause', 'adjective clause',
    'adverb clause', 'noun phrase', 'verb phrase', 'prepositional phrase',
    'participial phrase', 'gerund phrase', 'infinitive phrase', 'appositive',
    // Sentence Types
    'declarative', 'interrogative', 'imperative', 'exclamatory',
    'simple sentence', 'compound sentence', 'complex sentence',
    // Modifiers
    'modifier', 'misplaced modifier', 'dangling modifier', 'squinting modifier',
    // Voice & Mood
    'active voice', 'passive voice', 'indicative mood', 'imperative mood',
    'subjunctive mood', 'conditional', 'direct speech', 'indirect speech'
  ],

  algorithms: [
    // Sorting
    'bubble sort', 'selection sort', 'insertion sort', 'merge sort',
    'quick sort', 'heap sort', 'radix sort', 'counting sort', 'bucket sort',
    'shell sort', 'tim sort', 'stable sort', 'in-place sort',
    // Searching
    'linear search', 'binary search', 'jump search', 'interpolation search',
    'exponential search', 'ternary search', 'fibonacci search',
    // Graph Algorithms
    'breadth-first search', 'depth-first search', 'dijkstra', 'bellman-ford',
    'floyd-warshall', 'prim', 'kruskal', 'topological sort', 'strongly connected components',
    'minimum spanning tree', 'shortest path', 'a-star', 'bidirectional search',
    // Dynamic Programming
    'memoization', 'tabulation', 'optimal substructure', 'overlapping subproblems',
    'knapsack', 'longest common subsequence', 'longest increasing subsequence',
    'edit distance', 'matrix chain multiplication', 'coin change',
    // Greedy Algorithms
    'activity selection', 'huffman coding', 'fractional knapsack',
    'job sequencing', 'greedy choice property', 'optimal merge pattern',
    // Divide and Conquer
    'divide and conquer', 'merge', 'split', 'conquer', 'combine',
    'strassen matrix multiplication', 'karatsuba multiplication',
    // Backtracking
    'n-queens', 'sudoku solver', 'hamiltonian path', 'subset sum',
    'graph coloring', 'knight tour', 'rat in maze',
    // String Algorithms
    'pattern matching', 'kmp algorithm', 'rabin-karp', 'boyer-moore',
    'z-algorithm', 'suffix array', 'suffix tree', 'trie', 'aho-corasick',
    // Complexity Analysis
    'time complexity', 'space complexity', 'big-o notation', 'big-omega',
    'big-theta', 'amortized analysis', 'worst case', 'best case', 'average case',
    // Other Important Concepts
    'recursion', 'iteration', 'optimization', 'heuristic', 'approximation',
    'randomized algorithm', 'parallel algorithm', 'online algorithm'
  ],

  data_structures: [
    // Linear Structures
    'array', 'linked list', 'doubly linked list', 'circular linked list',
    'stack', 'queue', 'deque', 'priority queue', 'circular queue',
    // Trees
    'binary tree', 'binary search tree', 'avl tree', 'red-black tree',
    'b-tree', 'b+ tree', 'heap', 'min heap', 'max heap', 'fibonacci heap',
    'trie', 'suffix tree', 'segment tree', 'fenwick tree', 'binary indexed tree',
    // Graphs
    'graph', 'directed graph', 'undirected graph', 'weighted graph',
    'adjacency matrix', 'adjacency list', 'edge list', 'incidence matrix',
    'vertex', 'edge', 'node', 'degree', 'path', 'cycle', 'connected graph',
    // Hash-Based
    'hash table', 'hash map', 'hash set', 'hash function', 'collision',
    'chaining', 'open addressing', 'linear probing', 'quadratic probing',
    'double hashing', 'perfect hashing', 'universal hashing',
    // Advanced Structures
    'disjoint set', 'union find', 'bloom filter', 'skip list',
    'splay tree', 'treap', 'cartesian tree', 'k-d tree', 'quad tree',
    'octree', 'r-tree', 'interval tree', 'range tree',
    // Operations
    'insert', 'delete', 'search', 'update', 'traverse', 'sort', 'merge',
    'split', 'balance', 'rotate', 'heapify', 'push', 'pop', 'peek',
    'enqueue', 'dequeue', 'front', 'rear', 'top', 'bottom',
    // Traversals
    'inorder', 'preorder', 'postorder', 'level order', 'depth first',
    'breadth first', 'iterative', 'recursive',
    // Properties
    'sorted', 'balanced', 'complete', 'full', 'perfect', 'height',
    'depth', 'size', 'capacity', 'empty', 'full', 'leaf node',
    'internal node', 'root', 'parent', 'child', 'sibling', 'ancestor', 'descendant'
  ],

  security: [
    // Core Concepts
    'authentication', 'authorization', 'encryption', 'decryption', 'hashing',
    'digital signature', 'certificate', 'ssl', 'tls', 'https', 'vpn',
    // Cryptography
    'symmetric encryption', 'asymmetric encryption', 'public key', 'private key',
    'aes', 'rsa', 'des', '3des', 'blowfish', 'twofish', 'sha', 'md5',
    'cipher', 'plaintext', 'ciphertext', 'key exchange', 'diffie-hellman',
    // Authentication Methods
    'password', 'biometric', 'two-factor authentication', 'multi-factor authentication',
    'oauth', 'saml', 'jwt', 'session', 'token', 'api key', 'bearer token',
    'basic auth', 'digest auth', 'kerberos', 'ldap', 'sso',
    // Attacks
    'sql injection', 'xss', 'csrf', 'clickjacking', 'phishing', 'man-in-the-middle',
    'ddos', 'dos', 'brute force', 'dictionary attack', 'rainbow table',
    'buffer overflow', 'privilege escalation', 'backdoor', 'trojan', 'malware',
    'ransomware', 'spyware', 'adware', 'rootkit', 'worm', 'virus',
    // Security Practices
    'input validation', 'output encoding', 'sanitization', 'parameterized queries',
    'prepared statements', 'least privilege', 'defense in depth', 'security by design',
    'secure coding', 'code review', 'penetration testing', 'vulnerability assessment',
    // Web Security
    'cors', 'csp', 'x-frame-options', 'content security policy',
    'secure cookie', 'httponly', 'secure flag', 'samesite', 'rate limiting',
    'captcha', 'honeypot', 'web application firewall', 'waf',
    // Network Security
    'firewall', 'intrusion detection system', 'intrusion prevention system',
    'ids', 'ips', 'dmz', 'nat', 'proxy', 'reverse proxy', 'load balancer',
    // Compliance
    'gdpr', 'hipaa', 'pci-dss', 'sox', 'compliance', 'audit', 'access control',
    'rbac', 'abac', 'mac', 'dac', 'zero trust', 'principle of least privilege'
  ],

  testing: [
    // Testing Types
    'unit testing', 'integration testing', 'system testing', 'acceptance testing',
    'regression testing', 'smoke testing', 'sanity testing', 'exploratory testing',
    'functional testing', 'non-functional testing', 'performance testing',
    'load testing', 'stress testing', 'security testing', 'usability testing',
    // Test Methodologies
    'test-driven development', 'tdd', 'behavior-driven development', 'bdd',
    'acceptance test-driven development', 'atdd', 'test first', 'red-green-refactor',
    // Test Structure
    'test case', 'test suite', 'test plan', 'test scenario', 'test data',
    'test fixture', 'setup', 'teardown', 'before', 'after', 'beforeEach', 'afterEach',
    // Assertions
    'assert', 'expect', 'should', 'toBe', 'toEqual', 'toMatch', 'toContain',
    'toBeTruthy', 'toBeFalsy', 'toBeNull', 'toBeUndefined', 'toBeDefined',
    'toThrow', 'toHaveBeenCalled', 'toHaveBeenCalledWith',
    // Test Doubles
    'mock', 'stub', 'spy', 'fake', 'dummy', 'test double', 'mocking',
    'stubbing', 'spying', 'mock function', 'mock implementation',
    // Code Coverage
    'code coverage', 'line coverage', 'branch coverage', 'function coverage',
    'statement coverage', 'path coverage', 'condition coverage', 'coverage report',
    // Testing Frameworks
    'jest', 'mocha', 'jasmine', 'karma', 'pytest', 'junit', 'testng',
    'selenium', 'cypress', 'playwright', 'puppeteer', 'webdriver',
    // Best Practices
    'arrange-act-assert', 'aaa pattern', 'given-when-then', 'test isolation',
    'test independence', 'deterministic tests', 'flaky tests', 'test maintenance',
    'test documentation', 'test naming', 'fast tests', 'reliable tests',
    // Automation
    'test automation', 'ci/cd', 'continuous integration', 'continuous deployment',
    'automated testing', 'test pipeline', 'build automation',
    // API Testing
    'api testing', 'rest api testing', 'graphql testing', 'endpoint testing',
    'status codes', 'request validation', 'response validation', 'postman', 'insomnia'
  ],

  documentation: [
    // Documentation Types
    'technical documentation', 'user documentation', 'api documentation',
    'code documentation', 'system documentation', 'readme', 'wiki', 'handbook',
    'guide', 'tutorial', 'reference', 'specification', 'requirements',
    // Content Elements
    'overview', 'introduction', 'getting started', 'installation', 'configuration',
    'usage', 'examples', 'code snippets', 'screenshots', 'diagrams',
    'flowcharts', 'architecture diagrams', 'uml', 'sequence diagram',
    // API Documentation
    'endpoint', 'method', 'parameters', 'request', 'response', 'status code',
    'authentication', 'authorization', 'rate limiting', 'pagination',
    'filtering', 'sorting', 'error handling', 'versioning',
    // Code Documentation
    'comments', 'inline comments', 'block comments', 'docstring', 'jsdoc',
    'javadoc', 'pydoc', 'xmldoc', 'function signature', 'parameter description',
    'return value', 'exceptions', 'examples', 'usage notes',
    // Structure
    'table of contents', 'index', 'glossary', 'appendix', 'references',
    'changelog', 'release notes', 'version history', 'migration guide',
    // Best Practices
    'clarity', 'conciseness', 'accuracy', 'completeness', 'consistency',
    'up-to-date', 'searchable', 'accessible', 'maintainable', 'versioned',
    // Tools
    'markdown', 'restructuredtext', 'asciidoc', 'confluence', 'notion',
    'sphinx', 'mkdocs', 'docusaurus', 'gitbook', 'swagger', 'openapi',
    'postman', 'readme.io', 'docz', 'storybook',
    // Content Management
    'version control', 'git', 'github', 'gitlab', 'bitbucket', 'pull request',
    'code review', 'documentation review', 'style guide', 'templates',
    // Audience
    'end user', 'developer', 'administrator', 'stakeholder', 'technical audience',
    'non-technical audience', 'beginner', 'advanced', 'expert'
  ],

  version_control: [
    // Core Concepts
    'repository', 'commit', 'branch', 'merge', 'pull', 'push', 'clone', 'fork',
    'checkout', 'stage', 'unstage', 'stash', 'tag', 'remote', 'origin',
    // Git Basics
    'git init', 'git add', 'git commit', 'git status', 'git log', 'git diff',
    'git branch', 'git checkout', 'git merge', 'git pull', 'git push',
    'git clone', 'git fetch', 'git remote', 'git tag', 'git stash',
    // Branching Strategies
    'git flow', 'github flow', 'trunk-based development', 'feature branch',
    'release branch', 'hotfix branch', 'develop branch', 'master branch',
    'main branch', 'topic branch', 'long-lived branch', 'short-lived branch',
    // Merging
    'merge commit', 'fast-forward merge', 'three-way merge', 'recursive merge',
    'octopus merge', 'squash merge', 'rebase', 'cherry-pick', 'merge conflict',
    'conflict resolution', 'merge strategy', 'merge tool',
    // Collaboration
    'pull request', 'code review', 'fork', 'upstream', 'downstream',
    'contributor', 'maintainer', 'collaborator', 'issue', 'milestone',
    'project board', 'discussion', 'wiki', 'gist',
    // Advanced Features
    'git rebase', 'interactive rebase', 'git reflog', 'git bisect',
    'git blame', 'git grep', 'git submodule', 'git subtree', 'git worktree',
    'git hooks', 'pre-commit', 'post-commit', 'pre-push', 'post-receive',
    // Best Practices
    'atomic commits', 'commit message', 'semantic versioning', 'conventional commits',
    'meaningful messages', 'small commits', 'frequent commits', 'branch protection',
    'code owners', 'required reviews', 'status checks', 'ci/cd integration',
    // Platforms
    'github', 'gitlab', 'bitbucket', 'azure devops', 'gitea', 'sourcehut',
    // Operations
    'reset', 'revert', 'amend', 'clean', 'gc', 'prune', 'archive', 'bundle'
  ],

  error_detection: [
    // Error Types
    'syntax error', 'runtime error', 'logical error', 'semantic error',
    'type error', 'reference error', 'null pointer', 'undefined', 'exception',
    'compile-time error', 'link error', 'assertion error', 'validation error',
    // Common Errors
    'off-by-one error', 'division by zero', 'infinite loop', 'stack overflow',
    'memory leak', 'buffer overflow', 'race condition', 'deadlock', 'livelock',
    'undefined behavior', 'integer overflow', 'floating-point error',
    // Detection Methods
    'static analysis', 'dynamic analysis', 'linting', 'type checking',
    'code review', 'peer review', 'automated testing', 'manual testing',
    'profiling', 'debugging', 'logging', 'monitoring', 'error tracking',
    // Tools
    'eslint', 'tslint', 'pylint', 'sonarqube', 'coverity', 'fortify',
    'checkmarx', 'veracode', 'sentry', 'rollbar', 'bugsnag', 'raygun',
    // Debugging Techniques
    'breakpoint', 'step over', 'step into', 'step out', 'watch variable',
    'call stack', 'stack trace', 'backtrace', 'core dump', 'crash report',
    'console logging', 'printf debugging', 'rubber duck debugging',
    // Error Handling
    'try-catch', 'throw', 'exception handling', 'error boundary', 'graceful degradation',
    'fallback', 'retry logic', 'circuit breaker', 'error recovery', 'fail-safe',
    'fail-fast', 'defensive programming', 'input validation', 'preconditions',
    // Best Practices
    'early detection', 'continuous monitoring', 'automated checks', 'code quality metrics',
    'technical debt', 'refactoring', 'code smell', 'anti-pattern', 'design pattern',
    // Analysis Types
    'control flow analysis', 'data flow analysis', 'taint analysis', 'symbolic execution',
    'abstract interpretation', 'model checking', 'formal verification',
    // Metrics
    'cyclomatic complexity', 'cognitive complexity', 'code coverage', 'mutation testing',
    'code churn', 'bug density', 'defect rate', 'mean time to detect', 'mean time to repair'
  ],

  code_review: [
    // Process
    'pull request', 'merge request', 'code review', 'peer review', 'review comments',
    'approval', 'request changes', 'reviewer', 'author', 'assignee', 'codeowners',
    // Review Types
    'formal review', 'informal review', 'walkthrough', 'inspection', 'pair programming',
    'mob programming', 'over-the-shoulder review', 'tool-assisted review',
    // Focus Areas
    'code quality', 'readability', 'maintainability', 'performance', 'security',
    'scalability', 'testability', 'design patterns', 'best practices', 'standards',
    // Code Quality
    'clean code', 'dry principle', 'kiss principle', 'yagni', 'solid principles',
    'single responsibility', 'open-closed', 'liskov substitution', 'interface segregation',
    'dependency inversion', 'separation of concerns', 'modularity',
    // Common Issues
    'code smell', 'technical debt', 'magic numbers', 'hard-coded values',
    'god class', 'long method', 'duplicate code', 'dead code', 'commented code',
    'complex conditionals', 'deep nesting', 'long parameter list',
    // Documentation
    'comments', 'docstrings', 'api documentation', 'readme', 'inline documentation',
    'self-documenting code', 'meaningful names', 'descriptive variables',
    // Testing
    'test coverage', 'unit tests', 'integration tests', 'edge cases', 'error handling',
    'test quality', 'test maintainability', 'test isolation', 'mocking', 'assertions',
    // Security Review
    'input validation', 'sanitization', 'authentication', 'authorization',
    'sql injection', 'xss', 'csrf', 'sensitive data', 'secrets', 'encryption',
    // Performance
    'time complexity', 'space complexity', 'optimization', 'caching', 'lazy loading',
    'memory leaks', 'resource management', 'database queries', 'n+1 problem',
    // Best Practices
    'constructive feedback', 'specific comments', 'actionable feedback', 'positive tone',
    'timely review', 'small pull requests', 'focused changes', 'commit messages',
    // Tools
    'github', 'gitlab', 'bitbucket', 'gerrit', 'phabricator', 'review board',
    'crucible', 'upsource', 'codacy', 'codecov', 'sonarqube'
  ],

  general_knowledge: [
    // Technology
    'artificial intelligence', 'machine learning', 'deep learning', 'neural networks',
    'natural language processing', 'computer vision', 'internet', 'web', 'cloud computing',
    'blockchain', 'cryptocurrency', 'virtual reality', 'augmented reality',
    // Programming
    'algorithm', 'data structure', 'programming language', 'software development',
    'web development', 'mobile development', 'database', 'api', 'framework', 'library',
    // Software Engineering
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'version control',
    'testing', 'debugging', 'deployment', 'monitoring', 'maintenance',
    // Computer Science
    'operating system', 'compiler', 'interpreter', 'memory management', 'process',
    'thread', 'concurrency', 'parallelism', 'networking', 'protocol', 'tcp', 'http',
    // Data & Analytics
    'big data', 'data science', 'data analysis', 'statistics', 'visualization',
    'business intelligence', 'etl', 'data warehouse', 'data lake', 'analytics',
    // Security & Privacy
    'cybersecurity', 'encryption', 'authentication', 'privacy', 'gdpr', 'compliance',
    'vulnerability', 'threat', 'risk', 'security audit', 'penetration testing',
    // Business & Management
    'project management', 'product management', 'stakeholder', 'requirement', 'specification',
    'timeline', 'deadline', 'budget', 'resource', 'risk management', 'quality assurance',
    // Tools & Platforms
    'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'windows', 'macos',
    'vscode', 'intellij', 'eclipse', 'vim', 'emacs', 'terminal', 'shell', 'bash',
    // Web Technologies
    'html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js',
    'express', 'django', 'flask', 'spring', 'asp.net', 'rest api', 'graphql',
    // Databases
    'sql', 'nosql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'database design', 'normalization', 'index', 'query optimization', 'transaction'
  ],

  internet_search: [
    // Search Engines
    'google', 'bing', 'duckduckgo', 'yahoo', 'search engine', 'web search',
    'search query', 'search results', 'search algorithm', 'page rank', 'relevance',
    // Search Techniques
    'keyword search', 'phrase search', 'boolean search', 'advanced search',
    'search operators', 'site search', 'file type search', 'date range search',
    'exact match', 'exclude terms', 'wildcard', 'or operator', 'and operator',
    // SEO
    'search engine optimization', 'seo', 'keywords', 'meta tags', 'title tag',
    'description', 'heading tags', 'alt text', 'backlinks', 'internal links',
    'external links', 'anchor text', 'sitemap', 'robots.txt', 'canonical url',
    // Web Indexing
    'web crawler', 'spider', 'bot', 'indexing', 'crawling', 'scraping',
    'cache', 'snapshot', 'archive', 'robots exclusion protocol',
    // Search Results
    'serp', 'organic results', 'paid results', 'featured snippet', 'knowledge panel',
    'people also ask', 'related searches', 'search suggestions', 'autocomplete',
    // Content Discovery
    'information retrieval', 'content aggregation', 'news aggregator', 'rss feed',
    'bookmark', 'favorite', 'reading list', 'web directory', 'portal',
    // Search Quality
    'precision', 'recall', 'relevance ranking', 'personalization', 'localization',
    'query understanding', 'natural language query', 'voice search', 'image search',
    // Privacy & Security
    'private browsing', 'incognito mode', 'privacy-focused search', 'no tracking',
    'encrypted search', 'safe search', 'content filtering',
    // API & Tools
    'search api', 'google search api', 'custom search engine', 'programmable search',
    'web scraping tools', 'selenium', 'puppeteer', 'beautifulsoup', 'scrapy',
    // Research Methods
    'academic search', 'scholarly articles', 'research papers', 'citations',
    'peer review', 'journal', 'conference', 'database search', 'library search',
    'deep web', 'surface web', 'specialized search engines'
  ],

  system: [
    // Operating Systems
    'operating system', 'kernel', 'user space', 'kernel space', 'system call',
    'process', 'thread', 'task', 'scheduler', 'context switch', 'interrupt',
    // Memory Management
    'memory', 'ram', 'virtual memory', 'paging', 'segmentation', 'heap', 'stack',
    'memory allocation', 'garbage collection', 'memory leak', 'buffer', 'cache',
    // File Systems
    'file system', 'directory', 'file', 'path', 'permission', 'mount', 'unmount',
    'inode', 'block', 'sector', 'partition', 'filesystem hierarchy', 'root',
    // Processes & Threads
    'process management', 'process creation', 'process termination', 'parent process',
    'child process', 'zombie process', 'orphan process', 'daemon', 'service',
    'multithreading', 'multiprocessing', 'concurrency', 'parallelism', 'synchronization',
    // IPC
    'inter-process communication', 'ipc', 'pipe', 'socket', 'message queue',
    'shared memory', 'semaphore', 'mutex', 'lock', 'signal', 'event',
    // I/O
    'input/output', 'i/o', 'buffering', 'blocking', 'non-blocking', 'asynchronous i/o',
    'device driver', 'interrupt handling', 'dma', 'polling', 'stream',
    // System Resources
    'cpu', 'processor', 'core', 'clock', 'register', 'alu', 'control unit',
    'resource allocation', 'resource management', 'utilization', 'throughput',
    // System Architecture
    'architecture', 'x86', 'x64', 'arm', 'risc', 'cisc', 'instruction set',
    'assembly', 'machine code', 'binary', 'bootloader', 'bios', 'uefi',
    // Performance
    'performance monitoring', 'profiling', 'benchmark', 'bottleneck', 'optimization',
    'latency', 'throughput', 'cpu usage', 'memory usage', 'disk usage', 'load average',
    // Security
    'system security', 'access control', 'privilege', 'root', 'administrator',
    'user account', 'group', 'permission', 'authentication', 'authorization',
    'firewall', 'selinux', 'apparmor', 'sandbox', 'isolation'
  ],

  environment: [
    // Development Environments
    'development environment', 'dev env', 'local development', 'ide', 'code editor',
    'text editor', 'terminal', 'console', 'command line', 'cli', 'shell',
    // Environment Types
    'local', 'development', 'staging', 'testing', 'qa', 'uat', 'production',
    'sandbox', 'demo', 'preview', 'continuous integration', 'ci environment',
    // Configuration
    'environment variables', 'env vars', 'config file', 'configuration', 'settings',
    'dotenv', '.env file', 'environment-specific', 'configuration management',
    // Tools
    'docker', 'docker compose', 'vagrant', 'virtualbox', 'vmware', 'virtual machine',
    'container', 'containerization', 'orchestration', 'kubernetes', 'helm',
    // Package Management
    'package manager', 'npm', 'yarn', 'pnpm', 'pip', 'poetry', 'maven', 'gradle',
    'composer', 'bundler', 'cargo', 'go modules', 'nuget', 'apt', 'yum', 'brew',
    // Version Management
    'node version', 'nvm', 'pyenv', 'rbenv', 'jenv', 'goenv', 'version manager',
    'runtime version', 'language version', 'sdk version',
    // Build Tools
    'build tool', 'webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'gulp',
    'grunt', 'make', 'cmake', 'ant', 'msbuild', 'bazel',
    // Development Servers
    'dev server', 'localhost', 'hot reload', 'live reload', 'watch mode',
    'auto-restart', 'nodemon', 'browser-sync', 'webpack-dev-server',
    // Debugging & Monitoring
    'debugger', 'inspector', 'breakpoint', 'logging', 'log level', 'console',
    'error reporting', 'performance monitoring', 'profiler', 'tracing',
    // Dependencies
    'dependency', 'dependency management', 'lock file', 'package.json', 'requirements.txt',
    'gemfile', 'go.mod', 'pom.xml', 'build.gradle', 'composer.json',
    // Path & Location
    'working directory', 'project root', 'source directory', 'build directory',
    'output directory', 'dist', 'lib', 'bin', 'node_modules', 'vendor',
    // Environment Setup
    'setup', 'installation', 'prerequisites', 'dependencies', 'system requirements',
    'compatibility', 'cross-platform', 'platform-specific', 'bootstrapping'
  ],

  repair: [
    // Common Issues
    'bug', 'defect', 'issue', 'problem', 'error', 'failure', 'crash', 'hang',
    'freeze', 'slowdown', 'performance issue', 'memory leak', 'resource leak',
    // Diagnosis
    'troubleshooting', 'diagnosis', 'investigation', 'root cause analysis',
    'error message', 'stack trace', 'log file', 'debug log', 'error log',
    'system log', 'event log', 'trace', 'profiling', 'monitoring',
    // Debugging
    'debugging', 'debugger', 'breakpoint', 'step through', 'step over', 'step into',
    'watch variable', 'inspect', 'console', 'print statement', 'logging',
    // Testing
    'reproduce', 'test case', 'minimal reproduction', 'edge case', 'regression test',
    'unit test', 'integration test', 'smoke test', 'verification', 'validation',
    // Code Analysis
    'code review', 'static analysis', 'linting', 'code inspection', 'complexity analysis',
    'code smell', 'anti-pattern', 'vulnerability scan', 'security audit',
    // Fix Strategies
    'hotfix', 'patch', 'workaround', 'temporary fix', 'permanent fix', 'rollback',
    'revert', 'refactor', 'redesign', 'optimization', 'migration',
    // Common Fixes
    'null check', 'boundary check', 'error handling', 'exception handling',
    'input validation', 'sanitization', 'escape', 'encoding', 'type checking',
    // Performance Repair
    'optimization', 'caching', 'indexing', 'query optimization', 'lazy loading',
    'code splitting', 'minification', 'compression', 'cdn', 'load balancing',
    // Memory Issues
    'memory leak fix', 'garbage collection', 'cleanup', 'disposal', 'resource management',
    'connection pooling', 'object pooling', 'weak reference', 'memory profiling',
    // Compatibility
    'compatibility fix', 'polyfill', 'shim', 'fallback', 'graceful degradation',
    'progressive enhancement', 'cross-browser', 'backward compatibility',
    // Documentation
    'bug report', 'issue tracker', 'changelog', 'release notes', 'fix documentation',
    'known issues', 'workaround documentation', 'patch notes',
    // Prevention
    'preventive measures', 'defensive programming', 'fail-safe', 'fail-fast',
    'error boundary', 'circuit breaker', 'retry logic', 'timeout', 'rate limiting',
    // Tools
    'debugger tool', 'profiler', 'memory profiler', 'performance monitor',
    'log analyzer', 'error tracking', 'sentry', 'bugsnag', 'rollbar', 'crashlytics'
  ],

  data_integrity: [
    // Core Concepts
    'data integrity', 'data quality', 'data accuracy', 'data consistency',
    'data completeness', 'data reliability', 'data validity', 'data correctness',
    // Constraints
    'primary key', 'foreign key', 'unique constraint', 'not null constraint',
    'check constraint', 'default value', 'referential integrity', 'entity integrity',
    // Validation
    'data validation', 'input validation', 'type checking', 'range checking',
    'format validation', 'business rule validation', 'constraint validation',
    'schema validation', 'data verification', 'sanity check',
    // Database Integrity
    'acid properties', 'atomicity', 'consistency', 'isolation', 'durability',
    'transaction', 'commit', 'rollback', 'savepoint', 'two-phase commit',
    // Data Types
    'data type', 'type safety', 'type conversion', 'type coercion', 'casting',
    'numeric type', 'string type', 'date type', 'boolean type', 'null value',
    // Checksums & Hashing
    'checksum', 'hash', 'md5', 'sha', 'crc', 'data fingerprint', 'integrity check',
    'hash verification', 'collision detection', 'data corruption detection',
    // Error Detection
    'parity bit', 'error detection code', 'error correction code', 'redundancy',
    'duplicate detection', 'anomaly detection', 'outlier detection',
    // Data Cleaning
    'data cleaning', 'data scrubbing', 'deduplication', 'normalization',
    'standardization', 'data transformation', 'data enrichment', 'data repair',
    // Backup & Recovery
    'backup', 'restore', 'recovery', 'redundancy', 'replication', 'snapshot',
    'point-in-time recovery', 'disaster recovery', 'failover', 'high availability',
    // Audit & Compliance
    'audit trail', 'audit log', 'change tracking', 'versioning', 'history',
    'compliance', 'data governance', 'data lineage', 'data provenance',
    // Security
    'encryption', 'access control', 'authorization', 'authentication',
    'data masking', 'data anonymization', 'data privacy', 'secure storage',
    // Monitoring
    'data monitoring', 'integrity monitoring', 'anomaly detection', 'alerting',
    'quality metrics', 'data profiling', 'data assessment', 'health check',
    // Testing
    'integrity testing', 'data validation testing', 'consistency testing',
    'accuracy testing', 'completeness testing', 'test data', 'data fixtures'
  ],

  observability: [
    // Core Pillars
    'observability', 'logging', 'monitoring', 'tracing', 'metrics',
    'telemetry', 'instrumentation', 'visibility', 'transparency',
    // Logging
    'log', 'log level', 'debug', 'info', 'warning', 'error', 'fatal', 'trace',
    'log aggregation', 'log analysis', 'log parsing', 'structured logging',
    'log rotation', 'log retention', 'centralized logging', 'log shipping',
    // Metrics
    'metric', 'counter', 'gauge', 'histogram', 'summary', 'timeseries',
    'metric collection', 'metric aggregation', 'metric visualization',
    'performance metrics', 'business metrics', 'custom metrics',
    // Tracing
    'distributed tracing', 'trace', 'span', 'trace id', 'parent span', 'child span',
    'trace context', 'trace propagation', 'trace sampling', 'trace analysis',
    'request tracing', 'transaction tracing', 'call graph', 'flame graph',
    // Monitoring
    'application monitoring', 'infrastructure monitoring', 'network monitoring',
    'real-time monitoring', 'synthetic monitoring', 'uptime monitoring',
    'health check', 'heartbeat', 'status check', 'availability monitoring',
    // Alerting
    'alert', 'alert rule', 'threshold', 'alert condition', 'notification',
    'alert channel', 'alert fatigue', 'on-call', 'escalation', 'incident',
    'pager', 'sms alert', 'email alert', 'slack alert', 'webhook',
    // Performance
    'response time', 'latency', 'throughput', 'error rate', 'saturation',
    'utilization', 'apdex', 'service level objective', 'slo', 'service level indicator',
    'sli', 'service level agreement', 'sla', 'golden signals',
    // Tools
    'prometheus', 'grafana', 'elk stack', 'elasticsearch', 'logstash', 'kibana',
    'datadog', 'new relic', 'dynatrace', 'splunk', 'jaeger', 'zipkin',
    'opentelemetry', 'fluentd', 'loki', 'tempo',
    // Dashboards
    'dashboard', 'visualization', 'graph', 'chart', 'time series', 'heatmap',
    'gauge', 'single stat', 'table', 'pie chart', 'bar chart', 'line chart',
    // Analysis
    'log analysis', 'metric analysis', 'trace analysis', 'anomaly detection',
    'pattern recognition', 'correlation', 'causation', 'root cause analysis',
    'trend analysis', 'capacity planning', 'forecasting'
  ]
};

// ============================================================================
// Main Enhancement Function
// ============================================================================

function enhanceAllDomains() {
  console.log('🚀 Starting comprehensive domain vocabulary enhancement...\n');
  
  let enhanced = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const [domainName, vocabArray] of Object.entries(domainVocabularies)) {
    try {
      const domainDir = path.join(DOMAINS_DIR, domainName);
      const seedsDir = path.join(domainDir, `${domainName}_seeds`);
      const vocabFile = path.join(seedsDir, `${domainName}_seedVocabulary.json`);
      
      // Check if domain directory exists
      if (!fs.existsSync(domainDir)) {
        console.log(`⚠️  Domain directory not found: ${domainName}`);
        skipped++;
        continue;
      }
      
      // Create seeds directory if it doesn't exist
      if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, { recursive: true });
      }
      
      // Create vocabulary object
      const vocabData = {
        domain: domainName,
        version: '1.0.0',
        vocabulary: vocabArray
      };
      
      // Write to file
      fs.writeFileSync(vocabFile, JSON.stringify(vocabData, null, 2), 'utf8');
      
      console.log(`✅ ${domainName}: ${vocabArray.length} terms`);
      enhanced++;
      
    } catch (error) {
      console.error(`❌ Error enhancing ${domainName}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Enhancement Summary:');
  console.log(`  ✅ Enhanced: ${enhanced} domains`);
  console.log(`  ⚠️  Skipped: ${skipped} domains`);
  console.log(`  ❌ Errors: ${errors} domains`);
  console.log('='.repeat(60));
  
  if (enhanced > 0) {
    console.log('\n✨ Success! Run the following to verify:');
    console.log('   node scripts/comprehensive-audit-runner.cjs');
  }
}

// ============================================================================
// Execute
// ============================================================================

if (require.main === module) {
  enhanceAllDomains();
}

module.exports = { enhanceAllDomains, domainVocabularies };

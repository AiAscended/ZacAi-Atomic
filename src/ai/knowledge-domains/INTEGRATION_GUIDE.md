# Integration Guide for Enriched Vocabulary

This guide explains how to integrate the enriched vocabulary data into AI models and applications.

## Quick Start

The enriched vocabulary files are located in `src/ai/knowledge-domains/*/enriched/` directories. Each file is a JSON file containing an array of vocabulary words with rich metadata.

## Loading Vocabulary

### TypeScript/JavaScript

```typescript
// Load a specific vocabulary file
import javascriptVocab from './knowledge-domains/programming/enriched/JavaScript_vocab.json';

// Access the words array
const words = javascriptVocab.words;

// Find a specific word
const wordInfo = words.find(w => w.word === 'variable');
console.log(wordInfo.definition);
console.log(wordInfo.examples);

// Filter by tag
const syntaxWords = words.filter(w => w.tags.includes('syntax'));

// Filter by language level
const beginnerWords = words.filter(w => ['A1', 'A2', 'B1'].includes(w.level));
```

### Python

```python
import json

# Load vocabulary file
with open('knowledge-domains/programming/enriched/JavaScript_vocab.json', 'r') as f:
    vocab = json.load(f)

# Access words
words = vocab['words']

# Find specific word
word_info = next((w for w in words if w['word'] == 'variable'), None)
print(word_info['definition'])

# Filter by tag
syntax_words = [w for w in words if 'syntax' in w['tags']]
```

## Use Cases

### 1. Training Data for Language Models

Use the vocabulary as training data to teach AI models about programming concepts:

```typescript
function prepareTrainingData(vocabularyFiles: string[]): TrainingExample[] {
  const examples: TrainingExample[] = [];
  
  for (const file of vocabularyFiles) {
    const vocab = loadVocabulary(file);
    
    for (const word of vocab.words) {
      // Create training examples from definitions
      examples.push({
        input: `Define: ${word.word}`,
        output: word.definition
      });
      
      // Create examples from usage
      if (word.examples.length > 0) {
        examples.push({
          input: `Show example of: ${word.word}`,
          output: word.examples[0]
        });
      }
    }
  }
  
  return examples;
}
```

### 2. Semantic Search Index

Build a semantic search index for code understanding:

```typescript
import { createEmbeddings } from './embeddings';

async function buildSemanticIndex() {
  const vocab = loadAllVocabulary();
  const index: SemanticIndex = {};
  
  for (const word of vocab) {
    const embedding = await createEmbeddings([
      word.word,
      word.definition,
      ...word.examples,
      ...word.related
    ].join(' '));
    
    index[word.word] = {
      embedding,
      metadata: word
    };
  }
  
  return index;
}
```

### 3. Context-Aware Code Completion

Enhance code completion with vocabulary context:

```typescript
function getCodeCompletionContext(currentWord: string) {
  const vocab = loadVocabulary('programming');
  const wordInfo = vocab.words.find(w => w.word === currentWord);
  
  if (wordInfo) {
    return {
      definition: wordInfo.definition,
      examples: wordInfo.examples,
      relatedTerms: wordInfo.related,
      documentation: wordInfo.notes
    };
  }
  
  return null;
}
```

### 4. Educational Features

Create learning modules using the vocabulary:

```typescript
function generateLearningModule(domain: string, level: string) {
  const vocab = loadVocabulary(domain);
  const levelWords = vocab.words
    .filter(w => w.level === level)
    .sort((a, b) => a.frequency_rank - b.frequency_rank);
  
  return levelWords.map(word => ({
    term: word.word,
    definition: word.definition,
    examples: word.examples,
    practice: generatePracticeQuestions(word)
  }));
}
```

### 5. Natural Language Understanding

Use vocabulary for NLU tasks:

```typescript
function analyzeCode(code: string) {
  const vocab = loadAllVocabulary();
  const tokens = tokenize(code);
  
  return tokens.map(token => {
    const wordInfo = findInVocabulary(vocab, token);
    return {
      token,
      type: wordInfo?.part_of_speech,
      category: wordInfo?.tags,
      definition: wordInfo?.definition
    };
  });
}
```

## Domain-Specific Integration

### Programming Domain

```typescript
// Load all programming-related vocabularies
const programmingVocab = [
  'programming/enriched/JavaScript_vocab.json',
  'programming/enriched/HTML_vocab.json',
  'programming/enriched/CSS_vocab.json',
  'programming/enriched/coding_vocab.json',
  'programming/enriched/system_vocab.json'
].map(loadVocabulary);

// Merge all vocabularies
const allProgrammingWords = programmingVocab
  .flatMap(v => v.words)
  .sort((a, b) => a.priority - b.priority);
```

### Mathematics Domain

```typescript
// Load mathematics concepts
const mathVocab = loadAllFromDomain('mathematics');

// Group by concept type
const geometryWords = mathVocab.filter(w => 
  w.tags.includes('geometry')
);

const algebraWords = mathVocab.filter(w => 
  w.tags.includes('algebra')
);
```

### Security Domain

```typescript
// Load security vocabulary for code analysis
const securityVocab = loadAllFromDomain('security');

// Create security rule checker
function checkSecurityConcept(code: string) {
  for (const concept of securityVocab) {
    if (concept.tags.includes('vulnerability')) {
      // Check if code might have this vulnerability
      if (codeContainsPattern(code, concept.word)) {
        return {
          warning: concept.definition,
          recommendation: concept.notes
        };
      }
    }
  }
}
```

## Best Practices

1. **Lazy Loading**: Load vocabulary files on demand rather than all at once
2. **Caching**: Cache loaded vocabularies in memory for repeated access
3. **Indexing**: Build indices by word, tag, and domain for faster lookups
4. **Versioning**: Track vocabulary file versions for consistency
5. **Updates**: Implement a system to update vocabularies from the source repository

## Advanced Integration

### Building a Vocabulary Service

```typescript
class VocabularyService {
  private cache: Map<string, Vocabulary> = new Map();
  private index: Map<string, VocabularyWord> = new Map();
  
  constructor() {
    this.loadAll();
    this.buildIndex();
  }
  
  private loadAll() {
    const domains = this.getAllDomains();
    for (const domain of domains) {
      const vocab = this.loadDomain(domain);
      this.cache.set(domain, vocab);
    }
  }
  
  private buildIndex() {
    for (const [domain, vocab] of this.cache) {
      for (const word of vocab.words) {
        this.index.set(word.word.toLowerCase(), word);
      }
    }
  }
  
  lookup(term: string): VocabularyWord | null {
    return this.index.get(term.toLowerCase()) || null;
  }
  
  search(query: string, options?: SearchOptions): VocabularyWord[] {
    // Implement fuzzy search, tag filtering, etc.
  }
  
  getRelated(term: string): VocabularyWord[] {
    const word = this.lookup(term);
    if (!word) return [];
    
    return word.related
      .map(r => this.lookup(r))
      .filter(w => w !== null) as VocabularyWord[];
  }
}
```

## Performance Considerations

- **Memory**: Full vocabulary is ~2MB. Consider loading subsets for constrained environments.
- **Parsing**: JSON parsing is fast but can be optimized with binary formats if needed.
- **Search**: For large-scale search, consider using a database or search engine like Elasticsearch.
- **Embeddings**: Pre-compute embeddings and store separately for faster semantic search.

## Future Enhancements

1. Add vocabulary update mechanisms
2. Create vocabulary versioning system
3. Build vocabulary diff and merge tools
4. Add multilingual support
5. Create vocabulary analytics dashboard
6. Implement vocabulary quality metrics

## Support

For questions or issues with vocabulary integration, see:
- Main documentation: `ENRICHED_VOCABULARY.md`
- Domain-specific READMEs in each `enriched/` directory
- Source repository: https://github.com/AiAscended/ZacAi-3.0.0

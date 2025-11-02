# Enriched Programming Vocabulary

This directory contains enriched vocabulary data imported from ZacAi-3.0.0 repository. These files provide comprehensive programming vocabulary with detailed definitions, examples, and metadata.

## Files

- **JavaScript_vocab.json** - JavaScript language vocabulary
- **coding_vocab.json**, **coding_vocab_2.json**, **coding_vocab_3.json** - General coding vocabulary
- **HTML_vocab.json** - HTML vocabulary
- **CSS_vocab.json** - CSS vocabulary
- **Tailwind-css_vocab.json** - Tailwind CSS vocabulary
- **JSON_vocab.json** - JSON vocabulary
- **SVG_vocab.json** - SVG vocabulary
- **DevOps-Ci-CD_vocab.json** - DevOps and CI/CD vocabulary
- **Error-Handling-Debugging_vocab.json** - Error handling and debugging vocabulary
- **system_vocab.json**, **system_vocab_2.json**, **system_vocab_3.json** - System programming vocabulary
- **databases-persistence_vocab.json** - Database and persistence vocabulary
- **Networking-API_vocab.json** - Networking and API vocabulary
- **Dependency-Management_vocab.json** - Dependency management vocabulary
- **Observability-Monitoring_vocab.json** - Observability and monitoring vocabulary

## Structure

Each vocabulary file contains an array of word objects with the following structure:

```json
{
  "words": [
    {
      "priority": 1,
      "word": "string",
      "part_of_speech": "noun",
      "definition": "string",
      "example": "string",
      "examples": ["string"],
      "frequency_rank": number,
      "tags": ["string"],
      "related": ["string"],
      "synonyms": ["string"],
      "antonyms": ["string"],
      "pronunciation": "string",
      "level": "string",
      "language": "string",
      "notes": "string"
    }
  ]
}
```

## Usage

These enriched vocabulary files can be used to:
- Train AI models with comprehensive programming knowledge
- Provide contextual definitions and examples
- Support code understanding and generation
- Enable semantic analysis of programming concepts

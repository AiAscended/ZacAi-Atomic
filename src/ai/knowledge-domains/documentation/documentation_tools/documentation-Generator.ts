/**
 * Documentation Domain Tool: Generator
 * Generates documentation from code
 */

export class DocumentationGenerator {
  generate(code: string, format: string = 'markdown'): {
    documentation: string;
    sections: string[];
  } {
    const normalized = code.trim()
    const sections: string[] = []

    if (!normalized) {
      return {
        documentation: 'No code supplied for documentation generation.',
        sections,
      }
    }

    if (/class\s+\w+/.test(code)) {
      sections.push('Class Overview')
    }
    if (/function\s+\w+/.test(code)) {
      sections.push('Function Summary')
    }

    const doc = `Generated ${format} documentation for provided snippet with ${sections.length || 'no'} structural hints.`

    return {
      documentation: doc,
      sections,
    }
  }
}

export default DocumentationGenerator;

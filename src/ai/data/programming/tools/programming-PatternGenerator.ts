/**
 * File: src/ai/data/programming/tools/programming-PatternGenerator.ts
 * Purpose: Generate common programming patterns and structures
 * Depends on: src/ai/shared/tools/shared-CodeFormatter.ts
 * Depended on by: src/ai/data/programming/programming_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Generate a Singleton pattern
 */
export function generateSingletonPattern(className: string): string {
  return `class ${className} {\n  private static instance: ${className}\n\n  private constructor() {}\n\n  public static getInstance(): ${className} {\n    if (!${className}.instance) {\n      ${className}.instance = new ${className}()\n    }\n    return ${className}.instance\n  }\n}`
}

/**
 * Generate a Factory pattern
 */
export function generateFactoryPattern(productName: string): string {
  return `interface ${productName} {\n  operation(): string\n}\n\nclass ${productName}Factory {\n  public static create(type: string): ${productName} {\n    // Factory implementation\n    throw new Error('Not implemented')\n  }\n}`
}

/**
 * Generate an Observer pattern
 */
export function generateObserverPattern(): string {
  return `interface Observer {\n  update(data: any): void\n}\n\nclass Subject {\n  private observers: Observer[] = []\n\n  attach(observer: Observer): void {\n    this.observers.push(observer)\n  }\n\n  notify(data: any): void {\n    for (const observer of this.observers) {\n      observer.update(data)\n    }\n  }\n}`
}

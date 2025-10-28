/**
 * File: src/ai/data/typescript/tools/typescript-InterfaceGenerator.ts
 * Purpose: Generates TypeScript interfaces from sample data or descriptions
 * Depends on: src/ai/shared/tools/shared-CodeLinter.ts
 * Depended on by: src/ai/data/typescript/typescript_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { CodeLinter } from "../../../shared/tools/shared-CodeLinter"

/**
 * Interface generation result
 */
export interface InterfaceGenerationResult {
  interfaceName: string
  code: string
  properties: Array<{
    name: string
    type: string
    optional: boolean
  }>
  valid: boolean
  issues?: string[]
}

/**
 * TypeScript Interface Generator
 *
 * Generates TypeScript interfaces from:
 * - JSON sample data
 * - Object literals
 * - Descriptions of data structures
 *
 * Features:
 * - Automatic type inference
 * - Optional property detection
 * - Nested interface generation
 * - Code validation using shared linter
 */
export class TypeScriptInterfaceGenerator {
  /**
   * Generates a TypeScript interface from sample JSON data
   * @param data - Sample data object
   * @param interfaceName - Name for the generated interface
   * @returns Generated interface code and metadata
   */
  public static fromJSON(data: unknown, interfaceName: string): InterfaceGenerationResult {
    if (typeof data !== "object" || data === null) {
      throw new Error("Data must be a non-null object")
    }

    const properties: Array<{ name: string; type: string; optional: boolean }> = []
    const lines: string[] = []

    lines.push(`export interface ${interfaceName} {`)

    for (const [key, value] of Object.entries(data)) {
      const type = this.inferType(value)
      const optional = value === null || value === undefined
      properties.push({ name: key, type, optional })

      const optionalMarker = optional ? "?" : ""
      lines.push(`  ${key}${optionalMarker}: ${type};`)
    }

    lines.push("}")

    const code = lines.join("\n")

    // Validate generated code
    const lintResult = CodeLinter.lintTypeScript(code, "typescript")

    return {
      interfaceName,
      code,
      properties,
      valid: lintResult.valid,
      issues: lintResult.issues.map((issue) => issue.message),
    }
  }

  /**
   * Infers TypeScript type from a value
   * @param value - Value to infer type from
   * @returns TypeScript type string
   */
  private static inferType(value: unknown): string {
    if (value === null || value === undefined) {
      return "any"
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "any[]"
      }
      const firstType = this.inferType(value[0])
      return `${firstType}[]`
    }

    if (typeof value === "object") {
      // For nested objects, generate inline type
      const props: string[] = []
      for (const [key, val] of Object.entries(value)) {
        const type = this.inferType(val)
        props.push(`${key}: ${type}`)
      }
      return `{ ${props.join("; ")} }`
    }

    switch (typeof value) {
      case "string":
        return "string"
      case "number":
        return "number"
      case "boolean":
        return "boolean"
      case "function":
        return "Function"
      default:
        return "any"
    }
  }

  /**
   * Generates interface from a description
   * @param description - Natural language description
   * @param interfaceName - Name for the interface
   * @returns Generated interface code
   */
  public static fromDescription(description: string, interfaceName: string): InterfaceGenerationResult {
    const properties: Array<{ name: string; type: string; optional: boolean }> = []
    const lines: string[] = []

    lines.push(`export interface ${interfaceName} {`)

    // Simple pattern matching for common descriptions
    const patterns = [
      { regex: /(\w+)\s+(?:is|:)\s+(?:a\s+)?string/gi, type: "string" },
      { regex: /(\w+)\s+(?:is|:)\s+(?:a\s+)?number/gi, type: "number" },
      { regex: /(\w+)\s+(?:is|:)\s+(?:a\s+)?boolean/gi, type: "boolean" },
      { regex: /(\w+)\s+(?:is|:)\s+(?:an?\s+)?array/gi, type: "any[]" },
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.regex.exec(description)) !== null) {
        const propName = match[1]
        properties.push({ name: propName, type: pattern.type, optional: false })
        lines.push(`  ${propName}: ${pattern.type};`)
      }
    }

    if (properties.length === 0) {
      // Default fallback
      lines.push("  // Add properties based on your requirements")
      lines.push("  [key: string]: any;")
    }

    lines.push("}")

    const code = lines.join("\n")
    const lintResult = CodeLinter.lintTypeScript(code, "typescript")

    return {
      interfaceName,
      code,
      properties,
      valid: lintResult.valid,
      issues: lintResult.issues.map((issue) => issue.message),
    }
  }

  /**
   * Generates a type alias instead of an interface
   * @param data - Sample data
   * @param typeName - Name for the type
   * @returns Generated type code
   */
  public static generateType(data: unknown, typeName: string): string {
    const type = this.inferType(data)
    return `export type ${typeName} = ${type};`
  }

  /**
   * Validates interface code
   * @param code - Interface code to validate
   * @returns Validation result
   */
  public static validate(code: string): { valid: boolean; issues: string[] } {
    const lintResult = CodeLinter.lintTypeScript(code, "typescript")
    return {
      valid: lintResult.valid,
      issues: lintResult.issues.map((issue) => `Line ${issue.line}: ${issue.message}`),
    }
  }
}

// Export singleton instance
export const interfaceGenerator = TypeScriptInterfaceGenerator

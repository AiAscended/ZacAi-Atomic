/**
 * File: src/ai/domain/typescript/tools/typescript-InterfaceGenerator.ts
 * Purpose: Generates TypeScript interfaces from sample data or JSON
 * Depends on: src/ai/shared/tools/shared-CodeFormatter.ts
 * Depended on by: src/ai/data/typescript/typescript_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import { formatCode } from "../../../shared/tools/shared-CodeFormatter"

/**
 * Interface generation options
 */
export interface InterfaceOptions {
  interfaceName?: string
  exportInterface?: boolean
  includeOptional?: boolean
  useReadonly?: boolean
  addComments?: boolean
}

/**
 * Generated interface result
 */
export interface GeneratedInterface {
  code: string
  interfaceName: string
  properties: Array<{ name: string; type: string; optional: boolean }>
}

/**
 * TypeScript Interface Generator - Domain-specific tool for TypeScript
 * Automatically generates TypeScript interfaces from sample data
 */
export class InterfaceGenerator {
  /**
   * Generate TypeScript interface from JSON object
   */
  public static fromObject(data: unknown, options: InterfaceOptions = {}): GeneratedInterface {
    const interfaceName = options.interfaceName || "GeneratedInterface"
    const properties: Array<{ name: string; type: string; optional: boolean }> = []

    if (typeof data !== "object" || data === null) {
      throw new Error("Input must be a non-null object")
    }

    const lines: string[] = []

    // Add export keyword if requested
    if (options.exportInterface !== false) {
      lines.push(`export interface ${interfaceName} {`)
    } else {
      lines.push(`interface ${interfaceName} {`)
    }

    // Process each property
    const obj = data as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      const tsType = this.inferType(value)
      const optional = options.includeOptional && value === null ? "?" : ""
      const readonly = options.useReadonly ? "readonly " : ""

      properties.push({
        name: key,
        type: tsType,
        optional: optional === "?",
      })

      // Add comment if requested
      if (options.addComments) {
        lines.push(`  /** ${this.generateComment(key, value)} */`)
      }

      lines.push(`  ${readonly}${key}${optional}: ${tsType}`)
    }

    lines.push("}")

    const code = formatCode(lines.join("\n"))

    return {
      code,
      interfaceName,
      properties,
    }
  }

  /**
   * Generate interface from JSON string
   */
  public static fromJSON(json: string, options: InterfaceOptions = {}): GeneratedInterface {
    try {
      const data = JSON.parse(json)
      return this.fromObject(data, options)
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Generate interface from array of objects (finds common structure)
   */
  public static fromArray(data: unknown[], options: InterfaceOptions = {}): GeneratedInterface {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Input must be a non-empty array")
    }

    // Merge all objects to find all possible properties
    const merged: Record<string, unknown> = {}

    for (const item of data) {
      if (typeof item === "object" && item !== null) {
        Object.assign(merged, item)
      }
    }

    return this.fromObject(merged, options)
  }

  /**
   * Infer TypeScript type from value
   */
  private static inferType(value: unknown): string {
    if (value === null) return "null"
    if (value === undefined) return "undefined"

    const type = typeof value

    switch (type) {
      case "string":
        return "string"
      case "number":
        return "number"
      case "boolean":
        return "boolean"
      case "object":
        if (Array.isArray(value)) {
          if (value.length === 0) return "unknown[]"
          // Infer array element type from first element
          const elementType = this.inferType(value[0])
          return `${elementType}[]`
        }
        // Nested object - generate inline type
        return this.generateInlineType(value as Record<string, unknown>)
      default:
        return "unknown"
    }
  }

  /**
   * Generate inline type for nested objects
   */
  private static generateInlineType(obj: Record<string, unknown>): string {
    const properties = Object.entries(obj)
      .map(([key, value]) => {
        const tsType = this.inferType(value)
        return `${key}: ${tsType}`
      })
      .join("; ")

    return `{ ${properties} }`
  }

  /**
   * Generate comment for property
   */
  private static generateComment(key: string, value: unknown): string {
    const type = typeof value
    const example = value !== null && value !== undefined ? ` (e.g., ${JSON.stringify(value)})` : ""

    return `${key} property${example}`
  }

  /**
   * Generate multiple interfaces from nested object
   */
  public static fromNestedObject(
    data: unknown,
    baseName = "Root",
    options: InterfaceOptions = {},
  ): GeneratedInterface[] {
    const interfaces: GeneratedInterface[] = []

    if (typeof data !== "object" || data === null) {
      throw new Error("Input must be a non-null object")
    }

    // Generate main interface
    const mainInterface = this.fromObject(data, {
      ...options,
      interfaceName: baseName,
    })
    interfaces.push(mainInterface)

    // Find nested objects and generate interfaces for them
    const obj = data as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const nestedName = `${baseName}${this.capitalize(key)}`
        const nestedInterfaces = this.fromNestedObject(value, nestedName, options)
        interfaces.push(...nestedInterfaces)
      }
    }

    return interfaces
  }

  /**
   * Capitalize first letter
   */
  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

/**
 * Convenience function for quick interface generation
 */
export function generateInterface(data: unknown, interfaceName?: string): string {
  return InterfaceGenerator.fromObject(data, { interfaceName }).code
}

/**
 * Export generator instance
 */
export const interfaceGen = InterfaceGenerator

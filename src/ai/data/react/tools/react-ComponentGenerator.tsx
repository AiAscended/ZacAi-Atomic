"use client"

/**
 * File: src/ai/data/react/tools/react-ComponentGenerator.ts
 * Purpose: Generate React component boilerplate code
 * Depends on: None (standalone tool)
 * Depended on by: src/ai/data/react/react_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Generate a React functional component with TypeScript
 * @param componentName - Name of the component (PascalCase)
 * @param props - Array of prop names and types
 * @param includeState - Whether to include useState hook
 * @returns Generated component code
 */
export function generateReactComponent(
  componentName: string,
  props: Array<{ name: string; type: string }> = [],
  includeState = false,
): string {
  const propsInterface =
    props.length > 0
      ? `interface ${componentName}Props {\n${props.map((p) => `  ${p.name}: ${p.type};`).join("\n")}\n}\n\n`
      : ""

  const propsParam = props.length > 0 ? `{ ${props.map((p) => p.name).join(", ")} }: ${componentName}Props` : ""

  const stateHook = includeState ? `  const [state, setState] = useState<any>(null);\n\n` : ""

  return `${propsInterface}export function ${componentName}(${propsParam}) {\n${stateHook}  return (\n    <div className="${componentName.toLowerCase()}">\n      <h1>${componentName}</h1>\n    </div>\n  );\n}\n`
}

/**
 * Generate a React custom hook
 * @param hookName - Name of the hook (must start with 'use')
 * @param returnType - TypeScript return type
 * @returns Generated hook code
 */
export function generateReactHook(hookName: string, returnType = "void"): string {
  if (!hookName.startsWith("use")) {
    hookName = "use" + hookName.charAt(0).toUpperCase() + hookName.slice(1)
  }

  return `export function ${hookName}(): ${returnType} {\n  // Hook implementation\n  return;\n}\n`
}

/**
 * Generate React Context boilerplate
 * @param contextName - Name of the context
 * @param valueType - TypeScript type for context value
 * @returns Generated context code
 */
export function generateReactContext(contextName: string, valueType = "any"): string {
  return `import { createContext, useContext, ReactNode } from 'react';\n\ninterface ${contextName}Value {\n  // Define your context value type\n  value: ${valueType};\n}\n\nconst ${contextName}Context = createContext<${contextName}Value | undefined>(undefined);\n\nexport function ${contextName}Provider({ children }: { children: ReactNode }) {\n  const value: ${contextName}Value = {\n    value: null as ${valueType},\n  };\n\n  return (\n    <${contextName}Context.Provider value={value}>\n      {children}\n    </${contextName}Context.Provider>\n  );\n}\n\nexport function use${contextName}() {\n  const context = useContext(${contextName}Context);\n  if (context === undefined) {\n    throw new Error('use${contextName} must be used within a ${contextName}Provider');\n  }\n  return context;\n}\n`
}

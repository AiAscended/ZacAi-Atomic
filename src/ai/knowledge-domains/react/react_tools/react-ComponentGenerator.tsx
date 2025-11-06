"use client"

/**
 * File: src/ai/data/react/tools/react-ComponentGenerator.ts
 * Purpose: Generate React functional components with hooks and TypeScript
 * Depends on: src/ai/shared/tools/shared-CodeFormatter.ts
 * Depended on by: src/ai/data/react/react_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

/**
 * Generates a React functional component with TypeScript
 * @param componentName - Name of the component (PascalCase)
 * @param props - Component props interface
 * @param hasState - Whether to include useState hook
 * @param hasEffect - Whether to include useEffect hook
 * @returns Generated React component code
 */
export function generateReactComponent(
  componentName: string,
  props: Record<string, string> = {},
  hasState = false,
  hasEffect = false,
): string {
  const propsInterface =
    Object.keys(props).length > 0
      ? `interface ${componentName}Props {\n${Object.entries(props)
          .map(([key, type]) => `  ${key}: ${type};`)
          .join("\n")}\n}\n\n`
      : ""

  const propsParam = Object.keys(props).length > 0 ? `{ ${Object.keys(props).join(", ")} }: ${componentName}Props` : ""

  const imports = ["import React"]
  if (hasState) imports.push("useState")
  if (hasEffect) imports.push("useEffect")

  const importStatement =
    imports.length > 1 ? `import React, { ${imports.slice(1).join(", ")} } from 'react';` : `import React from 'react';`

  const stateCode = hasState ? `\n  const [state, setState] = useState<string>('');` : ""
  const effectCode = hasEffect ? `\n\n  useEffect(() => {\n    // Effect logic here\n  }, []);` : ""

  return `${importStatement}

${propsInterface}export const ${componentName} = (${propsParam}) => {${stateCode}${effectCode}

  return (
    <div className="${componentName.toLowerCase()}">
      <h1>${componentName}</h1>
    </div>
  );
};

export default ${componentName};
`
}

/**
 * Generates a React custom hook
 * @param hookName - Name of the hook (must start with 'use')
 * @param returnType - TypeScript return type
 * @returns Generated custom hook code
 */
export function generateReactHook(hookName: string, returnType = "void"): string {
  if (!hookName.startsWith("use")) {
    hookName = "use" + hookName.charAt(0).toUpperCase() + hookName.slice(1)
  }

  return `import { useState, useEffect } from 'react';

export const ${hookName} = (): ${returnType} => {
  const [value, setValue] = useState<${returnType}>(null as any);

  useEffect(() => {
    // Hook logic here
  }, []);

  return value;
};

export default ${hookName};
`
}

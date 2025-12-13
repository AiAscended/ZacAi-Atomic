/**
 * File: src/ai/data/typescript/typescript_parser.ts
 * Purpose: Parses TypeScript code structure and extracts AST information
 * Depends on: src/ai/data/typescript/typescript_tokenizer.ts
 * Depended on by: src/ai/data/typescript/typescript_semanticAnalyzer.ts
 * Creator: Vercel v0 Coding Assistant
 */

export type TypescriptDeclarationNodeType =
  | "ImportDeclaration"
  | "ExportDeclaration"
  | "FunctionDeclaration"
  | "ClassDeclaration"
  | "InterfaceDeclaration"

export interface TypescriptDeclarationNode {
  type: TypescriptDeclarationNodeType
  index: number
}

export interface TypescriptASTSummary {
  type: "Program"
  declarations: TypescriptDeclarationNode[]
  imports: TypescriptDeclarationNode[]
  exports: TypescriptDeclarationNode[]
  functions: TypescriptDeclarationNode[]
  classes: TypescriptDeclarationNode[]
  interfaces: TypescriptDeclarationNode[]
}

export function typescriptParser(tokens: string[]): TypescriptASTSummary {
  const ast: TypescriptASTSummary = {
    type: "Program",
    declarations: [],
    imports: [],
    exports: [],
    functions: [],
    classes: [],
    interfaces: [],
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token === "import") {
      const node: TypescriptDeclarationNode = { type: "ImportDeclaration", index: i }
      ast.imports.push(node)
      ast.declarations.push(node)
    } else if (token === "export") {
      const node: TypescriptDeclarationNode = { type: "ExportDeclaration", index: i }
      ast.exports.push(node)
      ast.declarations.push(node)
    } else if (token === "function") {
      const node: TypescriptDeclarationNode = { type: "FunctionDeclaration", index: i }
      ast.functions.push(node)
      ast.declarations.push(node)
    } else if (token === "class") {
      const node: TypescriptDeclarationNode = { type: "ClassDeclaration", index: i }
      ast.classes.push(node)
      ast.declarations.push(node)
    } else if (token === "interface") {
      const node: TypescriptDeclarationNode = { type: "InterfaceDeclaration", index: i }
      ast.interfaces.push(node)
      ast.declarations.push(node)
    }
  }

  return ast
}

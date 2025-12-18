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
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === "import") {
      ast.imports.push({ type: "ImportDeclaration", index: i });
    } else if (token === "export") {
      ast.exports.push({ type: "ExportDeclaration", index: i });
    } else if (token === "function") {
      ast.functions.push({ type: "FunctionDeclaration", index: i });
    } else if (token === "class") {
      ast.classes.push({ type: "ClassDeclaration", index: i });
    } else if (token === "interface") {
      ast.interfaces.push({ type: "InterfaceDeclaration", index: i });
    }
  }

  return ast;
}

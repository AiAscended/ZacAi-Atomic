/**
 * File: src/ai/data/nextjs/nextjs_parser.ts
 * Purpose: Parse Next.js code and queries into structured representations
 * Depends on: nextjs_tokenizer.ts
 * Depended on by: nextjs_semanticAnalyzer.ts, nextjs_inferenceController.ts
 * Creator: Vercel v0 Coding Assistant
 */

import {
  tokenizeNextjsInput,
  type TokenizedNextjsInput,
} from "./nextjs_tokenizer";

export interface NextjsParseResult {
  type:
    | "routing"
    | "server-component"
    | "client-component"
    | "api"
    | "config"
    | "deployment"
    | "question"
    | "general";
  tokens: TokenizedNextjsInput;
  metadata: {
    routerType?: "app" | "pages";
    hasServerComponents: boolean;
    hasClientComponents: boolean;
    hasServerActions: boolean;
    hasMetadata: boolean;
    fileType?: string;
    version?: number;
  };
}

export function parseNextjsInput(input: string): NextjsParseResult {
  const tokens = tokenizeNextjsInput(input);
  const lowerInput = input.toLowerCase();

  const metadata = {
    routerType: undefined as "app" | "pages" | undefined,
    hasServerComponents:
      lowerInput.includes("server component") || lowerInput.includes("rsc"),
    hasClientComponents:
      lowerInput.includes("client component") ||
      lowerInput.includes("use client"),
    hasServerActions:
      lowerInput.includes("server action") || lowerInput.includes("use server"),
    hasMetadata:
      lowerInput.includes("metadata") ||
      lowerInput.includes("generatemetadata"),
    fileType: undefined as string | undefined,
    version: undefined as number | undefined,
  };

  // Detect router type
  if (
    lowerInput.includes("app router") ||
    lowerInput.includes("app directory")
  ) {
    metadata.routerType = "app";
  } else if (
    lowerInput.includes("pages router") ||
    lowerInput.includes("pages directory")
  ) {
    metadata.routerType = "pages";
  }

  // Detect file types
  if (lowerInput.includes("page.tsx") || lowerInput.includes("page.js")) {
    metadata.fileType = "page";
  } else if (
    lowerInput.includes("layout.tsx") ||
    lowerInput.includes("layout.js")
  ) {
    metadata.fileType = "layout";
  } else if (
    lowerInput.includes("route.ts") ||
    lowerInput.includes("route.js")
  ) {
    metadata.fileType = "route-handler";
  } else if (lowerInput.includes("middleware")) {
    metadata.fileType = "middleware";
  }

  // Detect version
  const versionMatch = input.match(/next\.?js\s*(\d+)/i);
  if (versionMatch) {
    metadata.version = Number.parseInt(versionMatch[1]);
  }

  // Determine parse type
  let type: NextjsParseResult["type"] = "general";

  if (
    lowerInput.includes("route") ||
    lowerInput.includes("routing") ||
    lowerInput.includes("navigation")
  ) {
    type = "routing";
  } else if (
    metadata.hasServerComponents ||
    lowerInput.includes("server component")
  ) {
    type = "server-component";
  } else if (
    metadata.hasClientComponents ||
    lowerInput.includes("client component")
  ) {
    type = "client-component";
  } else if (
    lowerInput.includes("api") ||
    metadata.fileType === "route-handler"
  ) {
    type = "api";
  } else if (
    lowerInput.includes("config") ||
    lowerInput.includes("next.config")
  ) {
    type = "config";
  } else if (
    lowerInput.includes("deploy") ||
    lowerInput.includes("vercel") ||
    lowerInput.includes("build")
  ) {
    type = "deployment";
  } else if (
    lowerInput.includes("?") ||
    lowerInput.includes("how") ||
    lowerInput.includes("what")
  ) {
    type = "question";
  }

  return {
    type,
    tokens,
    metadata,
  };
}

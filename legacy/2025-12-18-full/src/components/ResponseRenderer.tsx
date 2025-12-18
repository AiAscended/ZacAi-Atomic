/**
 * File: src/components/ResponseRenderer.tsx
 * Purpose: Renders a modular AI response composed of multiple text and code blocks.
 *
 * Depends on:
 * - src/components/code/CodeBlock.tsx
 *
 * Used by:
 * - src/app/page.tsx
 */

"use client";

import React from "react";
import { CodeBlock } from "./code/CodeBlock";

interface TextBlock {
  id: string;
  content: string;
  type: "paragraph" | "heading" | "list";
}

interface CodeBlockData {
  id: string;
  language: string;
  code: string;
  filename?: string;
}

export interface ResponseRendererProps {
  textBlocks: TextBlock[];
  codeBlocks: CodeBlockData[];
}

/**
 * Renders text paragraphs and syntax-highlighted code blocks with proper formatting
 */
export function ResponseRenderer({
  textBlocks,
  codeBlocks,
}: ResponseRendererProps) {
  return (
    <article className="prose max-w-none">
      {textBlocks.map((block) => (
        <p key={block.id} className="mb-4 whitespace-pre-wrap">
          {block.content}
        </p>
      ))}

      {codeBlocks.map((block) => (
        <CodeBlock
          key={block.id}
          code={block.code}
          language={block.language}
          filename={block.filename}
          showLineNumbers={true}
          className="mb-8"
        />
      ))}
    </article>
  );
}

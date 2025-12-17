/**
 * File: src/components/code/CodeBlock.tsx
 * Purpose: Displays syntax-highlighted code block with copy-to-clipboard,
 * optional filename and language labels, and line numbers.
 *
 * Depends on:
 * - prismjs for syntax highlighting
 * - lucide-react icons for UI controls
 * - src/components/ui/button.tsx for button styling
 */

"use client";

import React, { useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight entire code block
  const highlightedCode = Prism.highlight(
    code,
    Prism.languages[language] || Prism.languages.javascript,
    language,
  );

  // Split code into lines for line numbers display
  const lines = code.split("\n");

  return (
    <div
      className={`relative rounded-lg border border-slate-700 bg-slate-900 text-slate-50 font-mono text-sm ${className ?? ""}`}
    >
      {filename && (
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">{filename}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-20"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>

      <pre className="overflow-x-auto p-4">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="align-top">
                  <td className="pr-2 text-right text-slate-500 select-none tabular-nums w-6">
                    {idx + 1}
                  </td>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        line,
                        Prism.languages[language] || Prism.languages.javascript,
                        language,
                      ),
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        )}
      </pre>
    </div>
  );
}

function SyntaxHighlight({ code, language }: { code: string; language: string }) {
  // Basic syntax highlighting - in production, use Prism.js or similar
  const highlightedCode = applyBasicHighlighting(code, language)

  return <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />
}

function applyBasicHighlighting(code: string, language: string): string {
  let highlighted = code

  // Escape HTML
  highlighted = highlighted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  switch (language.toLowerCase()) {
    case "typescript":
    case "javascript":
    case "tsx":
    case "jsx":
      // Keywords
      highlighted = highlighted.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|interface|type|import|export|from|async|await)\b/g,
        '<span class="text-purple-400">$1</span>',
      )
      // Strings
      highlighted = highlighted.replace(/(["'`])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
      // Comments
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-slate-500">$1</span>')
      break

    case "python":
      // Keywords
      highlighted = highlighted.replace(
        /\b(def|class|return|if|else|elif|for|while|import|from|as|with|try|except|finally)\b/g,
        '<span class="text-purple-400">$1</span>',
      )
      // Strings
      highlighted = highlighted.replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
      // Comments
      highlighted = highlighted.replace(/(#.*$)/gm, '<span class="text-slate-500">$1</span>')
      break
  }

  return highlighted
}

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

  // Copy code text to clipboard and show feedback icon temporarily
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
        <div className="flex justify-between bg-slate-800 border-b border-slate-700 px-4 py-2 text-xs text-slate-400 select-none">
          <span className="truncate max-w-[85%]">{filename}</span>
          <span>{language}</span>
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

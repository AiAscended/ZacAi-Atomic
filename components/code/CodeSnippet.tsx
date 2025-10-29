/**
 * File: components/code/CodeSnippet.tsx
 * Purpose: Syntax-highlighted code display with copy-to-clipboard functionality
 * Depends on: react, prismjs (for syntax highlighting)
 * Depended on by: app/page.tsx, app/admin/domains/[domain]/page.tsx
 * Creator: Vercel v0 Coding Assistant
 */

"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CodeSnippetProps {
  code: string
  language: string
  showLineNumbers?: boolean
  maxHeight?: string
  fileName?: string
  snippetId?: string
}

export function CodeSnippet({
  code,
  language,
  showLineNumbers = true,
  maxHeight = "500px",
  fileName,
  snippetId,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy code:", error)
    }
  }

  const lines = code.split("\n")

  return (
    <div className="relative rounded-lg border bg-muted/50 overflow-hidden">
      {/* Header with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
          {fileName && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs font-mono text-foreground">{fileName}</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-sm">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <div className="flex">
                {/* Line numbers */}
                <div className="select-none pr-4 text-muted-foreground/50 text-right">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code lines */}
                <div className="flex-1">
                  {lines.map((line, i) => (
                    <div key={i}>{line || "\n"}</div>
                  ))}
                </div>
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>

      {/* Snippet ID for reference */}
      {snippetId && (
        <div className="px-4 py-1 border-t bg-muted/50">
          <span className="text-xs text-muted-foreground font-mono">ID: {snippetId}</span>
        </div>
      )}
    </div>
  )
}

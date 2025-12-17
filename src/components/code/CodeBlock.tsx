"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ code, language, filename, showLineNumbers = true, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split("\n")

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border", className)}>
      {filename && (
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-mono text-muted-foreground">{filename}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}

      <div className="relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>

        <pre className="p-4 overflow-x-auto bg-slate-950 text-slate-50">
          <code className="font-mono text-sm">
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="pr-4 text-right text-slate-500 select-none w-8">{idx + 1}</td>
                      <td className="text-slate-50">
                        <SyntaxHighlight code={line} language={language} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <SyntaxHighlight code={code} language={language} />
            )}
          </code>
        </pre>
      </div>
    </div>
  )
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
